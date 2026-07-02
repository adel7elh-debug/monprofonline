export default function AlertMessage({ type = 'info', children }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return <div className={`rounded-md border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>;
}
