const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://avzdwesqovbqtgsqqoqf.supabase.co', 'sb_publishable_fz6-D0hTftcuXtbOdAkUeg_OfbOfJPQ');

async function run() {
  const email = 'test' + Date.now() + '@gmail.com';
  console.log('Signing up with', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { role: 'farmer', full_name: 'Test Farmer', phone: '1234567890', state: 'Kaduna' }
    }
  });
  console.log('Signup result:', JSON.stringify({ data, error }, null, 2));
}

run();
