import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-[0_0_24px_var(--color-primary)] hover:bg-primary/80',
    secondary: 'border border-border bg-surface-muted text-foreground hover:border-primary/70 hover:bg-surface',
    danger: 'bg-danger text-white hover:bg-danger/80',
    ghost: 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-border bg-input/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`flex h-10 w-full items-center justify-between rounded-md border border-border bg-input/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  className = '',
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-2 block text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

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
    error: 'border-danger/40 bg-danger/10 text-danger',
    success: 'border-success/40 bg-success/10 text-success',
    warning: 'border-warning/40 bg-warning/10 text-warning',
    info: 'border-primary/40 bg-primary/10 text-primary',
  };

  return (
    <div className={`rounded-md border p-4 text-sm leading-6 shadow-sm ${styles[variant]} ${className}`}>
      {children}
    </div>
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
    <div className="mb-8 flex flex-col gap-4 border-b border-primary/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <div className="mb-2 h-1 w-12 rounded-full bg-primary shadow-[0_0_18px_var(--color-primary)]" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-48 items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-b-primary"></div>
    </div>
  );
}

export function Table({
  headers,
  children,
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-surface shadow-2xl shadow-black/5">
      <table className="w-full caption-bottom text-sm text-left">
        <thead className="border-b border-border bg-surface-elevated">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tr className={`border-b border-border text-foreground transition-colors hover:bg-primary/5 ${className}`}>{children}</tr>;
}

export function TableCell({ children, className = '', colSpan }: { children: React.ReactNode, className?: string, colSpan?: number }) {
  return <td className={`p-4 align-middle ${className}`} colSpan={colSpan}>{children}</td>;
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-6 shadow-2xl shadow-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function DashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-lg border border-border bg-surface p-6 shadow-2xl shadow-black/5 transition hover:border-primary/45 hover:bg-surface-elevated">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary shadow-[0_0_22px_var(--color-primary)]">
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

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

export function EmptyState({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-12 text-center text-muted-foreground" colSpan={colSpan}>
        <div className="mx-auto max-w-sm rounded-md border border-dashed border-border bg-surface-muted px-5 py-6">
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'border-border bg-surface-muted text-foreground',
    success: 'border-success/35 bg-success/10 text-success',
    warning: 'border-warning/35 bg-warning/10 text-warning',
    danger: 'border-danger/35 bg-danger/10 text-danger',
    info: 'border-primary/35 bg-primary/10 text-primary',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
