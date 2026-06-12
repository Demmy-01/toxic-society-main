"""
Storage routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from app.models import User
from app.middleware import get_admin_user
import os
import shutil

router = APIRouter(prefix="/api/v1/storage", tags=["Storage"])

UPLOAD_DIR = "uploads"


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    path: str = Form(...),  # e.g., 'products/123456-filename.jpg'
    admin: User = Depends(get_admin_user),
):
    """
    Upload a file locally.
    Saves the file to 'uploads/{path}' and returns the local access URL.
    """
    try:
        # Resolve target file path
        target_path = os.path.join(UPLOAD_DIR, path.replace("/", os.sep))
        
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        # Write file contents
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return public URL path
        # Assuming backend runs on localhost:8000
        # In production, this can be dynamically configured via settings.BACKEND_URL
        from app.config import get_settings
        settings = get_settings()
        
        # We can build a relative URL or an absolute URL. Let's return the absolute localhost URL:
        public_url = f"http://localhost:8000/uploads/{path}"
        
        return {
            "success": True,
            "publicUrl": public_url
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
