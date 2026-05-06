// ── Supabase Config ────────────────────────────────────────
const SUPABASE_URL = 'https://bdnhtgawhzsikjquwvzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w5a_CYoqxN2T38Hm_LEoBQ_LzicaQ22';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth Functions ────────────────────────────────────────
async function handleLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function handleRegister(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data.user;
}

async function handleLogout() {
  await supabase.auth.signOut();
  location.reload();
}

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    showApp(profile?.full_name || user.email);
  }
}

// ── Transaction Functions ────────────────────────────────────────
async function fetchTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });
  
  if (error) console.error(error);
  return data || [];
}

async function addTransaction(type, amount, category, description, date) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date
    }]);
  
  if (error) throw error;
  return data;
}

// ── Goals Functions ────────────────────────────────────────
async function fetchGoals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('deadline', { ascending: true });
  
  if (error) console.error(error);
  return data || [];
}

async function addGoal(title, targetAmount, deadline) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  
  const { data, error } = await supabase
    .from('goals')
    .insert([{
      user_id: user.id,
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline
    }]);
  
  if (error) throw error;
  return data;
}

// ── Aggregation Functions ────────────────────────────────────────
async function fetchAll() {
  state.transactions = await fetchTransactions();
  state.goals = await fetchGoals();
  calculateMetrics();
}

function calculateMetrics() {
  const trans = state.transactions || [];
  
  state.balance = trans.reduce((sum, t) => {
    return sum + (t.type === 'receita' ? t.amount : -t.amount);
  }, 0);
  
  state.monthlyIncome = trans
    .filter(t => t.type === 'receita' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  
  state.monthlyExpense = trans
    .filter(t => t.type === 'despesa' && isCurrentMonth(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  
  state.categories = [...new Set(trans.map(t => t.category))];
}

function isCurrentMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
