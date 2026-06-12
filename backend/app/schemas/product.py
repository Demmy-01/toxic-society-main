"""
Pydantic schemas for product models.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ProductBase(BaseModel):
    """Base product schema."""
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    price_usd: Optional[float] = None
    original_price: Optional[float] = None
    category: str
    collection: Optional[str] = None
    tag: Optional[str] = None
    drop_id: Optional[str] = None
    image_url: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    stock_quantity: int = Field(default=0, ge=0)
    in_stock: bool = True


class ProductCreate(ProductBase):
    """Product creation schema."""
    pass


class ProductUpdate(BaseModel):
    """Product update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    price_usd: Optional[float] = None
    original_price: Optional[float] = None
    category: Optional[str] = None
    collection: Optional[str] = None
    tag: Optional[str] = None
    drop_id: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    in_stock: Optional[bool] = None
    is_active: Optional[bool] = None


class DropNameSchema(BaseModel):
    name: str

    class Config:
        from_attributes = True


class ProductResponse(ProductBase):
    """Product response schema."""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    drops: Optional[DropNameSchema] = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Product list response with pagination."""
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int


class ProductColorBase(BaseModel):
    """Base product color schema."""
    color_name: str
    hex_code: Optional[str] = None
    image_url: Optional[str] = None


class ProductColorResponse(ProductColorBase):
    """Product color response."""
    id: str
    product_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductInventoryBase(BaseModel):
    """Base product inventory schema."""
    product_id: str
    size: str
    color: str
    quantity: int = Field(..., ge=0)


class ProductInventoryUpdate(BaseModel):
    """Product inventory update schema."""
    quantity: int = Field(..., ge=0)
    reserved_quantity: Optional[int] = None


class ProductInventoryResponse(ProductInventoryBase):
    """Product inventory response."""
    id: str
    reserved_quantity: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
