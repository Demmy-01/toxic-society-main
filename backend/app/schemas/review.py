"""
Pydantic schemas for review models.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ReviewBase(BaseModel):
    """Base review schema."""
    title: str = Field(..., min_length=3, max_length=255)
    body: str = Field(..., min_length=10)
    rating: int = Field(..., ge=1, le=5)


class ReviewCreate(ReviewBase):
    """Review creation schema."""
    product_id: str


class ReviewUpdate(BaseModel):
    """Review update schema."""
    title: Optional[str] = None
    body: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class ReviewResponse(ReviewBase):
    """Review response schema."""
    id: str
    product_id: str
    user_id: Optional[str] = None
    verified: bool
    is_approved: bool
    is_helpful: int
    author: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """Review list response."""
    items: List[ReviewResponse]
    total: int
    average_rating: float
    page: int
    page_size: int
