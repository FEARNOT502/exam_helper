import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const v = {
    primary: 'eh-btn-primary',
    secondary: 'eh-btn-secondary',
    danger: 'eh-btn-danger',
    ghost: 'eh-btn-ghost',
  }[variant];
  const s = { sm: 'eh-btn-sm', md: '', lg: 'eh-btn-lg' }[size];

  return (
    <button className={`eh-btn ${v} ${s} ${className}`} {...props}>
      {children}
    </button>
  );
}
