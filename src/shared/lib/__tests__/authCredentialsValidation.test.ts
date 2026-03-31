import { emailFormatError, passwordMinLengthError } from '../authCredentialsValidation';

describe('emailFormatError', () => {
  it('rejects empty and invalid', () => {
    expect(emailFormatError('')).toBe('Email is required');
    expect(emailFormatError('   ')).toBe('Email is required');
    expect(emailFormatError('das')).toBe('Enter a valid email address');
    expect(emailFormatError('a@b')).toBe('Enter a valid email address');
  });

  it('accepts simple valid emails', () => {
    expect(emailFormatError('a@b.co')).toBeNull();
    expect(emailFormatError('  user@example.com  ')).toBeNull();
  });
});

describe('passwordMinLengthError', () => {
  it('enforces minimum length', () => {
    expect(passwordMinLengthError('')).toContain('8');
    expect(passwordMinLengthError('1234567')).toContain('8');
    expect(passwordMinLengthError('12345678')).toBeNull();
  });
});
