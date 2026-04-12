import pytest
import boto3
from moto import mock_aws
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from app.db import get_session
from app.main import app

# ── database ─────────────────────────────────────────────────────────────

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        app.dependency_overrides[get_session] = lambda: session
        yield session
        app.dependency_overrides.clear()
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    yield TestClient(app)

@pytest.fixture(autouse=True, name="mock_rate_limiter_storage_fixture")
def mock_rate_limiter_storage_fixture():
    """
    Isolate rate limit state between tests.

    slowapi captures the key_func by reference at decoration time into each
    Limit object. Patching the module-level name has no effect. The only
    reliable fix is to directly swap key_func on every stored Limit object.

    Each test gets a unique UUID as its "IP", so rate-limit buckets never
    bleed between tests.
    """
    import uuid
    from app.rate_limiter import limiter

    unique_ip = str(uuid.uuid4())
    unique_key_func = lambda request: unique_ip  # noqa: E731

    # Collect all Limit objects from all routes
    all_limits = [
        lim
        for limits in limiter._route_limits.values()
        for lim in limits
    ]

    originals = {}
    for lim in all_limits:
        originals[id(lim)] = lim.key_func
        lim.key_func = unique_key_func

    yield

    for lim in all_limits:
        lim.key_func = originals[id(lim)]

# ── auth helpers ─────────────────────────────────────────────────────────

def _signup_and_login(client: TestClient, username: str, password: str = "testpass123"):
    """Sign up, log in, and set the auth cookie on the client."""
    client.post("/auth/signup", json={"username": username, "password": password})
    login_res = client.post("/auth/login", data={"username": username, "password": password})
    token = login_res.headers.get("set-cookie").split("access_token=")[1].split(";")[0]
    client.cookies.set("access_token", token)
    return client

@pytest.fixture(name="authenticated_client")
def authenticated_client_fixture(session: Session):
    """TestClient logged in as user_a."""
    client = TestClient(app)
    return _signup_and_login(client, "user_a")

@pytest.fixture(name="second_authenticated_client")
def second_authenticated_client_fixture(session: Session):
    """Separate TestClient logged in as user_b (for cross-user tests)."""
    client = TestClient(app)
    return _signup_and_login(client, "user_b")

# ── moto S3 mock (DigitalOcean Spaces) ───────────────────────────────────

MOCK_SPACE_NAME = "test-bucket"
MOCK_SPACE_REGION = "nyc3"

@pytest.fixture(name="mock_spaces")
def mock_spaces_fixture():
    """Mock S3 backend via moto. Patches app.storage.s3_client and settings."""
    with mock_aws():
        mock_client = boto3.client("s3", region_name=MOCK_SPACE_REGION)
        mock_client.create_bucket(
            Bucket=MOCK_SPACE_NAME,
            CreateBucketConfiguration={"LocationConstraint": MOCK_SPACE_REGION},
        )

        mock_settings = MagicMock()
        mock_settings.do_space_name = MOCK_SPACE_NAME
        mock_settings.do_space_region = MOCK_SPACE_REGION

        with patch("app.storage.s3_client", mock_client), \
             patch("app.storage.settings", mock_settings):
            yield mock_client

# ── Celery eager mode ────────────────────────────────────────────────────

@pytest.fixture(name="celery_eager")
def celery_eager_fixture():
    """Configure celery for eager (synchronous) execution with a mock task.
    
    Celery's send_task ignores task_always_eager, so we patch send_task to
    route through the registered mock task's .apply() instead.
    Uses cache:// backend + task_store_eager_result so AsyncResult can
    retrieve results without Redis.
    """
    from app.routers.nst import celery_app

    @celery_app.task(name="generate_art")
    def mock_generate_art(content_url, style_url, image_id=None, is_public=False):
        return {"status": "completed", "result_url": "result/mock_output.jpg"}

    original_backend = celery_app.conf.result_backend
    celery_app.conf.update(
        task_always_eager=True,
        task_eager_propagates=True,
        task_store_eager_result=True,
        result_backend="cache+memory://",
    )
    # Force backend re-initialization: deleting from __dict__ clears the
    # cached value so the lazy property re-creates it from config
    celery_app.__dict__.pop("_backend", None)

    def eager_send_task(name, args=None, kwargs=None, **opts):
        task = celery_app.tasks[name]
        return task.apply(args=args, kwargs=kwargs)

    with patch.object(celery_app, "send_task", side_effect=eager_send_task):
        yield celery_app

    celery_app.conf.update(
        task_always_eager=False,
        task_eager_propagates=False,
        task_store_eager_result=False,
        result_backend=original_backend,
    )
    celery_app.__dict__.pop("_backend", None)