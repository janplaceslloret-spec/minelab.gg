import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://bttpqnuwspwlszzlapht.supabase.co', 'sb_publishable_4_B13I-ub3MVtDqMUgh0bg_yEN7ALTZ');

async function test() {
  const userId = '123e4567-e89b-12d3-a456-426614174000'; // dummy uuid
  const lowerEmail = 'pablo.tdeluca@gmail.com';
  
  const { data, error } = await supabase.from('profiles').select('*').or(`id.eq.${userId},email.eq.${lowerEmail}`);
  console.log(JSON.stringify({data, error}, null, 2));
}
test();
