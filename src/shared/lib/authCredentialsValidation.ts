export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailFormatError(email: string): string | null {
  const t = email.trim();
  if (!t) return 'Email is required';
  if (!EMAIL_RE.test(t)) return 'Enter a valid email address';
  return null;
}

export function passwordMinLengthError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}
