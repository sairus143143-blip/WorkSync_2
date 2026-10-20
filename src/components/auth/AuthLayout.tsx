import React from 'react';
import { Logo, LogoMark } from '../layout/Logo';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/** Two-pane layout for login screens: brand panel on desktop, form on the right. */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-bg text-ink">
      <aside className="hidden w-[44%] max-w-[600px] flex-col justify-between bg-primary p-12 text-primary-fg lg:flex">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-semibold tracking-tight">WorkSync</span>
        </div>
        <div>
          <p className="text-4xl font-semibold leading-tight tracking-tight">
            Connect.
            <br />
            Manage.
            <br />
            Accomplish.
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-primary-fg/85">
            Employee Workforce &amp; Productivity Management Platform — people, attendance, projects and performance in one
            place.
          </p>
        </div>
        <p className="text-[13px] text-primary-fg/75">© {new Date().getFullYear()} WorkSync · Frontend prototype</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[400px]">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>);

}
