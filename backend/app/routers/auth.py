from fastapi import APIRouter, Depends, HTTPException, Response, status
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


router = APIRouter(prefix="/auth")

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, session: Annotated[Session, Depends(get_session)]):

    statement = select(User).where(User.username == user.username)
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
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
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=(settings.env_name == "production"),
        samesite="lax",
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60
    )

    return {"message": "Successfully logged in"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        domain=settings.cookie_domain,
        secure=(settings.env_name == "production"),
        httponly=True,
        samesite="lax"
    )
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {"username": current_user.username}

@router.delete("/account")
async def delete_user_account(
    response: Response,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    statement = select(Image).where(Image.user_id == current_user.id)
    user_images = session.exec(statement).all()

    for image in user_images:
        if image.result_path:
            await delete_from_spaces(image.result_path)
        if image.content_path:
            await delete_from_spaces(image.content_path)
        if image.style_path:
            await delete_from_spaces(image.style_path)

        session.delete(image)

    session.delete(current_user)
    session.commit()

    response.delete_cookie(
        key="access_token",
        domain=settings.cookie_domain,
        httponly=True,
        secure=(settings.env_name == "production"),
        samesite="lax"
    )

    return {"message": "Account and all associated cloud data successfully deleted."}