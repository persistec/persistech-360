import React from 'react';
import { FiInbox } from 'react-icons/fi';

export function Table({
  headers,
  children,
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-sm shadow-black/5">
      <table className="min-w-full caption-bottom text-left text-sm">
        <thead className="bg-surface-elevated">
          <tr className="border-b border-border">
            {headers.map((header, index) => (
              <th
                key={index}
                className="h-12 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`border-b border-border text-foreground transition-colors hover:bg-surface-muted ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = '',
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td className={`px-4 py-4 align-middle ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function EmptyState({
  colSpan,
  children,
  title = 'Sem resultados',
  description,
  action,
  icon: Icon = FiInbox,
  className = '',
}: {
  colSpan: number;
  children?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <TableRow className={`hover:bg-transparent ${className}`}>
      <TableCell className="py-12 text-center text-muted-foreground" colSpan={colSpan}>
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted px-5 py-6 text-center">
          <Icon className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">{children ?? title}</p>
          {description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}
