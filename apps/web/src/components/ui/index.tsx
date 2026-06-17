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
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-45';
  
  const variants = {
    primary: 'bg-cyan-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)] hover:bg-cyan-300',
    secondary: 'border border-slate-600/80 bg-slate-900/80 text-slate-100 hover:border-cyan-400/70 hover:bg-slate-800',
    danger: 'bg-red-500 text-white hover:bg-red-400',
    ghost: 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
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
      className={`flex h-10 w-full rounded-md border border-slate-600/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-600/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner shadow-black/20 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
      className={`mb-2 block text-sm font-medium leading-none text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
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
    error: 'border-red-400/40 bg-red-950/55 text-red-100',
    success: 'border-emerald-400/40 bg-emerald-950/45 text-emerald-100',
    warning: 'border-amber-300/45 bg-amber-950/45 text-amber-100',
    info: 'border-cyan-300/40 bg-cyan-950/45 text-cyan-100',
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
    <div className="mb-8 flex flex-col gap-4 border-b border-cyan-400/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <div className="mb-2 h-1 w-12 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-48 items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300/20 border-b-cyan-300"></div>
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
    <div className="w-full overflow-auto rounded-lg border border-slate-700/70 bg-slate-900/70 shadow-2xl shadow-black/20">
      <table className="w-full caption-bottom text-sm text-left">
        <thead className="border-b border-slate-700/80 bg-slate-950/80">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-400">
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
  return <tr className={`border-b border-slate-800/90 text-slate-200 transition-colors hover:bg-cyan-400/5 ${className}`}>{children}</tr>;
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
    <div className={`rounded-lg border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 ${className}`}>
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
    <div className="group rounded-lg border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 transition hover:border-cyan-400/45 hover:bg-slate-900">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
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
      <h2 className="mb-5 text-lg font-semibold text-slate-50">{title}</h2>
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
      <TableCell className="py-12 text-center text-slate-400" colSpan={colSpan}>
        <div className="mx-auto max-w-sm rounded-md border border-dashed border-slate-700 bg-slate-950/40 px-5 py-6">
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
    neutral: 'border-slate-500/40 bg-slate-800 text-slate-200',
    success: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-300/35 bg-amber-300/10 text-amber-100',
    danger: 'border-red-400/35 bg-red-400/10 text-red-100',
    info: 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
