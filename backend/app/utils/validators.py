"""
Input validation utilities (matching Supabase validation).
"""

import re


def validate_reference(reference: str) -> bool:
    """Validate Paystack payment reference format (OWASP A03 injection prevention)."""
    return isinstance(reference, str) and bool(re.match(r'^[a-zA-Z0-9_\-]{8,100}$', reference))


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate phone number format (basic)."""
    # Remove common formatting characters
    clean_phone = re.sub(r'[\s\-\(\)\.+]', '', phone)
    # Check if it's 7-15 digits
    return bool(re.match(r'^\d{7,15}$', clean_phone))


def validate_currency_code(code: str) -> bool:
    """Validate ISO 4217 currency code."""
    valid_codes = {
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
        'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR',
        'NGN',  # Nigerian Naira
    }
    return code.upper() in valid_codes


def sanitize_string(value: str, max_length: int = 255) -> str:
    """Basic string sanitization to prevent XSS."""
    if not isinstance(value, str):
        return ""
    # Remove potentially dangerous characters but keep alphanumeric, spaces, and common punctuation
    sanitized = re.sub(r'[<>\"\'%;()&+]', '', value)
    return sanitized[:max_length].strip()


def validate_discount_code(code: str) -> bool:
    """Validate discount code format."""
    return bool(re.match(r'^[A-Z0-9_\-]{3,50}$', code))


def validate_order_number(order_number: str) -> bool:
    """Validate order number format."""
    return bool(re.match(r'^ORD-\d{6}-[A-Z0-9]{4}$', order_number))
