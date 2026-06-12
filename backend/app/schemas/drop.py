"""
Pydantic schemas for drop models.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class DropBase(BaseModel):
    """Base drop schema."""
    name: str
    label: str
    description: Optional[str] = None
    drop_date: datetime
    duration_hours: int = 24
    product_ids: List[str] = Field(default_factory=list)
    is_featured: bool = False
    banner_image: Optional[str] = None
    description_images: List[str] = Field(default_factory=list)


class DropCreate(DropBase):
    """Drop creation schema."""
    pass


class DropUpdate(BaseModel):
    """Drop update schema."""
    name: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None
    drop_date: Optional[datetime] = None
    duration_hours: Optional[int] = None
    product_ids: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    banner_image: Optional[str] = None
    description_images: Optional[List[str]] = None


class DropResponse(DropBase):
    """Drop response schema."""
    id: str
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DropListResponse(BaseModel):
    """Drop list response."""
    items: List[DropResponse]
    total: int
    page: int
    page_size: int
