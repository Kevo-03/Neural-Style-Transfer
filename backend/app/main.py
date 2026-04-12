from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db import create_db_and_tables
from app.config import settings
from .routers import nst, auth
import os
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.rate_limiter import limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    create_db_and_tables()
    print("Database tables created!")
    
    yield  
    
    print("Shutting down...")

app = FastAPI(
    title="Neural Style Transfer API", 
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

raw_origins = settings.frontend_url.split(",")
origins = [origin.strip() for origin in raw_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(nst.router, tags=["Style Transfer"])
app.include_router(auth.router, tags=["Authentication"])

@app.get("/")
def root():
    return {"message": "NST API is running!"}