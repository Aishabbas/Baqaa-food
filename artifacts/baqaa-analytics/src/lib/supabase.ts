import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sxojvogkvampikyrkmlm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2p2b2drdmFtcGlreXJrbWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzEyNTAsImV4cCI6MjA5MjQ0NzI1MH0.KajYooeK--f2Pf-l08MzPWIlQQy6mEq_s0rV73Hi39s';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Analytics will show no data.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
