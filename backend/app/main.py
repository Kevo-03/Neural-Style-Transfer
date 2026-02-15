from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIC ---
    print("Starting up...")
    create_db_and_tables()
    print("Database tables created!")
    
    yield  # <--- This is where the app runs and handles requests
    
    # --- SHUTDOWN LOGIC ---
    print("Shutting down...")
    # (If you had a Redis connection to close, you would do it here)

app = FastAPI(
    title="Neural Style Transfer API", 
    lifespan=lifespan
)

@app.get("/")
def root():
    return {"message": "NST API is running!"}