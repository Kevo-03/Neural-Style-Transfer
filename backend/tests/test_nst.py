import io
import pytest
from unittest.mock import patch, MagicMock
from sqlmodel import select
from app.models import Image, User

MOCK_BASE_URL = "https://test-bucket.nyc3.cdn.digitaloceanspaces.com"


def _fake_upload_file(name="test.jpg", content=b"fake-image-bytes", content_type="image/jpeg"):
    """Create a fake in-memory file for multipart upload."""
    return (name, io.BytesIO(content), content_type)


# ══════════════════════════════════════════════════════════════════════════
# ROOT
# ══════════════════════════════════════════════════════════════════════════

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "NST API is running!"}


# ══════════════════════════════════════════════════════════════════════════
# POST /generate
# ══════════════════════════════════════════════════════════════════════════

@patch("app.routers.nst.celery_app.send_task")
def test_generate_image_success(mock_send_task, authenticated_client, session, mock_spaces):
    mock_task = MagicMock()
    mock_task.id = "celery-task-id-123"
    mock_send_task.return_value = mock_task

    response = authenticated_client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file("content.jpg"),
            "style_file": _fake_upload_file("style.jpg"),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "submitted"
    assert data["job_id"] == "celery-task-id-123"
    assert "database_id" in data

    # verify DB record
    image = session.get(Image, data["database_id"])
    assert image is not None
    assert image.status == "PENDING"
    assert image.content_path.startswith(MOCK_BASE_URL)
    assert image.style_path.startswith(MOCK_BASE_URL)

    # verify files actually landed in mock S3
    content_key = image.content_path.replace(f"{MOCK_BASE_URL}/", "")
    style_key = image.style_path.replace(f"{MOCK_BASE_URL}/", "")
    mock_spaces.head_object(Bucket="test-bucket", Key=content_key)
    mock_spaces.head_object(Bucket="test-bucket", Key=style_key)


def test_generate_image_unauthenticated(client):
    response = client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file(),
            "style_file": _fake_upload_file(),
        },
    )
    assert response.status_code == 401


def test_generate_image_invalid_mime(authenticated_client):
    response = authenticated_client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file("content.pdf", content_type="application/pdf"),
            "style_file": _fake_upload_file("style.jpg"),
        },
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_generate_image_invalid_extension(authenticated_client):
    response = authenticated_client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file("content.jpg"),
            "style_file": _fake_upload_file("style.exe", content_type="image/jpeg"),  # Fake mime but bad extension
        },
    )
    assert response.status_code == 400
    assert "Unsupported image format" in response.json()["detail"]


def test_generate_image_too_large(authenticated_client):
    # Generating 21 MB of fake bytes
    big_content = b"0" * (21 * 1024 * 1024)
    response = authenticated_client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file("content.jpg", content=big_content),
            "style_file": _fake_upload_file("style.jpg"),
        },
    )
    assert response.status_code == 413
    assert "too large" in response.json()["detail"]


@patch("app.routers.nst.upload_to_spaces")
def test_generate_image_upload_failure(mock_upload, authenticated_client):
    """upload_to_spaces returning None can't be triggered via moto,
    so we patch it directly for this error-handling test."""
    mock_upload.return_value = None

    response = authenticated_client.post(
        "/generate",
        files={
            "content_file": _fake_upload_file(),
            "style_file": _fake_upload_file(),
        },
    )

    assert response.status_code == 500
    assert "upload" in response.json()["detail"].lower()


# ══════════════════════════════════════════════════════════════════════════
# GET /status/{image_id}
# ══════════════════════════════════════════════════════════════════════════

def test_get_image_status_success(authenticated_client, session, mock_spaces):
    user = session.exec(select(User).where(User.username == "user_a")).first()

    # seed mock S3 with a result object
    mock_spaces.put_object(Bucket="test-bucket", Key="result/1.jpg", Body=b"result-data")

    image = Image(
        user_id=user.id,
        content_path=f"{MOCK_BASE_URL}/content/1.jpg",
        style_path=f"{MOCK_BASE_URL}/style/1.jpg",
        result_path=f"{MOCK_BASE_URL}/result/1.jpg",
        status="COMPLETED",
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    response = authenticated_client.get(f"/status/{image.id}")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == image.id
    assert data["status"] == "COMPLETED"
    assert data["result"] is not None  # presigned URL generated by moto


def test_get_image_status_not_found(authenticated_client):
    response = authenticated_client.get("/status/9999")
    assert response.status_code == 400
    assert response.json()["detail"] == "Image job not found"


def test_get_image_status_forbidden(authenticated_client, second_authenticated_client, session, mock_spaces):
    user_a = session.exec(select(User).where(User.username == "user_a")).first()
    image = Image(
        user_id=user_a.id,
        content_path=f"{MOCK_BASE_URL}/c.jpg",
        style_path=f"{MOCK_BASE_URL}/s.jpg",
        status="PENDING",
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    # user_b tries to access user_a's image
    response = second_authenticated_client.get(f"/status/{image.id}")
    assert response.status_code == 403


# ══════════════════════════════════════════════════════════════════════════
# GET /library
# ══════════════════════════════════════════════════════════════════════════

def test_get_library_success(authenticated_client, session, mock_spaces):
    user = session.exec(select(User).where(User.username == "user_a")).first()

    img1 = Image(
        user_id=user.id, content_path=f"{MOCK_BASE_URL}/c1.jpg",
        style_path=f"{MOCK_BASE_URL}/s1.jpg", status="COMPLETED",
        result_path=f"{MOCK_BASE_URL}/r1.jpg",
    )
    img2 = Image(
        user_id=user.id, content_path=f"{MOCK_BASE_URL}/c2.jpg",
        style_path=f"{MOCK_BASE_URL}/s2.jpg", status="PENDING",
    )
    session.add_all([img1, img2])
    session.commit()

    response = authenticated_client.get("/library")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_library_empty(authenticated_client):
    response = authenticated_client.get("/library")
    assert response.status_code == 200
    assert response.json() == []


def test_get_library_isolation(authenticated_client, second_authenticated_client, session, mock_spaces):
    user_a = session.exec(select(User).where(User.username == "user_a")).first()
    user_b = session.exec(select(User).where(User.username == "user_b")).first()

    session.add(Image(
        user_id=user_a.id, content_path=f"{MOCK_BASE_URL}/a.jpg",
        style_path=f"{MOCK_BASE_URL}/a.jpg", status="PENDING",
    ))
    session.add(Image(
        user_id=user_b.id, content_path=f"{MOCK_BASE_URL}/b.jpg",
        style_path=f"{MOCK_BASE_URL}/b.jpg", status="PENDING",
    ))
    session.commit()

    # user_a should only see their own image
    response = authenticated_client.get("/library")
    assert len(response.json()) == 1


# ══════════════════════════════════════════════════════════════════════════
# DELETE /library/{image_id}
# ══════════════════════════════════════════════════════════════════════════

def test_delete_image_success(authenticated_client, session, mock_spaces):
    user = session.exec(select(User).where(User.username == "user_a")).first()

    # seed mock S3 with objects
    mock_spaces.put_object(Bucket="test-bucket", Key="content/del.jpg", Body=b"c")
    mock_spaces.put_object(Bucket="test-bucket", Key="style/del.jpg", Body=b"s")
    mock_spaces.put_object(Bucket="test-bucket", Key="result/del.jpg", Body=b"r")

    image = Image(
        user_id=user.id,
        content_path=f"{MOCK_BASE_URL}/content/del.jpg",
        style_path=f"{MOCK_BASE_URL}/style/del.jpg",
        result_path=f"{MOCK_BASE_URL}/result/del.jpg",
        status="COMPLETED",
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    response = authenticated_client.delete(f"/library/{image.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Image and cloud files deleted successfully"

    # verify removed from DB
    assert session.get(Image, image.id) is None

    # verify objects removed from mock S3
    remaining = mock_spaces.list_objects_v2(Bucket="test-bucket")
    assert remaining.get("KeyCount", 0) == 0


def test_delete_image_not_found(authenticated_client):
    response = authenticated_client.delete("/library/9999")
    assert response.status_code == 404


def test_delete_image_forbidden(authenticated_client, second_authenticated_client, session, mock_spaces):
    user_a = session.exec(select(User).where(User.username == "user_a")).first()
    image = Image(
        user_id=user_a.id, content_path=f"{MOCK_BASE_URL}/c.jpg",
        style_path=f"{MOCK_BASE_URL}/s.jpg", status="PENDING",
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    # user_b tries to delete user_a's image
    response = second_authenticated_client.delete(f"/library/{image.id}")
    assert response.status_code == 403
    assert session.get(Image, image.id) is not None


# ══════════════════════════════════════════════════════════════════════════
# POST /generate-public
# ══════════════════════════════════════════════════════════════════════════

@patch("app.routers.nst.celery_app.send_task")
def test_generate_public_success(mock_send_task, client, mock_spaces):
    mock_task = MagicMock()
    mock_task.id = "public-task-123"
    mock_send_task.return_value = mock_task

    response = client.post(
        "/generate-public",
        files={
            "content_file": _fake_upload_file(),
            "style_file": _fake_upload_file(),
        },
    )

    assert response.status_code == 200
    assert response.json()["task_id"] == "public-task-123"


# ══════════════════════════════════════════════════════════════════════════
# GET /status/public/{task_id}
# These endpoints only read Celery AsyncResult — no DB or S3 interaction,
# so we mock AsyncResult directly rather than using moto.
# ══════════════════════════════════════════════════════════════════════════

@patch("app.routers.nst.AsyncResult")
def test_public_status_processing(mock_async_result, client):
    mock_result = MagicMock()
    mock_result.state = "PENDING"
    mock_async_result.return_value = mock_result

    response = client.get("/status/public/some-task-id")
    assert response.status_code == 200
    assert response.json()["status"] == "PROCESSING"


@patch("app.routers.nst.get_presigned_url", side_effect=lambda url: f"signed-{url}")
@patch("app.routers.nst.AsyncResult")
def test_public_status_success(mock_async_result, mock_presign, client):
    mock_result = MagicMock()
    mock_result.state = "SUCCESS"
    mock_result.result = {"status": "COMPLETED", "result_url": "result/pub.jpg"}
    mock_async_result.return_value = mock_result

    response = client.get("/status/public/some-task-id")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["result_url"] == "signed-result/pub.jpg"


@patch("app.routers.nst.AsyncResult")
def test_public_status_failure(mock_async_result, client):
    mock_result = MagicMock()
    mock_result.state = "FAILURE"
    mock_result.info = Exception("GPU ran out of memory")
    mock_async_result.return_value = mock_result

    response = client.get("/status/public/some-task-id")
    assert response.status_code == 200
    assert response.json()["status"] == "FAILED"


# ══════════════════════════════════════════════════════════════════════════
# CELERY EAGER MODE — round-trip tests
# Tests the real Celery dispatch → result flow using a lightweight mock
# task registered with task_always_eager=True. No Redis broker needed.
# ══════════════════════════════════════════════════════════════════════════

def test_generate_public_roundtrip(client, mock_spaces, celery_eager):
    """Full round-trip: POST /generate-public dispatches a real Celery task
    (eager mode), then GET /status/public/{task_id} retrieves the real result
    from AsyncResult — no mocking of Celery at all."""
    response = client.post(
        "/generate-public",
        files={
            "content_file": _fake_upload_file(),
            "style_file": _fake_upload_file(),
        },
    )

    assert response.status_code == 200
    task_id = response.json()["task_id"]

    # task ran eagerly — AsyncResult should have the real result
    status_response = client.get(f"/status/public/{task_id}")
    assert status_response.status_code == 200

    data = status_response.json()
    assert data["status"] == "completed"
    assert "result_url" in data


@patch("app.routers.nst.celery_app.send_task", side_effect=Exception("Broker unreachable"))
def test_generate_public_celery_down(mock_send_task, client, mock_spaces):
    """When Celery broker is unreachable the endpoint should return 500
    and clean up both uploaded files so they don't orphan in the bucket."""
    response = client.post(
        "/generate-public",
        files={
            "content_file": _fake_upload_file(),
            "style_file": _fake_upload_file(),
        },
    )

    assert response.status_code == 500
    assert "queue" in response.json()["detail"].lower()

    # Both uploaded files must have been deleted — bucket should be empty
    remaining = mock_spaces.list_objects_v2(Bucket="test-bucket")
    assert remaining.get("KeyCount", 0) == 0
