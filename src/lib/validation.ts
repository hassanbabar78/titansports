import { z } from 'zod';

// Centralised input schemas. All forms must validate against these before submit.
// Lengths chosen to be generous yet bounded to prevent abuse / oversized payloads.

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(255, 'Email too long')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  // basic character allow-list — letters, spaces, common punctuation
  .regex(/^[\p{L}\p{M}\s'.\-]+$/u, 'Name contains invalid characters');

export const signUpSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message too long'),
});

export const checkoutSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  address: z.string().trim().min(3, 'Address is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  zip: z.string().trim().min(2, 'ZIP is required').max(20).regex(/^[A-Za-z0-9\s\-]+$/, 'Invalid ZIP'),
  country: z.string().trim().min(2).max(60),
  cardNumber: z.string().trim().regex(/^[0-9\s]{12,23}$/, 'Invalid card number'),
  cardExpiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Invalid expiry (MM/YY)'),
  cardCvc: z.string().trim().regex(/^[0-9]{3,4}$/, 'Invalid CVC'),
});

/** Map any thrown value to a safe, user-facing message. Never leak stack traces or internals. */
export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof z.ZodError) {
    return err.issues[0]?.message ?? fallback;
  }
  if (err instanceof Error) {
    const msg = err.message;
    // Allow a small set of known-safe auth messages through; otherwise mask.
    const safe = [
      'Invalid login credentials',
      'Email not confirmed',
      'User already registered',
      'Password should be at least',
    ];
    if (safe.some((s) => msg.includes(s))) return msg;
  }
  return fallback;
}
