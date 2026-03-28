import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://bttpqnuwspwlszzlapht.supabase.co', 'sb_publishable_4_B13I-ub3MVtDqMUgh0bg_yEN7ALTZ');

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', 'pablo.tdeluca@gmail.com');
  console.log('Using ANON key:');
  console.log(JSON.stringify({data, error}, null, 2));
}
test();
