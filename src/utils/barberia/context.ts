import { createClient } from '@/utils/supabase/client';

/**
 * Obtiene el ID de la barbería para el usuario actualmente logueado.
 * Útil para el panel de administración.
 */
export async function getAdminBarberiaId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('usuarios')
    .select('barberia_id')
    .eq('id', user.id)
    .single();

  return profile?.barberia_id || null;
}

/**
 * Obtiene el ID de la barbería basado en un slug.
 * Útil para las páginas públicas.
 */
export async function getBarberiaIdBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('barberias')
    .select('id')
    .eq('slug', slug)
    .single();

  return data?.id || null;
}
