from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.db import get_session
from app.models import User
from app.config import settings

# 1. THE BOUNCER'S INSTRUCTIONS
# We tell OAuth2PasswordBearer the exact URL where users go to get their tokens.
# This helps FastAPI automatically wire up the Swagger UI lock buttons!
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 2. THE VALIDATION FUNCTION
def get_current_user(
    # FastAPI automatically extracts the token from the 'Authorization' header
    token: Annotated[str, Depends(oauth2_scheme)], 
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Step A: Mathematically decode the token using your secret key
        payload = jwt.decode(
            token, 
            settings.secret_key, 
            algorithms=[settings.algorithm]
        )
        
        # Step B: Extract the email we saved inside the 'sub' key earlier
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        # If the token is expired, forged, or garbage, PyJWT throws an error.
        # We catch it here and kick the user out.
        raise credentials_exception
        
    # Step C: Look up the user in the database to ensure they haven't been deleted
    user = session.exec(select(User).where(User.email == email)).first()
    
    if user is None:
        raise credentials_exception
        
    # Step D: Return the fully validated User database object!
    return user