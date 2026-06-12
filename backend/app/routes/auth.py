"""
Authentication routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserResponse, TokenResponse
from app.services import authenticate_user, create_user, generate_token_response
from app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    
    # Create user
    user = await create_user(
        db=db,
        email=user_create.email,
        password=user_create.password,
        full_name=user_create.full_name,
        is_admin=user_create.is_admin,
    )
    
    # Generate token
    access_token, user_response = await generate_token_response(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    """Login with email and password."""
    user = await authenticate_user(db, email, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    access_token, user_response = await generate_token_response(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
    }


from pydantic import BaseModel

class CustomerLoginRequest(BaseModel):
    email: str
    name: str | None = None
    phone: str | None = None


@router.post("/customer-login", response_model=TokenResponse)
async def customer_login(
    request: CustomerLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Passwordless login for customers.
    Finds a user by email and issues a token without password verification.
    This is for the customer-facing store where the auth is lightweight.
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please sign up first.",
        )
    
    # Update name if provided and different
    if request.name and user.full_name != request.name:
        user.full_name = request.name
        db.commit()
        db.refresh(user)
    
    access_token, user_response = await generate_token_response(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
    }

