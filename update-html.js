const fs = require('fs');

let html = fs.readFileSync('app/index.html', 'utf-8');

// Atualizar a configuração do Supabase no início do script
const supabaseConfig = `
        // ── Supabase Config ────────────────────────────────────────
        const SUPABASE_URL = 'https://bdnhtgawhzsikjquwvzj.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_w5a_CYoqxN2T38Hm_LEoBQ_LzicaQ22';
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
`;

// Encontrar onde inserir a configuração (antes de "// ── State ──")
html = html.replace(
  /\/\/ ── State ──/,
  supabaseConfig + '\n        // ── State ──'
);

fs.writeFileSync('app/index.html', html);
console.log('✅ HTML atualizado com Supabase!');
