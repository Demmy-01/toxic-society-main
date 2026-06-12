"""
Discount and promotion models.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Enum
from datetime import datetime
import uuid
import enum
from app.database import Base


class DiscountType(str, enum.Enum):
    """Type of discount."""
    PERCENTAGE = "percentage"  # e.g., 10% off
    FIXED = "fixed"  # e.g., $5 off
    BOGO = "bogo"  # Buy one get one


class Discount(Base):
    """Discount code model."""

    __tablename__ = "discounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    
    # Discount details
    type = Column(String(50), nullable=False)  # 'percentage' or 'fixed'
    value = Column(Float, nullable=False)  # Either percentage or fixed amount
    min_purchase = Column(Float, default=0)  # Minimum purchase to use code
    
    # Validity
    active = Column(Boolean, default=True)
    start_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)
    
    # Usage limits
    usage_limit = Column(Integer, nullable=True)  # Total uses allowed
    uses = Column(Integer, default=0)
    uses_per_customer = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Discount {self.code}>"


class DiscountUsage(Base):
    """Track discount usage per customer."""

    __tablename__ = "discount_usage"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    discount_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    order_id = Column(String(36), nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<DiscountUsage {self.discount_id} - {self.user_id}>"
