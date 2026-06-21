"""
Toxic Society Backend API - Main application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import engine, Base
from app.routes import auth, products, drops, discounts, reviews, customers, orders, storage, users
import cloudinary
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    # Startup
    logger.info("Starting Toxic Society Backend API")
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")

    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    logger.info("Cloudinary configured")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Toxic Society Backend API")


# Create FastAPI app
app = FastAPI(
    title="Toxic Society Backend API",
    description="Backend API for Toxic Society e-commerce platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip().rstrip("/") for origin in settings.FRONTEND_URL.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(drops.router)
app.include_router(discounts.router)
app.include_router(reviews.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(storage.router)
app.include_router(users.router)

# NOTE: Local uploads directory removed — images now stored on Cloudinary


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


# API root endpoint
@app.get("/api/v1")
async def api_root():
    """API root endpoint."""
    return {
        "name": "Toxic Society Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


# Serve Paystack public key to the frontend
@app.get("/api/v1/config/paystack-key")
async def get_paystack_public_key():
    """Return the Paystack public key for the frontend payment popup."""
    return {"publicKey": settings.PAYSTACK_PUBLIC_KEY}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Toxic Society Backend API",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
