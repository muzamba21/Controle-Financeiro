import { createClient } from '@supabase/supabase-js';

// ⚠️ ATENÇÃO: Substitua os valores abaixo pelos do seu projeto Supabase
// Você encontra em: Project Settings -> API
const SUPABASE_URL = 'https://sfqttydhyaeropaywppw.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcXR0eWRoeWFlcm9wYXl3cHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDEyNjUsImV4cCI6MjA3OTY3NzI2NX0.COpC2cdUZFv-1AwD9i2bwJ6SBuL5_AoiUU2qji6L_A8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
