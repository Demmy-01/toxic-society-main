"""
Product drop (timed release) models.
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text, Enum, JSON, Integer
from datetime import datetime
import uuid
import enum
from app.database import Base


class DropStatus(str, enum.Enum):
    """Drop status enumeration."""
    UPCOMING = "upcoming"
    LIVE = "live"
    PAST = "past"


class Drop(Base):
    """Product drop (timed release) model."""

    __tablename__ = "drops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True, index=True)
    label = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Timing
    drop_date = Column(DateTime, nullable=False, index=True)
    duration_hours = Column(Integer, default=24)  # How long the drop lasts
    
    # Status
    status = Column(Enum(DropStatus), default=DropStatus.UPCOMING, index=True)
    
    # Products (JSON array of UUIDs)
    product_ids = Column(JSON, default=list)  # Products in this drop
    
    # Visibility
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Media
    banner_image = Column(String(500), nullable=True)
    description_images = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Drop {self.name}>"
