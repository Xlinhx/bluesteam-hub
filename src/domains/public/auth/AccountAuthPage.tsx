import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from '../../../app/router';
import { ApiClientError } from '../../../shared/api/client';
import { authenticateAccount, type AccountRole } from '../../../shared/auth/accountSession';
import { BlueSteamLogo } from '../../../shared/ui/badges/BlueSteamLogo';
import { LanguageToggle } from '../../../shared/ui/badges/LanguageToggle';
import { validateAccountForm, type AuthMode } from './accountForm';
import { usePublicMotion } from '../components/usePublicMotion';
import './auth.css';
import { OceanFieldwork } from '../components/OceanFieldwork';

export function AccountAuthPage({ mode = 'login' }: { mode?: AuthMode }) {
  const { query } = useRouter();
  const role: AccountRole = query.role === 'student' ? 'student' : 'teacher';
  return <AccountForm mode={mode} role={role} />;
}

function AccountForm({ mode, role }: { mode: AuthMode; role: AccountRole }) {
  const { navigate, query } = useRouter();
  const inviteCode = query.join;
  const register = mode === 'register', student = role === 'student';
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''), [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false), [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}), [serverError, setServerError] = useState('');
  const submitting = useRef(false), formRef = useRef<HTMLFormElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const identity = `${mode}:${role}`;
  const [formIdentity, setFormIdentity] = useState(identity);
  // Reset before committing the new layout so geometry never includes old errors.
  // The role buttons remain mounted, preserving keyboard focus.
  if (formIdentity !== identity) {
    setFormIdentity(identity);
    setEmail(''); setPassword(''); setDisplayName(''); setConfirmation('');
    setShowPassword(false); setErrors({}); setServerError('');
    setBusy(false);
  }
  useLayoutEffect(() => {
    const controller = new AbortController();
    requestController.current = controller; submitting.current = false;
    return () => controller.abort();
  }, [identity]);
  usePublicMotion(root, 'auth', identity);
  const title = `${register ? 'Đăng ký' : 'Đăng nhập'} ${student ? 'cho bé' : 'giáo viên'}`;

  const go = (nextMode: AuthMode, nextRole = role) => navigate(nextMode === 'login' ? '/login' : '/register', { query: { role: nextRole, ...(inviteCode ? { join:inviteCode } : {}) }, preserveQuery: false });
  const edit = (field: string, value: string, setter: (value: string) => void) => {
    setter(value); setErrors(previous => ({ ...previous, [field]: '' })); setServerError('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    setServerError('');
    const result = validateAccountForm(mode, { email, password, displayName, confirmPassword: confirmation });
    if (!result.success) {
      setErrors(result.errors);
      const firstField = Object.keys(result.errors)[0];
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    const controller = requestController.current;
    if (!controller || controller.signal.aborted) return;
    submitting.current = true; setBusy(true); setErrors({});
    try {
      const account = await authenticateAccount(mode, { role, ...result.data }, controller.signal);
      if (controller.signal.aborted || requestController.current !== controller) return;
      const classInvitation = account.role === 'student' && inviteCode;
      navigate(account.role === 'teacher' ? '/teacher' : classInvitation ? '/profile' : '/home', {
        preserveQuery: false, query: classInvitation ? {join:classInvitation} : undefined,
      });
    } catch (error) {
      if (controller.signal.aborted || requestController.current !== controller) return;
      setServerError(error instanceof ApiClientError ? error.message : 'Chưa thể kết nối máy chủ. Vui lòng thử lại.');
    } finally {
      if (!controller.signal.aborted && requestController.current === controller) { submitting.current = false; setBusy(false); }
    }
  };

  const field = (name: string, label: string, value: string, setter: (value: string) => void, options: { password?: boolean; autoComplete: string; placeholder: string; maxLength?: number }) =>
    <div className={`account-field${name === 'displayName' || name === 'confirmPassword' ? ' account-field--extra' : ''}`}>
      <label htmlFor={`account-${name}`}>{label}</label>
      <div className="account-input-wrap">
        <input className="ui-field" id={`account-${name}`} name={name} type={options.password ? (showPassword ? 'text' : 'password') : name === 'email' && register ? 'email' : 'text'}
          value={value} onChange={event => edit(name, event.target.value, setter)} autoComplete={options.autoComplete}
          placeholder={options.placeholder} maxLength={options.maxLength || (options.password ? 200 : name === 'email' ? 254 : 80)}
          required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `error-${name}` : name === 'password' && register ? 'password-hint' : undefined}
          autoCapitalize={name === 'email' ? 'none' : undefined} spellCheck={name === 'email' ? false : undefined} />
        {name === 'password' && <button className="account-eye" type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>}
      </div>
      {name === 'password' && register && <p className="account-hint" id="password-hint">Ít nhất 8 ký tự.</p>}
      {errors[name] && <p className="account-field-error" role="status" id={`error-${name}`}>{errors[name]}</p>}
    </div>;

  return <div ref={root} className="account-page" data-role={role} data-mode={mode}>
    <aside className="account-coast" aria-label="BlueSTEAM — Khám phá đại dương">
      <div className="account-coast-image" aria-hidden="true" />
      <OceanFieldwork variant="auth" />
      <button type="button" className="account-logo" onClick={() => navigate('/')} aria-label="Về trang chủ BlueSTEAM"><BlueSteamLogo size="lg" variant="mockup" showTagline tagline={student ? 'Khám phá đại dương' : undefined} /></button>
      <div className="account-coast-copy">{student ? <h2>Chạm để khám phá, chơi để học hỏi!</h2> : <><p>Mỗi khám phá, một điều kỳ diệu</p><h2>Cùng mở ra<br />một đại dương mới.</h2></>}</div>
    </aside>
    <main className="account-main">
      <OceanFieldwork variant="form" />
      <header className="account-top"><button type="button" className="account-link" onClick={() => navigate('/entry')}><ArrowLeft size={16} /> Chọn vai trò</button><LanguageToggle variant="dropdown" /></header>
      <section className="account-content" aria-labelledby="account-title">
        <nav className="account-roles" aria-label="Vai trò tài khoản">
          <button type="button" aria-pressed={!student} disabled={busy} onClick={() => go(mode, 'teacher')}>Giáo viên</button>
          <button type="button" aria-pressed={student} disabled={busy} onClick={() => go(mode, 'student')}>Học sinh</button>
        </nav>
        <p className="account-eyebrow">{student ? 'KHÔNG GIAN CỦA BÉ' : 'KHÔNG GIAN GIÁO VIÊN'}</p>
        <h1 id="account-title">{title}</h1>
        <p className="account-description">{student ? 'Phụ huynh dùng email của mình để tạo và đăng nhập tài khoản cho bé.' : 'Chuẩn bị học liệu, tổ chức hoạt động và đồng hành cùng các bé.'}</p>
        <form ref={formRef} onSubmit={submit} noValidate aria-label={title}>
          <fieldset disabled={busy}>
            {register && field('displayName', student ? 'Tên bé' : 'Tên hiển thị', displayName, setDisplayName, { autoComplete: 'name', placeholder: student ? 'Ví dụ: Bé Na' : 'Ví dụ: Cô Linh' })}
            {field('email', student ? 'Email phụ huynh' : 'Email giáo viên', email, setEmail, { autoComplete: register ? 'email' : 'username', placeholder: register ? (student ? 'phuhuynh@example.com' : 'giaovien@example.com') : (student ? 'Email hoặc tài khoản thử hocsinh' : 'Email hoặc tài khoản thử giaovien') })}
            {field('password', 'Mật khẩu', password, setPassword, { password: true, autoComplete: register ? 'new-password' : 'current-password', placeholder: register ? 'Tạo mật khẩu từ 8 ký tự' : 'Nhập mật khẩu' })}
            {register && field('confirmPassword', 'Nhập lại mật khẩu', confirmation, setConfirmation, { password: true, autoComplete: 'new-password', placeholder: 'Nhập lại mật khẩu vừa tạo' })}
          </fieldset>
          {serverError && <div className="account-alert" role="alert"><AlertCircle size={19} /><span>{serverError}</span></div>}
          <button type="submit" className="account-submit" disabled={busy} aria-busy={busy}>
            {busy ? <><Loader2 className="account-spinner" size={19} /> {register ? 'Đang tạo tài khoản…' : 'Đang đăng nhập…'}</> : <><span>{register ? 'Tạo tài khoản' : 'Đăng nhập'}</span> <ArrowRight size={19} /></>}
          </button>
        </form>
        <p className="account-switch">{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <button type="button" className="account-link" disabled={busy} onClick={() => go(register ? 'login' : 'register')}>{register ? 'Đăng nhập' : 'Đăng ký ngay'}</button></p>
        {student && register && <p className="account-hint account-parent-note">Mỗi email phụ huynh tạo một tài khoản bé trong phiên bản này.</p>}
      </section>
      <footer className="account-footer">{student ? 'BlueSTEAM Hub - Mở thế giới xanh, khơi nguồn sáng tạo' : 'BlueSTEAM · Cùng bé khám phá đại dương'}</footer>
    </main>
  </div>;
}
