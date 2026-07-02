import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { user, adminClient } = await requireUser(req.headers.get('Authorization'));
    const { document_id, expires_in = 300 } = await req.json();
    if (!document_id) return json({ error: 'document_id requis.' }, 400);

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, role, access_status')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) return json({ error: 'Profil introuvable.' }, 404);

    const { data: document, error: documentError } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single();
    if (documentError || !document) return json({ error: 'Document introuvable.' }, 404);

    if (profile.role !== 'admin') {
      if (profile.role !== 'student' || profile.access_status !== 'active' || !document.is_visible) {
        return json({ error: 'Acces document refuse.' }, 403);
      }
      const { data: studentPack, error: packError } = await adminClient
        .from('student_packs')
        .select('id')
        .eq('student_id', user.id)
        .eq('pack_id', document.pack_id)
        .eq('status', 'active')
        .maybeSingle();
      if (packError || !studentPack) return json({ error: 'Pack non autorise.' }, 403);
    }

    const { data, error } = await adminClient.storage
      .from('documents')
      .createSignedUrl(document.file_path, Number(expires_in));
    if (error) throw error;
    return json({ signedUrl: data.signedUrl, expires_in });
  } catch (error) {
    return json({ error: error.message }, 400);
  }
});
