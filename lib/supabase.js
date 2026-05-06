import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bdnhtgawhzsikjquwvzj.supabase.co'
const supabaseAnonKey = 'sb_publishable_w5a_CYoqxN2T38Hm_LEoBQ_LzicaQ22'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
