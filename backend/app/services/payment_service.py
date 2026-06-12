"""
Payment processing service for Paystack integration.
Mirrors the Supabase edge function security model.
"""

import httpx
from app.config import get_settings
from app.utils.validators import validate_reference

settings = get_settings()


async def verify_paystack_payment(reference: str, amount_in_kobo: int) -> dict:
    """
    Verify Paystack payment reference.
    
    Security model (OWASP-hardened):
    - SECRET_KEY is server-only, never sent to client
    - Reference is validated before use (injection prevention)
    - Amount verified against Paystack's server response
    
    Args:
        reference: Paystack payment reference
        amount_in_kobo: Expected amount in kobo (smallest unit)
    
    Returns:
        {
            'success': bool,
            'status': str,  # 'success', 'failed', 'pending'
            'amount': int,  # Amount in kobo
            'customer': dict,
            'error': str | None
        }
    """
    
    # Validate reference format (OWASP A03)
    if not validate_reference(reference):
        return {
            'success': False,
            'status': 'failed',
            'error': 'Invalid reference format'
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.PAYSTACK_API_URL}/transaction/verify/{reference}",
                headers={
                    "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                }
            )
            
            if response.status_code != 200:
                return {
                    'success': False,
                    'status': 'failed',
                    'error': 'Payment verification failed'
                }
            
            data = response.json()
            
            if not data.get('status'):
                return {
                    'success': False,
                    'status': 'failed',
                    'error': 'Payment verification endpoint error'
                }
            
            transaction = data.get('data', {})
            
            # Check if payment status is successful
            if transaction.get('status') != 'success':
                return {
                    'success': False,
                    'status': transaction.get('status', 'unknown'),
                    'error': 'Payment not successful'
                }
            
            # Verify amount matches (OWASP A04 - prevent price tampering)
            if transaction.get('amount') != amount_in_kobo:
                return {
                    'success': False,
                    'status': 'failed',
                    'error': 'Amount mismatch'
                }
            
            # Payment verified successfully
            return {
                'success': True,
                'status': 'success',
                'amount': transaction.get('amount'),
                'customer': transaction.get('customer', {}),
                'reference': transaction.get('reference'),
                'authorization': transaction.get('authorization', {}),
            }
    
    except httpx.RequestError as e:
        return {
            'success': False,
            'status': 'error',
            'error': f'Network error: {str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'status': 'error',
            'error': f'Verification error: {str(e)}'
        }
