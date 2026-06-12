"""
Review and rating models.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text
from datetime import datetime
import uuid
from app.database import Base


class Review(Base):
    """Product review model."""

    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)  # Nullable for guest or anonymous reviews
    
    # Review content
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    
    # Verification
    verified = Column(Boolean, default=False)
    
    # Status
    is_approved = Column(Boolean, default=True)
    is_helpful = Column(Integer, default=0)  # Helpful votes count
    
    # Metadata
    author = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Review {self.id} - Product {self.product_id}>"
