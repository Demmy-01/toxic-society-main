"""
Order and checkout models.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON, Enum
from datetime import datetime
import uuid
import enum
from app.database import Base
from sqlalchemy.orm import relationship


class OrderStatus(str, enum.Enum):
    """Order status enumeration."""
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Order(Base):
    """Order model."""

    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), nullable=True, index=True)  # Map to customer_id
    order_number = Column(String(50), unique=True, nullable=True, index=True)
    
    # Items (JSON array)
    items = Column(JSON, nullable=False)  # [{product_id, name, price, quantity, size, color}]
    
    # Pricing
    subtotal_usd = Column(Float, nullable=True)
    discount_amount = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    total = Column(Float, nullable=False)  # Map to total
    total_usd = Column(Float, nullable=True)  # Backward compatibility
    currency = Column(String(3), default="USD")
    
    # Payment
    payment_reference = Column(String(255), nullable=True, unique=True)
    payment_status = Column(String(50), nullable=True)  # 'pending', 'success', 'failed'
    payment_method = Column(String(50), nullable=True)  # 'paystack', 'card'
    
    # Discount
    discount_code = Column(String(50), nullable=True)
    discount_id = Column(String(36), nullable=True)
    
    # Delivery (optional now, since they might be in customer profile)
    delivery_location = Column(String(500), nullable=True)
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    
    # Status
    status = Column(String(50), default="pending", index=True)  # String to match frontend status transitions
    tracking_number = Column(String(100), nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Relationship to customers table
    customers = relationship(
        "CustomerProfile",
        primaryjoin="foreign(Order.customer_id) == remote(CustomerProfile.id)",
        backref="orders",
        lazy="joined"
    )

    def __repr__(self):
        return f"<Order {self.id}>"
