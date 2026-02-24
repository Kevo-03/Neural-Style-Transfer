from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import User
from app.db import get_session
from app.schemas import UserCreate, UserResponse
from app.security import get_password_hash

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def create_user(user: UserCreate, session: Session = Depends(get_session)):

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
