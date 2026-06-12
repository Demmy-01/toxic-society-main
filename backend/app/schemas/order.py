"""
Pydantic schemas for order models.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class OrderItemSchema(BaseModel):
    """Order item schema."""
    product_id: str
    name: str
    price: float
    quantity: int = Field(..., ge=1)
    size: str
    color: str


class OrderCreateRequest(BaseModel):
    """Order creation request."""
    items: List[OrderItemSchema]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    delivery_location: str
    discount_code: Optional[str] = None
    currency: str = "USD"


class OrderResponse(BaseModel):
    """Order response schema."""
    id: str
    order_number: str
    items: List[Dict[str, Any]]
    subtotal_usd: float
    discount_amount: float
    tax_amount: float
    total_usd: float
    currency: str
    status: str
    payment_reference: Optional[str] = None
    payment_status: Optional[str] = None
    discount_code: Optional[str] = None
    delivery_location: str
    customer_name: str
    customer_email: str
    customer_phone: str
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Order list response."""
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderStatusUpdate(BaseModel):
    """Order status update schema."""
    status: str
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
