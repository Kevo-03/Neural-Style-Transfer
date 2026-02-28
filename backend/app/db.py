from sqlmodel import SQLModel, create_engine, Session
from app.config import settings
import app.models

# 1. Fetch the database URL dynamically from your config
database_url = settings.database_url

# 2. Safety Check: Only apply the thread fix if the URL is actually SQLite
is_sqlite = database_url.startswith("sqlite")
engine_args = {"connect_args": {"check_same_thread": False}} if is_sqlite else {}

# 3. Create the Engine dynamically
engine = create_engine(database_url, **engine_args)

def create_db_and_tables():
    """Creates all tables defined in models.py"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency that gives a fresh database session to each API request"""
    with Session(engine) as session:
        yield session