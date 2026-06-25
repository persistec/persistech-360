import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export function Alert({
  variant = 'error',
  children,
  className = '',
}: {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: 'border-danger/35 bg-danger/10 text-danger',
    success: 'border-success/35 bg-success/10 text-success',
    warning: 'border-warning/35 bg-warning/10 text-warning',
    info: 'border-primary/35 bg-primary/10 text-primary',
  };

  const icons = {
    error: FiAlertCircle,
    success: FiCheckCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };
  const Icon = icons[variant];

  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${styles[variant]} ${className}`} role="status">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm shadow-black/5 ${className}`}>
      {children}
    </div>
  );
}

export const SurfaceCard = Card;

export function FormPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`max-w-2xl ${className}`}>
      <h2 className="mb-5 text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </Card>
  );
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <Card className={`flex h-full flex-col justify-between gap-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-5 w-5 text-primary" aria-hidden="true" /> : null}
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
    </Card>
  );
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <Card className="group transition-colors hover:border-primary/45 hover:bg-surface-elevated">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-primary" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <div className="mb-2 h-1 w-12 rounded-full bg-primary shadow-[0_0_18px_var(--color-primary)]" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function PageSection({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ActionBar({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-sm text-muted-foreground" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-b-primary" />
      <p>A carregar conteúdo...</p>
    </div>
  );
}