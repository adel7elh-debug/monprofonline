import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import { listPacks } from '../../lib/dataService';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { validateRegistration } from '../../utils/validations';

const initialForm = {
  full_name: '',
  phone: '',
  email: '',
  city: '',
  study_level: '',
  field: '',
  pack_id: '',
  message: '',
};

export default function RegisterRequest() {
  const [form, setForm] = useState(initialForm);
  const [packs, setPacks] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listPacks().then((data) => {
      setPacks(data);
      setForm((current) => ({ ...current, pack_id: current.pack_id || data[0]?.id || '' }));
    });
  }, []);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setStatus('Mode démo : Supabase n’est pas configuré. La demande n’a pas été enregistrée en base.');
        return;
      }

      const formData = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        city: form.city || null,
        study_level: form.study_level || null,
        field: form.field || null,
        pack_id: form.pack_id || null,
        message: form.message || null,
        status: 'pending',
      };

      const { error } = await supabase.from('registration_requests').insert(formData);
      if (error) {
        console.error('Registration insert error:', error);
        throw error;
      }

      setStatus('Votre demande d’inscription a été reçue. L’administration vous contactera pour activer votre accès.');
      setForm(initialForm);
    } catch (error) {
      console.error('Registration insert error:', error);
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="p-6">
        <h1 className="text-3xl font-black text-navy">Demande d’inscription</h1>
        <p className="mt-2 text-slate-600">La création du compte est effectuée manuellement par l’administration après validation.</p>
        {status ? <div className="mt-5"><AlertMessage type={status.includes('reçue') ? 'success' : 'error'}>{status}</AlertMessage></div> : null}
        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
          <FormInput label="Nom complet" name="full_name" value={form.full_name} onChange={update} error={errors.full_name} />
          <FormInput label="Téléphone" name="phone" value={form.phone} onChange={update} error={errors.phone} />
          <FormInput label="Email" name="email" value={form.email} onChange={update} error={errors.email} />
          <FormInput label="Ville" name="city" value={form.city} onChange={update} />
          <FormInput label="Niveau d’étude" name="study_level" value={form.study_level} onChange={update} />
          <FormInput label="Filière" name="field" value={form.field} onChange={update} />
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Pack souhaité</span>
            <select name="pack_id" value={form.pack_id} onChange={update} className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              {packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
            </select>
          </label>
          <FormInput label="Message" name="message" as="textarea" rows={4} value={form.message} onChange={update} className="md:col-span-2" />
          <div className="md:col-span-2">
            <Button type="submit" loading={loading}>Envoyer la demande</Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
