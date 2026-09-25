from pydantic import BaseModel, EmailStr
from typing import Literal


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: Literal["admin", "hr", "mentor", "intern"]


class UserUpdate(BaseModel):
    email: EmailStr
    full_name: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: Literal["admin", "hr", "mentor", "intern"]

class UserStatusUpdate(BaseModel):
    is_active: bool