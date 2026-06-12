"""
Reviews routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Review
from app.schemas import ReviewCreate, ReviewResponse
from typing import List

router = APIRouter(prefix="/api/v1/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewResponse])
async def list_reviews(
    db: Session = Depends(get_db)
):
    """List all reviews ordered by created_at desc."""
    return db.query(Review).filter(Review.is_approved == True).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_create: ReviewCreate,
    db: Session = Depends(get_db)
):
    """Create a new product review."""
    db_review = Review(
        product_id=review_create.product_id,
        title=review_create.title,
        body=review_create.body,
        rating=review_create.rating,
        author=review_create.dict().get("author") or "Anonymous",
        verified=review_create.dict().get("verified") or False,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
