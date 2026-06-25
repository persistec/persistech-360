'use client';

import React, { useId } from 'react';

const controlBaseClass = [
  'flex min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-colors',
  'placeholder:text-foreground/60',
  'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground disabled:opacity-70',
].join(' ');

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return <input className={`${controlBaseClass} ${className}`} {...props} />;
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select className={`${controlBaseClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={`${controlBaseClass} min-h-28 resize-y ${className}`} {...props} />;
}

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`mb-2 block text-sm font-medium leading-5 text-foreground ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

type FormFieldControlProps = {
  id?: string;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

type FormFieldProps = {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactElement<FormFieldControlProps>;
};

export function FormField({
  label,
  description,
  error,
  required,
  className = '',
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const childProps = children.props;
  const controlId = childProps.id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  const control = React.cloneElement(children, {
    id: controlId,
    required: required ?? childProps.required,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': error ? true : childProps['aria-invalid'],
  });

  return (
    <div className={className}>
      <Label htmlFor={controlId}>
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </Label>
      {control}
      {description ? (
        <p id={descriptionId} className="mt-1 text-xs leading-5 text-foreground/80">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-5 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}