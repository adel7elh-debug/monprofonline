import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { requireAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { adminClient } = await requireAdmin(req.headers.get('Authorization'));
    const { document_id } = await req.json();

    if (!document_id) return json({ success: false, error: 'document_id requis.' }, 400);

    const { data: document, error: documentError } = await adminClient
      .from('documents')
      .select('id, file_path')
      .eq('id', document_id)
      .single();

    if (documentError || !document) {
      return json({ success: false, error: 'Document introuvable.' }, 404);
    }

    if (document.file_path) {
      const { error: storageError } = await adminClient.storage.from('documents').remove([document.file_path]);
      if (storageError) {
        console.error('Suppression du fichier PDF ignorée:', {
          document_id,
          file_path: document.file_path,
          message: storageError.message,
        });
      }
    }

    const { error: deleteError } = await adminClient.from('documents').delete().eq('id', document_id);
    if (deleteError) throw deleteError;

    return json({
      success: true,
      message: 'Document supprimé avec succès',
    });
  } catch (error) {
    return json({ success: false, error: error.message || 'Impossible de supprimer ce document.' }, 400);
  }
});
