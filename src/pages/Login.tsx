import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { demoCredentials } from '../data/mockAuth';
import { validateEmail, validatePassword } from '../utils/validation';
import { useSettings } from '../contexts/SettingsContext';

interface FieldErrors {
  email?: string;
  password?: string;
}

const linkClass =
'rounded text-[13px] font-medium text-primary transition-colors duration-150 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function Login() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (nextEmail: string, nextPassword: string): FieldErrors => ({
    email: validateEmail(nextEmail),
    password: validatePassword(nextPassword)
  });

  const onEmailChange = (value: string) => {
    setEmail(value);
    setAuthError(null);
    if (submitted) setErrors((e) => ({ ...e, email: validateEmail(value) }));
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    setAuthError(null);
    if (submitted) setErrors((e) => ({ ...e, password: validatePassword(value) }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    setAuthError(null);
    window.setTimeout(() => {
      const ok = login(email, password, remember);
      setLoading(false);
      if (ok) {
        navigate('/dashboard', { replace: true });
        toast({ title: 'Welcome back', description: `You are signed in to ${settings.systemName}.` });
      } else {
        setAuthError('Invalid email or password.');
      }
    }, 600);
  };

  const fillDemo = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setErrors({});
    setAuthError(null);
  };

  return (
    <AuthLayout title={`Sign in to ${settings.systemName}`} description={settings.tagline}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {authError &&
        <Alert tone="danger" title={authError}>
            Check your details and try again.
          </Alert>
        }

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={errors.email} />
        

        <div className="space-y-1.5">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            error={errors.password}
            rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="rounded-md p-1.5 text-subtle transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            } />
          
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-primary" />
            
            Remember me
          </label>
          <Link to="/forgot-password" className={linkClass}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="h-10 w-full" loading={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-line bg-surface p-4">
        <p className="text-[13px] font-medium text-ink">Prototype demo access</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Temporary mock account for testing this frontend only — not a real or production credential.
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
          <dt className="text-muted">Email</dt>
          <dd className="font-mono text-ink">{demoCredentials.email}</dd>
          <dt className="text-muted">Password</dt>
          <dd className="font-mono text-ink">{demoCredentials.password}</dd>
        </dl>
        <Button variant="secondary" size="sm" className="mt-3" onClick={fillDemo}>
          Fill demo credentials
        </Button>
      </div>
      <p className="mt-6 text-center text-[13px] text-muted">
        New to WorkSync?{' '}
        <Link to="/sign-up" className={linkClass}>Create an employee account</Link>
      </p>
    </AuthLayout>);

}
