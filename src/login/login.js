import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://enowxmavjeajqapgeqfo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVub3d4bWF2amVhanFhcGdlcWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjM0ODksImV4cCI6MjA5NjQzOTQ4OX0.vUxtJbmSpMPLO0CTG01TrYPyDtmL4Zvqg-ny-JSPhwo';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.classList.add('hidden');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    errorMsg.textContent = 'Błąd: ' + error.message;
console.error(error);
    errorMsg.classList.remove('hidden');
  } else {

    window.location.href = import.meta.env.BASE_URL + '?t=' + Date.now();
  }
});