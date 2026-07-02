import { useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Si cet email existe, un lien de reinitialisation sera envoye.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card className="p-6">
        <h1 className="text-2xl font-black text-navy">Mot de passe oublie</h1>
        {message ? <div className="mt-4"><AlertMessage type="info">{message}</AlertMessage></div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <FormInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" loading={loading}>Envoyer le lien</Button>
        </form>
      </Card>
    </main>
  );
}
