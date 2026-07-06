const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://avzdwesqovbqtgsqqoqf.supabase.co', 'sb_publishable_fz6-D0hTftcuXtbOdAkUeg_OfbOfJPQ');

async function run() {
  console.log('Signing in with test1783242060733@gmail.com');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test1783242060733@gmail.com',
    password: 'password123',
  });
  console.log('Signin result:', JSON.stringify({ data, error }, null, 2));
}

run();
