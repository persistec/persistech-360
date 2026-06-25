import React from 'react';
import { FiLoader } from 'react-icons/fi';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90',
  secondary: 'border border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-elevated',
  ghost: 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
  subtle: 'border border-transparent bg-surface-muted text-foreground hover:bg-surface-elevated',
  danger: 'border border-danger/35 bg-danger/10 text-danger hover:bg-danger/15',
  destructive: 'border border-danger/35 bg-danger/10 text-danger hover:bg-danger/15',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      <span className={loading ? 'opacity-90' : undefined}>{children}</span>
    </button>
  );
}