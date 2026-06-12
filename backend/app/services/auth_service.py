"""
Authentication service.
"""

from sqlalchemy.orm import Session
from app.models import User, CustomerProfile
from app.utils.security import hash_password, verify_password, create_access_token
from app.schemas import UserResponse
from uuid import UUID
from typing import Optional, Tuple


async def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
    
    if not user.password_hash or not verify_password(password, user.password_hash):
        return None
    
    return user


async def create_user(
    db: Session,
    email: str,
    password: Optional[str] = None,
    full_name: Optional[str] = None,
    oauth_provider: Optional[str] = None,
    oauth_id: Optional[str] = None,
    is_admin: bool = False,
) -> User:
    """Create a new user."""
    user = User(
        email=email,
        password_hash=hash_password(password) if password else None,
        full_name=full_name,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        is_admin=is_admin,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create customer profile
    customer_profile = CustomerProfile(user_id=user.id)
    db.add(customer_profile)
    db.commit()
    
    return user


async def get_or_create_oauth_user(
    db: Session,
    email: str,
    full_name: str,
    oauth_provider: str,
    oauth_id: str,
) -> User:
    """Get existing OAuth user or create new one."""
    # Try to find by oauth_id first
    user = db.query(User).filter(User.oauth_id == oauth_id).first()
    
    if user:
        return user
    
    # Check if email exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update with OAuth info
        user.oauth_provider = oauth_provider
        user.oauth_id = oauth_id
        if not user.full_name:
            user.full_name = full_name
        db.commit()
        db.refresh(user)
        return user
    
    # Create new user
    return await create_user(
        db=db,
        email=email,
        full_name=full_name,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
    )


async def generate_token_response(user: User) -> Tuple[str, UserResponse]:
    """Generate access token and user response."""
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
    
    return access_token, user_response


async def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


async def get_customer_profile(db: Session, user_id: UUID) -> Optional[CustomerProfile]:
    """Get customer profile by user ID."""
    return db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
