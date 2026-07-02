import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

const randomPassword = () => crypto.randomUUID().replaceAll('-', '').slice(0, 14) + 'Aa1!';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const { student_id } = await req.json();
    if (!student_id) return json({ error: 'student_id requis.' }, 400);

    const temporaryPassword = randomPassword();
    const { error: passwordError } = await adminClient.auth.admin.updateUserById(student_id, {
      password: temporaryPassword,
    });
    if (passwordError) throw passwordError;

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(student_id);
    if (userError) throw userError;

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ access_status: 'active' })
      .eq('id', student_id)
      .eq('role', 'student');
    if (profileError) throw profileError;

    return json({
      student_id,
      email: userData.user?.email,
      temporary_password: temporaryPassword,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
