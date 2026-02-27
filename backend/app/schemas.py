from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class ImageLibraryResponse(BaseModel):
    id: int
    status: str
    result: Optional[str] = None