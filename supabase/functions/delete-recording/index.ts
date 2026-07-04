import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const { recording_id } = await req.json();

    if (!recording_id) return json({ success: false, error: 'recording_id requis.' }, 400);

    const { data: recording, error: recordingError } = await adminClient
      .from('recordings')
      .select('*')
      .eq('id', recording_id)
      .single();

    if (recordingError || !recording) {
      return json({ success: false, error: 'Enregistrement introuvable.' }, 404);
    }

    if (recording.file_path) {
      const { error: storageError } = await adminClient.storage.from('recordings').remove([recording.file_path]);
      if (storageError) {
        console.error('Suppression du fichier vidéo ignorée:', {
          recording_id,
          file_path: recording.file_path,
          message: storageError.message,
        });
      }
    }

    const { error: deleteError } = await adminClient.from('recordings').delete().eq('id', recording_id);
    if (deleteError) throw deleteError;

    return json({
      success: true,
      message: 'Enregistrement supprimé avec succès',
    });
  } catch (error) {
    return json({ success: false, error: error.message || 'Impossible de supprimer cet enregistrement.' }, 400);
  }
});
