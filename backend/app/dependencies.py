from typing import Annotated
import jwt
from fastapi import Depends, File, HTTPException, Request, UploadFile, status
from sqlmodel import Session, select

from app.storage import validate_upload

from app.db import get_session
from app.models import User
from app.config import settings


def get_current_user(
    request: Request,
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )

    cookie_token = request.cookies.get("access_token")

    if not cookie_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    token = cookie_token.replace("Bearer ", "")

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )

        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

    except jwt.PyJWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.username == username)).first()

    if user is None:
        raise credentials_exception

    return user


def validate_uploads(
    content_file: Annotated[UploadFile, File(...)],
    style_file: Annotated[UploadFile, File(...)],
):
    """Dependency that validates both upload files before the route handler runs."""
    validate_upload(content_file)
    validate_upload(style_file)