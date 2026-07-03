import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = await signIn(form.email, form.password);
      const redirect = location.state?.from?.pathname;
      const defaultPath = profile.role === 'admin' ? '/admin' : '/student';
      const allowedRedirect =
        (profile.role === 'admin' && redirect?.startsWith('/admin')) ||
        (profile.role === 'student' && redirect?.startsWith('/student'));
      navigate(allowedRedirect ? redirect : defaultPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-black text-navy">Connexion</h1>
        {!isSupabaseConfigured ? (
          <p className="mt-2 text-sm text-slate-600">Mode démo sans Supabase : utilisez un email contenant « admin » pour accéder à l’espace admin.</p>
        ) : null}
        {error ? <div className="mt-4"><AlertMessage type="error">{error}</AlertMessage></div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={update} />
          <FormInput label="Mot de passe" name="password" type="password" value={form.password} onChange={update} />
          <Button type="submit" loading={loading}>Se connecter</Button>
        </form>
        <Link to="/forgot-password" className="mt-4 block text-sm font-semibold text-royal">Mot de passe oublié ?</Link>
      </Card>
    </main>
  );
}
