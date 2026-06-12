"""
Drops routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Drop
from app.schemas import DropCreate, DropResponse, DropUpdate, DropListResponse
from app.middleware import get_admin_user
from app.models import User

router = APIRouter(prefix="/api/v1/drops", tags=["Drops"])


@router.get("", response_model=DropListResponse)
async def list_drops(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
    featured_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """List all drops."""
    query = db.query(Drop).filter(Drop.is_active == True)
    
    if featured_only:
        query = query.filter(Drop.is_featured == True)
        
    total = query.count()
    items = query.order_by(Drop.drop_date.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
    }


@router.get("/{drop_id}", response_model=DropResponse)
async def get_drop(drop_id: str, db: Session = Depends(get_db)):
    """Get a specific drop."""
    drop = db.query(Drop).filter(Drop.id == drop_id).first()
    
    if not drop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )
    
    return drop


@router.post("", response_model=DropResponse, status_code=status.HTTP_201_CREATED)
async def create_drop(
    drop_create: DropCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Create a new drop (admin only)."""
    db_drop = Drop(**drop_create.dict())
    db.add(db_drop)
    db.commit()
    db.refresh(db_drop)
    return db_drop


@router.patch("/{drop_id}", response_model=DropResponse)
async def update_drop(
    drop_id: str,
    drop_update: DropUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Update a drop (admin only)."""
    drop = db.query(Drop).filter(Drop.id == drop_id).first()
    
    if not drop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )
    
    update_data = drop_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(drop, field, value)
    
    db.commit()
    db.refresh(drop)
    return drop


@router.delete("/{drop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_drop(
    drop_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Delete a drop (admin only)."""
    drop = db.query(Drop).filter(Drop.id == drop_id).first()
    
    if not drop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drop not found",
        )
    
    db.delete(drop)
    db.commit()
