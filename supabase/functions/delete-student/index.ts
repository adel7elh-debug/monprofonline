import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

const isIgnorableDeleteError = (error: any) => error?.code === '42P01' || error?.code === '42703';

const deleteOptionalRows = async (query: PromiseLike<{ error: any }>, label: string) => {
  const { error } = await query;
  if (!error) return;
  if (isIgnorableDeleteError(error)) {
    console.error(`Suppression optionnelle ignorée pour ${label}:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return;
  }
  throw error;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const { student_id } = await req.json();

    if (!student_id) return json({ success: false, error: 'student_id requis.' }, 400);

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', student_id)
      .single();

    if (profileError || !profile) {
      return json({ success: false, error: 'Étudiant introuvable.' }, 404);
    }

    if (profile.role === 'admin') {
      return json({ success: false, error: 'Impossible de supprimer un administrateur.' }, 400);
    }

    const { data: attempts, error: attemptsError } = await adminClient
      .from('quiz_attempts')
      .select('id')
      .eq('student_id', student_id);

    if (attemptsError && !isIgnorableDeleteError(attemptsError)) throw attemptsError;

    const attemptIds = (attempts || []).map((attempt: { id: string }) => attempt.id);
    if (attemptIds.length) {
      await deleteOptionalRows(
        adminClient.from('quiz_attempt_answers').delete().in('attempt_id', attemptIds),
        'quiz_attempt_answers',
      );
    }

    await deleteOptionalRows(
      adminClient.from('quiz_attempts').delete().eq('student_id', student_id),
      'quiz_attempts',
    );
    await deleteOptionalRows(
      adminClient.from('student_packs').delete().eq('student_id', student_id),
      'student_packs',
    );
    await deleteOptionalRows(
      adminClient.from('answers').delete().eq('student_id', student_id),
      'answers.student_id',
    );
    await deleteOptionalRows(
      adminClient.from('answers').delete().eq('user_id', student_id),
      'answers.user_id',
    );

    const { error: deleteProfileError } = await adminClient.from('profiles').delete().eq('id', student_id);
    if (deleteProfileError) throw deleteProfileError;

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(student_id);
    if (deleteUserError) {
      return json({ success: false, error: deleteUserError.message }, 400);
    }

    return json({
      success: true,
      message: 'Étudiant supprimé avec succès',
    });
  } catch (error) {
    return json({ success: false, error: error.message || 'Impossible de supprimer cet étudiant.' }, 400);
  }
});
