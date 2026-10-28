import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { validateEmail } from '../utils/validation';

interface SignUpErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function SignUp() {
  const { registerEmployee } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (formValues = values): SignUpErrors => {
    const next: SignUpErrors = { email: validateEmail(formValues.email) };
    if (!formValues.firstName.trim()) next.firstName = 'First name is required.';
    if (!formValues.lastName.trim()) next.lastName = 'Last name is required.';
    if (formValues.password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!formValues.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (formValues.password !== formValues.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    return next;
  };

  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrorMessage(null);
    if (submitted) setErrors(validate({ ...values, [field]: value }));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    const registered = registerEmployee(values.firstName, values.lastName, values.email, values.password);
    setLoading(false);
    if (!registered) {
      setErrorMessage('An account with this email already exists.');
      return;
    }
    toast({ title: 'Account created', description: `Welcome to ${settings.systemName}.` });
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout title="Create your employee account" description={`Join ${settings.systemName} to access your work and updates.`}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {errorMessage && <Alert tone="danger" title={errorMessage} />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" value={values.firstName} onChange={(event) => update('firstName', event.target.value)} error={errors.firstName} />
          <Input label="Last name" autoComplete="family-name" value={values.lastName} onChange={(event) => update('lastName', event.target.value)} error={errors.lastName} />
        </div>
        <Input label="Work email" type="email" autoComplete="email" placeholder="name@company.com" value={values.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={errors.password}
          hint="Use at least 8 characters."
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="rounded-md p-1.5 text-subtle transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          } />
        <Input
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(event) => update('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
              aria-pressed={showConfirmPassword}
              className="rounded-md p-1.5 text-subtle transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          } />
        <Button type="submit" className="h-10 w-full" loading={loading}>
          {loading ? 'Creating account…' : 'Create employee account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
      </p>
    </AuthLayout>
  );
}