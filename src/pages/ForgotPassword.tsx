import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { validateEmail } from '../utils/validation';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextError = validateEmail(email);
    setError(nextError);
    if (nextError) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  };

  return (
    <AuthLayout title="Reset your password" description="Enter your account email and we'll send reset instructions.">
      {sent ?
      <Alert tone="success" title="Request received">
          If this email exists, password reset instructions would be sent. (Frontend prototype — no email is actually
          sent.)
        </Alert> :

      <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (submitted) setError(validateEmail(e.target.value));
          }}
          error={error} />
        
          <Button type="submit" className="h-10 w-full" loading={loading}>
            {loading ? 'Sending…' : 'Send reset instructions'}
          </Button>
        </form>
      }

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-primary transition-colors duration-150 hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
        Return to login
      </Link>
    </AuthLayout>);

}