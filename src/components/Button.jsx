import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gold text-navy hover:bg-[#c5962f]',
  secondary: 'bg-royal text-white hover:bg-navy',
  outline: 'border border-royal/20 bg-white text-navy hover:bg-mist',
  ghost: 'text-navy hover:bg-mist',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
