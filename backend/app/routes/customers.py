"""
Customers routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CustomerProfile, User
from app.middleware import get_admin_user, get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/customers", tags=["Customers"])


class CustomerProfileUpsert(BaseModel):
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    delivery_location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    preferred_currency: str = "USD"


@router.get("", response_model=List[dict])
async def list_customers(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """List all registered customers (admin only)."""
    customers = db.query(CustomerProfile).order_by(CustomerProfile.created_at.desc()).all()
    # Map model to dict representation to match frontend
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "delivery_location": c.delivery_location,
            "city": c.city,
            "state": c.state,
            "country": c.country,
            "postal_code": c.postal_code,
            "preferred_currency": c.preferred_currency,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in customers
    ]


@router.get("/user/{user_id}", response_model=dict)
async def get_customer_by_user_id(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get customer profile by user id."""
    c = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer profile not found",
        )
    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "delivery_location": c.delivery_location,
        "city": c.city,
        "state": c.state,
        "country": c.country,
        "postal_code": c.postal_code,
        "preferred_currency": c.preferred_currency,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


@router.post("/upsert", response_model=dict)
async def upsert_customer(
    profile_data: CustomerProfileUpsert,
    db: Session = Depends(get_db)
):
    """Upsert a customer profile."""
    c = db.query(CustomerProfile).filter(CustomerProfile.user_id == profile_data.user_id).first()
    
    if not c:
        # Create new profile
        c = CustomerProfile(
            user_id=profile_data.user_id,
            name=profile_data.name,
            email=profile_data.email,
            phone=profile_data.phone,
            delivery_location=profile_data.delivery_location,
            city=profile_data.city,
            state=profile_data.state,
            country=profile_data.country,
            postal_code=profile_data.postal_code,
            preferred_currency=profile_data.preferred_currency,
        )
        db.add(c)
    else:
        # Update existing profile
        c.name = profile_data.name if profile_data.name is not None else c.name
        c.email = profile_data.email if profile_data.email is not None else c.email
        c.phone = profile_data.phone if profile_data.phone is not None else c.phone
        c.delivery_location = profile_data.delivery_location if profile_data.delivery_location is not None else c.delivery_location
        c.city = profile_data.city if profile_data.city is not None else c.city
        c.state = profile_data.state if profile_data.state is not None else c.state
        c.country = profile_data.country if profile_data.country is not None else c.country
        c.postal_code = profile_data.postal_code if profile_data.postal_code is not None else c.postal_code
        c.preferred_currency = profile_data.preferred_currency if profile_data.preferred_currency is not None else c.preferred_currency
        
    db.commit()
    db.refresh(c)
    
    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "delivery_location": c.delivery_location,
        "city": c.city,
        "state": c.state,
        "country": c.country,
        "postal_code": c.postal_code,
        "preferred_currency": c.preferred_currency,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }
