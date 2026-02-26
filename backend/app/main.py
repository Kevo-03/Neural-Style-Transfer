from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.db import create_db_and_tables
from app.config import settings
from .routers import nst, auth
import os

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

os.makedirs("ml_engine/output", exist_ok=True)
app.mount("/output", StaticFiles(directory="ml_engine/output"), name="output")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url], # Allow Next.js
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (POST, GET, etc.)
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(nst.router, tags=["Style Transfer"])
app.include_router(auth.router, tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "NST API is running!"}