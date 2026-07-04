import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const getClients = (authHeader: string | null) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader ?? '' } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  return { userClient, adminClient };
};

export const requireAdmin = async (authHeader: string | null) => {
  if (!authHeader) throw new Error('Authentification requise.');
  const { userClient, adminClient } = getClients(authHeader);
  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) throw new Error('Session invalide.');

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', userData.user.id)
    .single();
  if (profileError || profile?.role !== 'admin') throw new Error('Accès admin requis.');
  return { user: userData.user, adminClient, userClient };
};

export const requireUser = async (authHeader: string | null) => {
  if (!authHeader) throw new Error('Authentification requise.');
  const { userClient, adminClient } = getClients(authHeader);
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) throw new Error('Session invalide.');
  return { user: data.user, adminClient, userClient };
};
