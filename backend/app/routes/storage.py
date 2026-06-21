"""
Storage routes — Cloudinary-backed image upload & delete.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from app.models import User
from app.middleware import get_admin_user
import cloudinary.uploader
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/storage", tags=["Storage"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    path: str = Form(...),  # e.g., 'products/123456-filename.jpg'
    admin: User = Depends(get_admin_user),
):
    """
    Upload a file to Cloudinary.
    Returns the permanent Cloudinary URL.
    """
    try:
        # Use the path as a public_id prefix so files stay organized
        # e.g. "product-images/products/1719000000-hoodie.jpg"
        public_id = f"toxic-society/{path.rsplit('.', 1)[0]}"  # strip extension

        result = cloudinary.uploader.upload(
            file.file,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )

        public_url = result["secure_url"]
        logger.info(f"Uploaded to Cloudinary: {public_url}")

        return {
            "success": True,
            "publicUrl": public_url,
        }

    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}",
        )


class DeleteRequest(BaseModel):
    paths: list[str]


@router.delete("/delete")
async def delete_files(
    body: DeleteRequest,
    admin: User = Depends(get_admin_user),
):
    """
    Delete files from Cloudinary by their public URLs or paths.
    Best-effort: errors are logged but don't fail the request.
    """
    for path in body.paths:
        try:
            # Extract public_id from a Cloudinary URL or use the path directly
            if "res.cloudinary.com" in path:
                # URL like https://res.cloudinary.com/<cloud>/image/upload/v123/toxic-society/...
                parts = path.split("/upload/")
                if len(parts) == 2:
                    # Remove version prefix (v123/) and file extension
                    raw = parts[1]
                    # Skip version segment if present
                    if raw.startswith("v") and "/" in raw:
                        raw = raw.split("/", 1)[1]
                    public_id = raw.rsplit(".", 1)[0]
                else:
                    public_id = path
            else:
                public_id = f"toxic-society/{path.rsplit('.', 1)[0]}"

            cloudinary.uploader.destroy(public_id, resource_type="image")
            logger.info(f"Deleted from Cloudinary: {public_id}")
        except Exception as e:
            logger.warning(f"Failed to delete {path} from Cloudinary: {e}")

    return {"success": True}
