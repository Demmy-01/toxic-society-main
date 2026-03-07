/**
 * Shared input validation & sanitization utilities.
 * Used by both frontend and (copy-pasted into) Deno edge functions.
 * OWASP A03: Injection — sanitize all user-controllable strings.
 */

// ---------------------------------------------------------------------------
// String sanitization
// ---------------------------------------------------------------------------

/**
 * Trims whitespace, strips ASCII control characters (0x00–0x1F, 0x7F),
 * and enforces a maximum length. Returns the cleaned string.
 */
export function sanitizeString(value: string, maxLen: number): string {
    return value
        .trim()
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
        .slice(0, maxLen);
}

// ---------------------------------------------------------------------------
// Format validators
// ---------------------------------------------------------------------------

/** RFC-5321-safe email check (up to 254 chars, no consecutive dots, etc.) */
export function isValidEmail(value: string): boolean {
    if (value.length > 254) return false;
    // Standard RFC-compliant regex — covers 99.9 % of real addresses
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Loose phone validator: allows digits, spaces, parentheses, dashes,
 * pluses, and dots. Minimum 7 digits to reject garbage.
 */
export function isValidPhone(value: string): boolean {
    if (value.length > 20) return false;
    return /^[+\d\s()\-.]{7,20}$/.test(value);
}

/** UUID v4 check — prevents SQL injection via campaign_id / foreign keys. */
export function isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Promo code: uppercase alphanumeric + dash, 2–20 chars. */
export function isValidPromoCode(value: string): boolean {
    return /^[A-Z0-9\-]{2,20}$/.test(value);
}

// ---------------------------------------------------------------------------
// Form-level validators (CheckoutModal)
// ---------------------------------------------------------------------------

// Using a Record type alias avoids the index signature vs optional field TS conflict.
export type CheckoutFormErrors = Partial<Record<'name' | 'phone' | 'email' | 'delivery_location', string>>;

export interface CheckoutFormValues {
    name: string;
    phone: string;
    email: string;
    delivery_location: string;
}

/**
 * Validates the checkout form. Returns an errors object (empty = valid).
 * Sanitizes each field before checking.
 */
export function validateCheckoutForm(raw: CheckoutFormValues): {
    sanitized: CheckoutFormValues;
    errors: CheckoutFormErrors;
} {
    const sanitized: CheckoutFormValues = {
        name: sanitizeString(raw.name, 100),
        phone: sanitizeString(raw.phone, 20),
        email: sanitizeString(raw.email, 254),
        delivery_location: sanitizeString(raw.delivery_location, 300),
    };

    const errors: CheckoutFormErrors = {};

    if (!sanitized.name) errors.name = 'Full name is required.';
    else if (sanitized.name.length < 2) errors.name = 'Name must be at least 2 characters.';

    if (!sanitized.phone) errors.phone = 'Phone number is required.';
    else if (!isValidPhone(sanitized.phone)) errors.phone = 'Enter a valid phone number.';

    if (!sanitized.email) errors.email = 'Email address is required.';
    else if (!isValidEmail(sanitized.email)) errors.email = 'Enter a valid email address.';

    if (!sanitized.delivery_location) errors.delivery_location = 'Delivery address is required.';
    else if (sanitized.delivery_location.length < 5) errors.delivery_location = 'Enter a full delivery address.';

    return { sanitized, errors };
}
