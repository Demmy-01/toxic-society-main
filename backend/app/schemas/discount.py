"""
Pydantic schemas for discount models.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class DiscountType(str, Enum):
    """Discount type enumeration."""
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    BOGO = "bogo"


class DiscountBase(BaseModel):
    """Base discount schema."""
    code: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    type: str  # 'percentage' or 'fixed'
    value: float = Field(..., gt=0)
    min_purchase: float = Field(default=0, ge=0)
    start_date: datetime
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    uses_per_customer: int = 1


class DiscountCreate(DiscountBase):
    """Discount creation schema."""
    pass


class DiscountUpdate(BaseModel):
    """Discount update schema."""
    description: Optional[str] = None
    value: Optional[float] = Field(None, gt=0)
    min_purchase: Optional[float] = None
    active: Optional[bool] = None
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = None
    uses_per_customer: Optional[int] = None


class DiscountResponse(DiscountBase):
    """Discount response schema."""
    id: str
    active: bool
    uses: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DiscountValidateRequest(BaseModel):
    """Validate discount request."""
    code: str
    order_total: float


class DiscountValidateResponse(BaseModel):
    """Validate discount response."""
    is_valid: bool
    discount_amount: float
    final_total: float
    error: Optional[str] = None
