"""
Export all Pydantic schemas.
"""

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    CustomerProfileCreate,
    CustomerProfileResponse,
    CustomerProfileUpdate,
    TokenResponse,
    GoogleOAuthRequest,
)

from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ProductListResponse,
    ProductColorResponse,
    ProductInventoryResponse,
)

from app.schemas.order import (
    OrderCreateRequest,
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdate,
    OrderItemSchema,
)

from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
    ReviewListResponse,
)

from app.schemas.drop import (
    DropCreate,
    DropResponse,
    DropUpdate,
    DropListResponse,
)

from app.schemas.discount import (
    DiscountCreate,
    DiscountResponse,
    DiscountUpdate,
    DiscountValidateRequest,
    DiscountValidateResponse,
)

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "CustomerProfileCreate",
    "CustomerProfileResponse",
    "CustomerProfileUpdate",
    "TokenResponse",
    "GoogleOAuthRequest",
    "ProductCreate",
    "ProductResponse",
    "ProductUpdate",
    "ProductListResponse",
    "ProductColorResponse",
    "ProductInventoryResponse",
    "OrderCreateRequest",
    "OrderResponse",
    "OrderListResponse",
    "OrderStatusUpdate",
    "OrderItemSchema",
    "ReviewCreate",
    "ReviewResponse",
    "ReviewUpdate",
    "ReviewListResponse",
    "DropCreate",
    "DropResponse",
    "DropUpdate",
    "DropListResponse",
    "DiscountCreate",
    "DiscountResponse",
    "DiscountUpdate",
    "DiscountValidateRequest",
    "DiscountValidateResponse",
]
