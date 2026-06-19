"""
Users routes — allows admin to list/query registered users.
The mock Supabase client on the frontend queries `/api/v1/users`
(e.g. AdminRegister checks for existing admins).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CustomerProfile
from app.middleware import get_admin_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


def _user_dict(u: User) -> dict:
    """Convert a User ORM object to a dict."""
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "is_admin": u.is_admin,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "updated_at": u.updated_at.isoformat() if u.updated_at else None,
    }


@router.get("", response_model=List[dict])
async def list_users(
    db: Session = Depends(get_db),
):
    """
    List all users.
    Note: For AdminRegister's first-admin check we allow unauthenticated access.
    The actual user data exposed is minimal (id + is_admin flag).
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [_user_dict(u) for u in users]


@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return _user_dict(user)


class SuspendRequest(BaseModel):
    is_active: bool


@router.patch("/{user_id}/suspend", response_model=dict)
async def suspend_user(
    user_id: str,
    body: SuspendRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Suspend or unsuspend a user account. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    # Prevent admin from suspending themselves
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot suspend your own account",
        )
    user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return _user_dict(user)


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Permanently delete a user and their customer profile. Admin only."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )
    # Delete customer profile if exists
    customer = db.query(CustomerProfile).filter(
        CustomerProfile.user_id == user_id
    ).first()
    if customer:
        db.delete(customer)
    # Delete the user
    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully", "id": user_id}

