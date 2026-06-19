"""
Discounts routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Discount, User
from app.schemas import DiscountCreate, DiscountResponse, DiscountUpdate
from app.middleware import get_admin_user
from typing import List

router = APIRouter(prefix="/api/v1/discounts", tags=["Discounts"])


@router.get("", response_model=List[DiscountResponse])
async def list_discounts(
    db: Session = Depends(get_db)
):
    """List all discount codes (including inactive ones, ordered by created_at desc)."""
    return db.query(Discount).order_by(Discount.created_at.desc()).all()


@router.get("/code/{code}", response_model=DiscountResponse)
async def get_discount_by_code(code: str, db: Session = Depends(get_db)):
    """Validate and get a specific discount code by name."""
    discount = db.query(Discount).filter(Discount.code == code.upper()).first()
    
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discount code not found",
        )
    
    return discount


@router.post("", response_model=DiscountResponse, status_code=status.HTTP_201_CREATED)
async def create_discount(
    discount_create: DiscountCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Create a new discount code (admin only)."""
    # Force uppercase code
    data = discount_create.dict()
    data["code"] = data["code"].upper()
    
    # Default start_date to now if not provided
    if not data.get("start_date"):
        data["start_date"] = datetime.utcnow()
    
    # Check if code already exists
    existing = db.query(Discount).filter(Discount.code == data["code"]).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discount code already exists",
        )
        
    db_discount = Discount(**data)
    db.add(db_discount)
    db.commit()
    db.refresh(db_discount)
    return db_discount


@router.patch("/{discount_id}", response_model=DiscountResponse)
async def update_discount(
    discount_id: str,
    discount_update: DiscountUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Update a discount code (admin only)."""
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discount code not found",
        )
    
    update_data = discount_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(discount, field, value)
    
    db.commit()
    db.refresh(discount)
    return discount


@router.delete("/{discount_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discount(
    discount_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Delete a discount code (admin only)."""
    discount = db.query(Discount).filter(Discount.id == discount_id).first()
    
    if not discount:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discount code not found",
        )
    
    db.delete(discount)
    db.commit()
