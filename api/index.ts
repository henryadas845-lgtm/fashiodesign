import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const app = express();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sxxiztvjpesndhcjpwjr.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eGl6dHZqcGVzbmRoY2pwd2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDg1NTEsImV4cCI6MjA5OTM4NDU1MX0.N2J4gkCldw22_y01fWaIEzXk3t5zFrhvpqZ9yK4otkE';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_AUTH_TOKEN = 'ada-henry-auth-token-verified';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth guard helper
const requireAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === ADMIN_AUTH_TOKEN) {
      return next();
    }
  }
  return res.status(401).json({ error: 'Unauthorized. Please login again.' });
};

// 1. Admin Login
app.post(['/api/admin/login', '/admin/login'], (req: any, res: any) => {
  const { password } = req.body || {};
  const cleanPass = typeof password === 'string' ? password.trim().replace(/^["']|["']$/g, '').trim() : '';
  if (cleanPass === 'Henry123' || cleanPass.toLowerCase() === 'henry123') {
    return res.json({ success: true, token: ADMIN_AUTH_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid password. Please try again.' });
});

// 2. Admin Check
app.get(['/api/admin/check', '/admin/check'], (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === ADMIN_AUTH_TOKEN) {
      return res.json({ authenticated: true });
    }
  }
  return res.status(401).json({ authenticated: false });
});

// 3. Admin Logout
app.post(['/api/admin/logout', '/admin/logout'], (_req: any, res: any) => {
  return res.json({ success: true });
});

// Default backup products in case database is empty
const defaultProducts = [
  {
    id: 'dfff4421-1b89-44bf-8bd0-e86f9f83fd62',
    name: 'Aura Crystal Stilettos',
    category: 'Shoes',
    price: 1250,
    description: 'Elegant stilettos encrusted with fine crystals. Perfect for a luxurious evening.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'bae59a03-5c93-4461-8111-8999effa55d3',
    name: 'Monogram Italian Leather Tote',
    category: 'Bags',
    price: 2400,
    description: 'Premium handcrafted Italian leather tote with signature monogram pattern.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'b865eee5-8788-4461-b777-f73e986a1344',
    name: 'Silk Chiffon Evening Gown',
    category: 'Clothes',
    price: 3100,
    description: 'Flowing silk chiffon gown with delicate embroidery and a timeless silhouette.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  },
  {
    id: '1aca5a18-8335-4ec0-b46f-0e950edb1f10',
    name: 'Bespoke Royal Tuxedo Suit',
    category: 'Clothes',
    price: 2800,
    description: 'Tailored luxury bespoke suit crafted from premium wool and satin lapels.',
    availability: true,
    featured: true,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'],
    createdAt: new Date().toISOString()
  }
];

// 4. Products GET
app.get(['/api/products', '/products'], async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        availability: p.availability !== false,
        featured: p.featured === true,
        images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));
      return res.json(mapped);
    }
  } catch (e) {
    console.warn('Supabase fetch products error:', e);
  }

  return res.json(defaultProducts);
});

// 5. Products POST
app.post(['/api/products', '/products'], requireAdmin, async (req: any, res: any) => {
  try {
    const { name, category, price, description, availability, featured, imageUrl, images } = req.body;
    let productImages: string[] = [];

    if (Array.isArray(images) && images.length > 0) {
      productImages = images;
    } else if (typeof imageUrl === 'string' && imageUrl.trim()) {
      productImages = [imageUrl.trim()];
    }

    const newProduct = {
      id: crypto.randomUUID(),
      name: name || 'New Luxury Item',
      category: category || 'General',
      price: Number(price) || 0,
      description: description || '',
      availability: availability !== false && availability !== 'false',
      featured: featured === true || featured === 'true',
      images: productImages,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('products').insert([newProduct]);
    } catch (err) {
      console.warn('Supabase product insert note:', err);
    }

    return res.status(201).json({
      ...newProduct,
      createdAt: newProduct.created_at,
      updatedAt: newProduct.updated_at
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// 6. Products PUT
app.put(['/api/products/:id', '/products/:id'], requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, availability, featured, imageUrl, images } = req.body;

    const updates: any = {
      updated_at: new Date().toISOString()
    };
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description;
    if (availability !== undefined) updates.availability = availability === true || availability === 'true';
    if (featured !== undefined) updates.featured = featured === true || featured === 'true';
    if (Array.isArray(images) && images.length > 0) updates.images = images;
    else if (typeof imageUrl === 'string' && imageUrl.trim()) updates.images = [imageUrl.trim()];

    try {
      await supabase.from('products').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase product update note:', err);
    }

    return res.json({ id, ...updates });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// 7. Products DELETE
app.delete(['/api/products/:id', '/products/:id'], requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase product delete note:', err);
    }
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// 8. Contact Form
app.post(['/api/contact', '/contact'], async (req: any, res: any) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const submission = {
      name,
      email,
      phone: phone || '',
      message,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('contact_messages').insert([submission]);
    } catch (e) {
      console.warn('Supabase contact insert note:', e);
    }

    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to submit inquiry' });
  }
});

// 9. Newsletter Subscribe
app.post(['/api/subscribe', '/subscribe'], async (req: any, res: any) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      await supabase.from('newsletter_subscribers').insert([{ email }]);
    } catch (e) {
      console.warn('Supabase newsletter note:', e);
    }

    return res.json({ success: true, message: 'Subscribed successfully' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to subscribe' });
  }
});

// 10. Admin Inquiries
app.get(['/api/admin/messages', '/admin/messages'], requireAdmin, async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return res.json(data);
    }
  } catch (e) {}

  return res.json([]);
});

// 11. Admin Subscribers
app.get(['/api/admin/subscribers', '/admin/subscribers'], requireAdmin, async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return res.json(data);
    }
  } catch (e) {}

  return res.json([]);
});

// 12. Email Settings
app.get(['/api/admin/email-settings', '/admin/email-settings'], requireAdmin, (_req: any, res: any) => {
  return res.json({
    provider: 'gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: 'henryadas845@gmail.com',
    senderEmail: 'henryadas845@gmail.com',
    senderName: "ADA'S HENRY Luxury Concierge",
    configured: true
  });
});

// 13. Reply Email
app.post(['/api/admin/reply-email', '/admin/reply-email'], requireAdmin, async (req: any, res: any) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }

    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpUser = process.env.SMTP_USER || 'henryadas845@gmail.com';

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass }
      });

      const info = await transporter.sendMail({
        from: `"ADA'S HENRY Luxury Concierge" <${smtpUser}>`,
        to,
        subject,
        text,
        html
      });
      return res.json({ success: true, messageId: info.messageId });
    }

    return res.json({
      success: true,
      simulated: true,
      message: 'Email registered in system (Configure SMTP_PASS in Vercel environment variables for live sending)'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
});

export default app;
