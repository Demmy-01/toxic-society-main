"""
Pydantic schemas for authentication and user models.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=6)
    is_admin: bool = False


class UserUpdate(BaseModel):
    """User update schema."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    """User response schema."""
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerProfileBase(BaseModel):
    """Base customer profile schema."""
    phone: Optional[str] = None
    delivery_location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    preferred_currency: str = "USD"


class CustomerProfileCreate(CustomerProfileBase):
    """Customer profile creation schema."""
    pass


class CustomerProfileUpdate(BaseModel):
    """Customer profile update schema."""
    phone: Optional[str] = None
    delivery_location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    preferred_currency: Optional[str] = None


class CustomerProfileResponse(CustomerProfileBase):
    """Customer profile response schema."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GoogleOAuthRequest(BaseModel):
    """Google OAuth request."""
    code: str
    state: Optional[str] = None
