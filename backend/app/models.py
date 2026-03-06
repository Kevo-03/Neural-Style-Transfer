from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str

    images: list["Image"] = Relationship(back_populates="user")

class Image(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    content_path: str
    style_path: str
    result_path: Optional[str] = None  
  
    status: str = Field(default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="images")