import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL ou ANON KEY não definidos nas variáveis de ambiente.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);