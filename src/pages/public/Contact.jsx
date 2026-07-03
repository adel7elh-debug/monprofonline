import { useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import { submitContactMessage } from '../../lib/dataService';
import { validateContact } from '../../utils/validations';

const initialForm = { full_name: '', phone: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateContact(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await submitContactMessage(form);
      setStatus('Message envoyé. Nous vous contacterons rapidement.');
      setForm(initialForm);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <Card className="p-6">
        <h1 className="text-3xl font-black text-navy">Contact</h1>
        {status ? <div className="mt-4"><AlertMessage type={status.includes('envoyé') ? 'success' : 'error'}>{status}</AlertMessage></div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <FormInput label="Nom" name="full_name" value={form.full_name} onChange={update} />
          <FormInput label="Téléphone" name="phone" value={form.phone} onChange={update} />
          <FormInput label="Email" name="email" value={form.email} onChange={update} error={errors.email} />
          <FormInput label="Message" name="message" as="textarea" rows={5} value={form.message} onChange={update} error={errors.message} />
          <Button type="submit" loading={loading}>Envoyer</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-black text-navy">Coordonnées</h2>
        <div className="mt-5 grid gap-4 text-sm font-semibold text-slate-700">
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-royal" />+212 600 000 000</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-royal" />contact@monprof.online</p>
          <a href="https://wa.me/212600000000" target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
          </a>
        </div>
      </Card>
    </main>
  );
}
