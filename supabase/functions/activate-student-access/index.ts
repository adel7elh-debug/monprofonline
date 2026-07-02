import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const { student_id, access_status, pack_status, start_date, end_date } = await req.json();
    if (!student_id || !access_status) return json({ error: 'student_id et access_status requis.' }, 400);

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ access_status })
      .eq('id', student_id)
      .eq('role', 'student');
    if (profileError) throw profileError;

    const nextPackStatus = pack_status || (access_status === 'active' ? 'active' : access_status);
    const payload: Record<string, unknown> = { status: nextPackStatus };
    if (start_date) payload.start_date = start_date;
    if (end_date) payload.end_date = end_date;

    const { error: packError } = await adminClient
      .from('student_packs')
      .update(payload)
      .eq('student_id', student_id);
    if (packError) throw packError;

    return json({ ok: true });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
