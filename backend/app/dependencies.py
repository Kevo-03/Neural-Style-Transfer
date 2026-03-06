from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, Request ,status
from sqlmodel import Session, select

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
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = session.exec(select(User).where(User.email == email)).first()
    
    if user is None:
        raise credentials_exception
        
    return user