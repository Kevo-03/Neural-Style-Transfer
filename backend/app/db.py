from sqlmodel import SQLModel, create_engine, Session
from app.config import settings
import app.models

database_url = settings.database_url

is_sqlite = database_url.startswith("sqlite")
engine_args = {"connect_args": {"check_same_thread": False}} if is_sqlite else {}

engine = create_engine(database_url, **engine_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session