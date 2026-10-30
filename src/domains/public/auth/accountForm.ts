export type AuthMode = 'login' | 'register';
export type AccountFormInput = { email: string; password: string; displayName?: string; confirmPassword?: string };
export function validateAccountForm(mode: AuthMode, input: AccountFormInput):
  | { success: true; data: { email: string; password: string; displayName: string } }
  | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const email = input.email.trim().toLowerCase(), displayName = (input.displayName || '').trim();
  const testLogin = mode === 'login' && (email === 'giaovien' || email === 'hocsinh');
  if (!testLogin && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) errors.email = 'Vui lòng nhập email hợp lệ.';
  if (!input.password) errors.password = 'Vui lòng nhập mật khẩu.';
  else if (input.password.length > 200) errors.password = 'Mật khẩu tối đa 200 ký tự.';
  if (mode === 'register') {
    if (!displayName || displayName.length > 80) errors.displayName = 'Vui lòng nhập tên từ 1 đến 80 ký tự.';
    if (input.password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.';
    if (input.confirmPassword !== input.password || !input.confirmPassword) errors.confirmPassword = 'Mật khẩu nhập lại chưa khớp.';
  }
  return Object.keys(errors).length ? { success: false, errors } : { success: true, data: { email, password: input.password, displayName } };
}
