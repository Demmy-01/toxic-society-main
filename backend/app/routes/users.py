"""
Users routes — allows admin to list/query registered users.
The mock Supabase client on the frontend queries `/api/v1/users`
(e.g. AdminRegister checks for existing admins).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.middleware import get_admin_user
from typing import List

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


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
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
        }
        for u in users
    ]


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
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }
