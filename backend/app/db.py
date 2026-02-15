from sqlmodel import SQLModel, create_engine, Session

# 1. Setup SQLite (Simple file-based DB)
# In production, we just change this URL to a PostgreSQL URL!
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. Create the Engine
# check_same_thread=False is needed only for SQLite
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """Creates the 'database.db' file and all tables defined in models.py"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency that gives a fresh database session to each API request"""
    with Session(engine) as session:
        yield session