import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://sxxiztvjpesndhcjpwjr.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eGl6dHZqcGVzbmRoY2pwd2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDg1NTEsImV4cCI6MjA5OTM4NDU1MX0.N2J4gkCldw22_y01fWaIEzXk3t5zFrhvpqZ9yK4otkE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseProduct {
  id: string;
  name: string;
  category: 'Shoes' | 'Bags' | 'Clothes';
  price: number;
  description: string;
  availability: boolean;
  featured: boolean;
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  created_at?: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  created_at?: string;
}

/**
 * Test connectivity with the Supabase project
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string; projectUrl: string }> {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, connection is still active to the project
      if (error.message?.includes('relation "public.products" does not exist') || error.code === '42P01') {
        return {
          connected: true,
          message: 'Connected to Supabase! (Tables pending SQL setup in Supabase SQL editor)',
          projectUrl: SUPABASE_URL
        };
      }
      return {
        connected: false,
        message: `Supabase returned: ${error.message}`,
        projectUrl: SUPABASE_URL
      };
    }
    return {
      connected: true,
      message: 'Connected to Supabase project successfully and tables accessible.',
      projectUrl: SUPABASE_URL
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Failed to connect to Supabase.',
      projectUrl: SUPABASE_URL
    };
  }
}

/**
 * Fetch all products from Supabase
 */
export async function getProductsFromSupabase(): Promise<SupabaseProduct[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase products fetch note:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return [];
  }
}

/**
 * Upload an image file to Supabase storage bucket 'product-images'
 */
export async function uploadImageToSupabase(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase:', err);
    return null;
  }
}

/**
 * Submit contact inquiry to Supabase
 */
export async function submitContactInquiry(name: string, email: string, message: string) {
  return await supabase.from('contact_messages').insert([
    { name, email, message }
  ]);
}

/**
 * Subscribe email to newsletter in Supabase
 */
export async function subscribeToNewsletter(email: string) {
  return await supabase.from('newsletter_subscribers').insert([
    { email }
  ]);
}
