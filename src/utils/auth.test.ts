import { describe, expect, it } from 'vitest';
import { getFirebaseAuthErrorCode, isStrongPassword } from './auth';

describe('isStrongPassword', () => {
  it('requires 8 characters, uppercase, lowercase, and a number', () => {
    expect(isStrongPassword('VidaSana1')).toBe(true);
    expect(isStrongPassword('vidasana1')).toBe(false);
    expect(isStrongPassword('VIDASANA1')).toBe(false);
    expect(isStrongPassword('VidaSana')).toBe(false);
    expect(isStrongPassword('Vida1')).toBe(false);
  });
});

describe('getFirebaseAuthErrorCode', () => {
  it('returns a Firebase code and ignores untyped errors', () => {
    expect(getFirebaseAuthErrorCode({ code: 'auth/email-already-in-use' })).toBe(
      'auth/email-already-in-use',
    );
    expect(getFirebaseAuthErrorCode(new Error('unknown'))).toBeUndefined();
    expect(getFirebaseAuthErrorCode(null)).toBeUndefined();
  });
});
