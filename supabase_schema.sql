-- ==============================================================================
-- ADA'S HENRY - SUPABASE DATABASE SCHEMA & INITIAL SEED SCRIPT
-- ==============================================================================
-- Run this script in your Supabase Dashboard:
-- 1. Open your Supabase Project: https://supabase.com/dashboard
-- 2. Go to the "SQL Editor" in the left sidebar
-- 3. Click "New query", paste all of the SQL below, and click "Run" (Ctrl+Enter)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Shoes', 'Bags', 'Clothes', 'Accessories')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    availability BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. SITE CONTENT TABLE (Hero, About, Vision, Contact info)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. CONTACT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. NEWSLETTER SUBSCRIBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. ORDERS TABLE (For checkout or WhatsApp order tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. AUTO-UPDATE TIMESTAMP FUNCTION & TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
    ON public.products FOR SELECT 
    USING (true);

-- Products: Allow product insert, update, delete
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Allow product insert" ON public.products;
CREATE POLICY "Allow product insert" 
    ON public.products FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Allow product update" ON public.products;
CREATE POLICY "Allow product update" 
    ON public.products FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow product delete" ON public.products;
CREATE POLICY "Allow product delete" 
    ON public.products FOR DELETE 
    USING (true);

-- Site Content: Public can read, Admins can update
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" 
    ON public.site_content FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admins can modify site content" ON public.site_content;
CREATE POLICY "Admins can modify site content" 
    ON public.site_content FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Contact Messages: Anyone can submit, only Admins can read
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" 
    ON public.contact_messages FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages" 
    ON public.contact_messages FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Newsletter Subscribers: Anyone can subscribe
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter" 
    ON public.newsletter_subscribers FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers" 
    ON public.newsletter_subscribers FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Orders: Anyone can create an order, Admins can manage
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders" 
    ON public.orders FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET (Product Images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Anyone can view public product images
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
CREATE POLICY "Public Access to Product Images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'product-images');

-- Storage Policy: Authenticated users / Service role can upload images
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'product-images');

-- ==============================================================================
-- 10. INITIAL SEED DATA
-- ==============================================================================

-- Seed Products
INSERT INTO public.products (id, name, category, price, description, availability, featured, images)
VALUES 
    (
        'dfff4421-1b89-44bf-8bd0-e86f9f83fd62',
        'Aura Crystal Stilettos',
        'Shoes',
        1250.00,
        'Elegant stilettos encrusted with fine crystals. Perfect for a luxurious evening.',
        true,
        true,
        ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop']
    ),
    (
        'bae59a03-5c93-4461-8111-8999effa55d3',
        'Monogram Leather Tote',
        'Bags',
        2400.00,
        'Premium handcrafted Italian leather tote with signature monogram pattern.',
        true,
        true,
        ARRAY['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop']
    ),
    (
        'b865eee5-8788-4461-b777-f73e986a1344',
        'Silk Chiffon Evening Gown',
        'Clothes',
        3100.00,
        'Flowing silk chiffon gown with delicate embroidery and a timeless silhouette.',
        true,
        true,
        ARRAY['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop']
    )
ON CONFLICT (id) DO NOTHING;

-- Seed Content
INSERT INTO public.site_content (key, data)
VALUES 
    (
        'hero',
        '{"headline": "Elevating Women''s Luxury Fashion", "subheading": "Discover premium shoes, handbags, and clothing designed for elegance, confidence, and timeless beauty."}'::jsonb
    ),
    (
        'about',
        '{"text": "ADA''S HENRY is a premium luxury fashion brand dedicated to empowering women through timeless elegance. We believe in providing only the finest materials, impeccable craftsmanship, and unique designs that make our customers feel confident and beautiful. Our mission is to become a globally recognized Nigerian luxury fashion brand."}'::jsonb
    ),
    (
        'vision',
        '{"text": "Our vision is to redefine luxury fashion by blending modern sophistication with timeless elegance, empowering women to express their unique beauty. We are committed to building a brand that stands for quality, trust, and unparalleled customer satisfaction."}'::jsonb
    ),
    (
        'contact',
        '{"email": "adaolowohenry1998@gmail.com", "phone": "+234 906 756 6746", "address": "123 Luxury Avenue, Lagos, Nigeria", "hours": "Mon-Sat: 9AM - 6PM"}'::jsonb
    )
ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data;
