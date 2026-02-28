from fastapi import APIRouter, Depends, HTTPException, Response ,status
from sqlmodel import Session, select
from app.models import User
from app.db import get_session
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import UserCreate, UserResponse, Token
from app.security import get_password_hash, create_access_token, verify_password
from app.dependencies import get_current_user
from app.config import settings
from datetime import timedelta
from typing import Annotated
from app.config import settings


router = APIRouter(prefix="/auth")

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, session: Annotated[Session, Depends(get_session)]):

    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email, 
        hashed_password=hashed_password
   )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/login")
def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    session: Annotated[Session, Depends(get_session)]
):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # UPGRADED: Calculate the specific expiration time here
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    
    # Pass both the data and the delta into your upgraded function
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,   # JavaScript cannot read this (highly secure)
        secure=True,    # Set to True in production (HTTPS)
        samesite="lax",  # Protects against CSRF attacks
        max_age=settings.access_token_expire_minutes * 60 # 30 minutes (match your token expiration)
    )

    return {"message": "Successfully logged in"}


@router.post("/logout")
def logout(response: Response):
    # 3. Create a logout endpoint to destroy the cookie
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    # If the dependency passes, they have a valid cookie!
    return {"email": current_user.email}