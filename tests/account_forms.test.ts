import { describe, expect, it } from 'vitest';
import { validateAccountForm } from '../src/domains/public/auth/accountForm';
import { routeAccountRole } from '../src/shared/auth/routeAccess';

describe('Account form validation', () => {
  const input = { email: ' parent@example.com ', password: 'Ocean-123', displayName: ' Bé Na ', confirmPassword: 'Ocean-123' };
  it('allows only the two test aliases at login and still requires email at registration', () => {
    for (const alias of ['giaovien', 'hocsinh']) {
      expect(validateAccountForm('login', { email: alias, password: alias }).success).toBe(true);
      expect(validateAccountForm('register', { ...input, email: alias }).success).toBe(false);
    }
    expect(validateAccountForm('login', { email: 'otheruser', password: '12345678' }).success).toBe(false);
  });
  it('accepts complete registration and normalizes names and email', () => {
    expect(validateAccountForm('register', input)).toEqual({ success: true, data: { email: 'parent@example.com', password: 'Ocean-123', displayName: 'Bé Na' } });
  });
  it('reports required fields, invalid email, short passwords and mismatched confirmation', () => {
    for (const [field, value] of [['email', 'bad'], ['password', '123'], ['displayName', ' '], ['confirmPassword', 'different']]) {
      const result = validateAccountForm('register', { ...input, [field]: value });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.errors[field]).toBeTruthy();
    }
  });
  it('does not require registration-only fields when logging in, including legacy passwords', () => {
    expect(validateAccountForm('login', { email: input.email, password: '1234' }).success).toBe(true);
  });
  it('separates account spaces while preserving teacher workspaces and token-based scan entry points', () => {
    expect(routeAccountRole('/teacher/resources')).toBe('teacher');
    expect(routeAccountRole('/presentation')).toBe('teacher');
    expect(routeAccountRole('/home')).toBe('student');
    expect(routeAccountRole('/profile')).toBe('student');
    expect(routeAccountRole('/creative/drawing')).toBe('member');
    expect(routeAccountRole('/creative/scan')).toBe(null);
    expect(routeAccountRole('/creative/sea')).toBe(null);
    expect(routeAccountRole('/register')).toBe(null);
  });
});
