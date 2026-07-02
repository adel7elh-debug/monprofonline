export default function FormInput({ label, error, className = '', as = 'input', ...props }) {
  const Component = as;
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <Component
        className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-navy shadow-sm"
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
