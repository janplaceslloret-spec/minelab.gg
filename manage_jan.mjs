import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bttpqnuwspwlszzlapht.supabase.co', 'sb_publishable_4_B13I-ub3MVtDqMUgh0bg_yEN7ALTZ');

async function main() {
  // 1. Buscar el perfil de janplaces@minelab.gg
  console.log('=== BUSCANDO PERFIL janplaces@minelab.gg ===');
  const { data: profile, error: readErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'janplaces@minelab.gg')
    .single();

  if (readErr) {
    console.log('Error leyendo perfil:', readErr.message);
    // intentar con ilike por si acaso
    const { data: profile2, error: e2 } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', '%jan%');
    console.log('Búsqueda amplia:', JSON.stringify({data: profile2, error: e2}, null, 2));
    return;
  }

  console.log('Perfil encontrado:', JSON.stringify(profile, null, 2));

  // 2. Resetear el plan (quitar el plan de prueba)
  console.log('\n=== RESETEANDO PLAN ===');
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({
      plan_status: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    })
    .eq('email', 'janplaces@minelab.gg')
    .select();

  if (updateErr) {
    console.log('Error actualizando:', updateErr.message);
  } else {
    console.log('Plan reseteado:', JSON.stringify(updated, null, 2));
  }
}

main().catch(console.error);
