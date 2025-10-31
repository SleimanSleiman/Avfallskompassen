import React from 'react';

type SoftButtonVariant = 'green' | 'blue' | 'red';
type SoftButtonSize = 'sm' | 'md';

export type SoftButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: SoftButtonVariant;
  size?: SoftButtonSize;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const sizeClasses: Record<SoftButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
};

const variantClasses: Record<SoftButtonVariant, string> = {
  green: 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-600',
  blue: 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-600',
  red: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-600',
};

export default function SoftButton({
  variant,
  size = 'md',
  className = '',
  children,
  ...props
}: SoftButtonProps) {
  const classes = [baseClasses, sizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}


