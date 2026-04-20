import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bttpqnuwspwlszzlapht.supabase.co', 'sb_publishable_4_B13I-ub3MVtDqMUgh0bg_yEN7ALTZ');

async function main() {
  // Ver todos los campos del perfil de jan
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'janplaces@minelab.gg')
    .single();

  console.log('Perfil completo:', JSON.stringify(profile, null, 2));
  console.log('Columnas disponibles:', Object.keys(profile || {}));

  // Resetear solo plan_status a null
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update({ plan_status: null })
    .eq('email', 'janplaces@minelab.gg')
    .select();

  if (updateErr) {
    console.log('Error:', updateErr.message);
  } else {
    console.log('Plan reseteado a null:', JSON.stringify(updated, null, 2));
  }
}

main().catch(console.error);
