"""
Application constants.
"""

# API
API_V1_PREFIX = "/api/v1"
API_ADMIN_PREFIX = "/api/admin"

# Order
ORDER_PREFIX = "ORD"
TAX_RATE = 0.1  # 10% tax

# Pagination
DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Strings
UNAUTHORIZED_MESSAGE = "Not authenticated"
FORBIDDEN_MESSAGE = "Not authorized"
NOT_FOUND_MESSAGE = "Resource not found"
CONFLICT_MESSAGE = "Resource already exists"

# Product
DEFAULT_PRODUCT_STOCK = 0

# Payment
PAYSTACK_API_URL = "https://api.paystack.co"
PAYSTACK_VERIFY_ENDPOINT = "/transaction/verify/"

# Currency
SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN']
DEFAULT_CURRENCY = 'USD'
EXCHANGE_RATE_CACHE_HOURS = 1

# Auth
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Review
MIN_REVIEW_LENGTH = 10
MAX_REVIEW_LENGTH = 5000
MIN_RATING = 1
MAX_RATING = 5

# Drop status
DROP_UPCOMING = "upcoming"
DROP_LIVE = "live"
DROP_PAST = "past"

# Order status
ORDER_PENDING = "pending"
ORDER_PAID = "paid"
ORDER_PROCESSING = "processing"
ORDER_SHIPPED = "shipped"
ORDER_DELIVERED = "delivered"
ORDER_CANCELLED = "cancelled"

# Admin
ADMIN_ROLE = "admin"
USER_ROLE = "user"
