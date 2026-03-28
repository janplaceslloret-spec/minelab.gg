import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bttpqnuwspwlszzlapht.supabase.co', 'sb_publishable_4_B13I-ub3MVtDqMUgh0bg_yEN7ALTZ');

async function test() {
  const userId = 'add47bb9-9f19-4dc8-a3f2-845ddd3d5f47'; // Pablo's valid uuid from check_duplicates.mjs
  
  const { data, error } = await supabase.from('profiles').select('*').or(`id.eq.${userId},email.eq.`);
  console.log('Result with email.eq.:', JSON.stringify({data, error}, null, 2));

  const { data: data2, error: error2 } = await supabase.from('profiles').select('*').eq('id', userId);
  console.log('Result with just id.eq:', JSON.stringify({data: data2, error: error2}, null, 2));
}
test();
