from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

# 1. The User Table
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str

    # Relationship: One user has many images
    images: list["Image"] = Relationship(back_populates="user")

# 2. The Image/Job Table
class Image(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Files
    content_path: str
    style_path: str
    result_path: Optional[str] = None  # Null until finished
    
    # Status Tracking (Crucial for the "Library" page)
    status: str = Field(default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Belongs to one user
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="images")