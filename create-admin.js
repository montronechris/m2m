// create-admin.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ylzuyhmtzfqnoyqkwiqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Iw6QY5_To7bnvS71ptaMUA_bu87G0CM'; // Usa la tua ANON KEY o SERVICE ROLE KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
  const email = 'ggxblood07@gmail.com';
  const password = 'abc123';

  console.log('Creazione utente admin in corso...');

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Conferma automaticamente l'email
    user_metadata: { role: 'admin' }
  });

  if (error) {
    console.error('Errore:', error.message);
  } else {
    console.log('✅ Utente creato con successo!', data.user.id);
    console.log('La password è stata hashata automaticamente da Supabase.');
  }
}

createAdmin();