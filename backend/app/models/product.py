"""
Product and inventory models.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base


class Product(Base):
    """Product model."""

    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)  # Map to price
    price_usd = Column(Float, nullable=True)  # Backward compatibility
    original_price = Column(Float, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    collection = Column(String(100), nullable=True)
    tag = Column(String(50), nullable=True)
    drop_id = Column(String(36), ForeignKey("drops.id"), nullable=True)
    drops = relationship("Drop", backref="products")
    image_url = Column(String(500), nullable=True)
    images = Column(JSON, default=list)  # Array of image URLs
    sizes = Column(JSON, default=list)  # ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    colors = Column(JSON, default=list)  # ['Red', 'Blue', 'Black']
    stock_quantity = Column(Integer, default=0)
    in_stock = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Product {self.name}>"


class ProductColor(Base):
    """Product color variants."""

    __tablename__ = "product_colors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), nullable=False, index=True)
    color_name = Column(String(100), nullable=False)
    hex_code = Column(String(7), nullable=True)  # e.g., '#C41E3A'
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ProductColor {self.product_id} - {self.color_name}>"


class ProductInventory(Base):
    """Track inventory by product, size, and color."""

    __tablename__ = "product_inventory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), nullable=False, index=True)
    size = Column(String(10), nullable=False)
    color = Column(String(100), nullable=False)
    quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)  # Reserved but not paid
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        # Unique constraint on product_id + size + color combination
    )

    def __repr__(self):
        return f"<ProductInventory {self.product_id} - {self.size}/{self.color}>"
