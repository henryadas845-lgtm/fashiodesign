import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://sxxiztvjpesndhcjpwjr.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eGl6dHZqcGVzbmRoY2pwd2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDg1NTEsImV4cCI6MjA5OTM4NDU1MX0.N2J4gkCldw22_y01fWaIEzXk3t5zFrhvpqZ9yK4otkE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function subscribeToNewsletter(email: string) {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, created_at: new Date().toISOString() }]);
    if (error) {
      console.warn('Supabase newsletter note:', error);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase newsletter catch:', err);
    return { error: err };
  }
}

export async function submitContactInquiry(name: string, email: string, message: string) {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, message, created_at: new Date().toISOString() }]);
    if (error) {
      console.warn('Supabase contact note:', error);
    }
    return { data, error };
  } catch (err) {
    console.warn('Supabase contact catch:', err);
    return { error: err };
  }
}
