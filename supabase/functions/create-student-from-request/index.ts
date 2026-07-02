import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

const randomPassword = () => crypto.randomUUID().replaceAll('-', '').slice(0, 14) + 'Aa1!';

const findUserByEmail = async (adminClient: any, email: string) => {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 100;

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((item: any) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }

  return null;
};

const upsertStudentAccess = async (
  adminClient: any,
  {
    studentId,
    fullName,
    phone,
    packId,
    startDate,
    endDate,
  }: {
    studentId: string;
    fullName: string;
    phone: string | null;
    packId: string | null;
    startDate: string;
    endDate: string | null;
  },
) => {
  const { error: profileError } = await adminClient.from('profiles').upsert({
    id: studentId,
    full_name: fullName,
    phone,
    role: 'student',
    access_status: 'active',
  });
  if (profileError) throw profileError;

  if (!packId) return;

  const { data: existingPacks, error: existingError } = await adminClient
    .from('student_packs')
    .select('id')
    .eq('student_id', studentId)
    .eq('pack_id', packId);
  if (existingError) throw existingError;

  if (existingPacks?.length) {
    const { error: packUpdateError } = await adminClient
      .from('student_packs')
      .update({
        status: 'active',
        start_date: startDate,
        end_date: endDate,
      })
      .eq('student_id', studentId)
      .eq('pack_id', packId);
    if (packUpdateError) throw packUpdateError;
    return;
  }

  const { error: packInsertError } = await adminClient.from('student_packs').insert({
    student_id: studentId,
    pack_id: packId,
    status: 'active',
    start_date: startDate,
    end_date: endDate,
  });
  if (packInsertError) throw packInsertError;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const body = await req.json();
    const { request_id, start_date, end_date, password } = body;
    if (!request_id) return json({ error: 'request_id requis.' }, 400);

    const { data: request, error: requestError } = await adminClient
      .from('registration_requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (requestError || !request) return json({ error: 'Demande introuvable.' }, 404);

    const temporaryPassword = password || randomPassword();
    const accessStartDate = start_date || new Date().toISOString().slice(0, 10);
    const accessEndDate = end_date || null;
    const existingUser = await findUserByEmail(adminClient, request.email);
    let studentId = existingUser?.id;
    let message = 'Compte étudiant activé avec succès';

    if (existingUser) {
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
        password: temporaryPassword,
        user_metadata: { full_name: request.full_name, phone: request.phone },
      });
      if (passwordError) throw passwordError;
    } else {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: request.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { full_name: request.full_name, phone: request.phone },
      });
      if (createError) throw createError;
      studentId = created.user.id;
      message = 'Compte étudiant créé avec succès';
    }

    if (!studentId) throw new Error('Impossible de déterminer l utilisateur étudiant.');

    await upsertStudentAccess(adminClient, {
      studentId,
      fullName: request.full_name,
      phone: request.phone,
      packId: request.pack_id,
      startDate: accessStartDate,
      endDate: accessEndDate,
    });

    const { error: updateError } = await adminClient
      .from('registration_requests')
      .update({ status: 'accepted' })
      .eq('id', request_id);
    if (updateError) throw updateError;

    return json({
      student_id: studentId,
      email: request.email,
      temporary_password: temporaryPassword,
      message,
    });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
