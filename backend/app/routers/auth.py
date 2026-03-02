from fastapi import APIRouter, Depends, HTTPException, Response ,status
from sqlmodel import Session, select
from app.models import User, Image
from app.db import get_session
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import UserCreate, UserResponse, Token
from app.security import get_password_hash, create_access_token, verify_password
from app.dependencies import get_current_user
from app.storage import delete_from_spaces
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
        value=access_token,
        httponly=True,   # JavaScript cannot read this (highly secure)
        secure=True,    # Set to True in production (HTTPS)
        samesite="lax",  # Protects against CSRF attacks
        domain=".neuralart.app",
        max_age=settings.access_token_expire_minutes * 60 # 30 minutes (match your token expiration)
    )

    return {"message": "Successfully logged in"}


@router.post("/logout")
def logout(response: Response):
    # 3. Create a logout endpoint to destroy the cookie
    response.delete_cookie(
        key="access_token",
        domain=".neuralart.app", # <--- Add this!
        secure=True,
        httponly=True,
        samesite="lax"
    )
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    # If the dependency passes, they have a valid cookie!
    return {"email": current_user.email}

@router.delete("/account")
async def delete_user_account(
    response: Response, # 👈 Needed to clear the cookie!
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    # 1. Fetch all images owned by this user
    statement = select(Image).where(Image.user_id == current_user.id)
    user_images = session.exec(statement).all()

    # 2. The Cloud Wipe: Delete every physical file from DigitalOcean Spaces
    for image in user_images:
        if image.result_path:
            await delete_from_spaces(image.result_path)
        if image.content_path:
            await delete_from_spaces(image.content_path)
        if image.style_path:
            await delete_from_spaces(image.style_path)
        
        # Delete the image record from the database so we don't have orphaned rows
        session.delete(image)

    # 3. The Database Wipe: Delete the user record itself
    session.delete(current_user)
    session.commit()

    # 4. The Log Out: Destroy the auth cookie on the frontend
    response.delete_cookie(
        key="access_token",
        domain=".neuralart.app",
        httponly=True,
        secure=True, 
        samesite="lax"
    )

    return {"message": "Account and all associated cloud data successfully deleted."}