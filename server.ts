import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import session from 'express-session';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Supabase Client initialization
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sxxiztvjpesndhcjpwjr.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eGl6dHZqcGVzbmRoY2pwd2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDg1NTEsImV4cCI6MjA5OTM4NDU1MX0.N2J4gkCldw22_y01fWaIEzXk3t5zFrhvpqZ9yK4otkE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DB_FILE = path.join(process.cwd(), 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const ADMIN_AUTH_TOKEN = 'ada-henry-auth-token-verified';

// Ensure DB file and uploads dir exist
async function initDb() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }

  try {
    await fs.access(DB_FILE);
  } catch {
    const defaultData = {
      products: [
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
          name: 'Monogram Leather Tote',
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
        }
      ],
      messages: [],
      subscribers: [],
      content: {
        hero: {
          headline: "Elevating Women's Luxury Fashion",
          subheading: "Discover premium shoes, handbags, and clothing designed for elegance, confidence, and timeless beauty."
        },
        about: {
          text: "ADA'S HENRY is a premium luxury fashion brand dedicated to empowering women through timeless elegance. We believe in providing only the finest materials, impeccable craftsmanship, and unique designs that make our customers feel confident and beautiful. Our mission is to become a globally recognized Nigerian luxury fashion brand."
        },
        vision: {
          text: "Our vision is to redefine luxury fashion by blending modern sophistication with timeless elegance, empowering women to express their unique beauty. We are committed to building a brand that stands for quality, trust, and unparalleled customer satisfaction."
        },
        contact: {
          email: "contact@adashenry.com",
          phone: "+234 906 756 6746",
          address: "123 Luxury Avenue, Lagos, Nigeria",
          hours: "Mon-Sat: 9AM - 6PM"
        }
      }
    };
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
}

async function readDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.products) parsed.products = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.subscribers) parsed.subscribers = [];
    return parsed;
  } catch {
    return { products: [], messages: [], subscribers: [], content: {} };
  }
}

async function writeDb(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});
const upload = multer({ storage });

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  // Trust proxy for secure cookie handling in preview and production environments
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.use(session({
    secret: 'luxury-secret-key-adas-henry',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, 
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // Helper auth middleware checking session OR admin header token
  const requireAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const tokenHeader = req.headers['x-admin-token'];
    if (
      req.session?.isAdmin ||
      authHeader === `Bearer ${ADMIN_AUTH_TOKEN}` ||
      tokenHeader === ADMIN_AUTH_TOKEN
    ) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please login again.' });
  };

  // Admin Login
  app.post('/api/admin/login', (req: any, res: any) => {
    const { password } = req.body;
    const cleanPass = typeof password === 'string' ? password.trim().replace(/^["']|["']$/g, '').trim() : '';
    if (cleanPass === 'Henry123' || cleanPass.toLowerCase() === 'henry123') {
      req.session.isAdmin = true;
      res.json({ success: true, token: ADMIN_AUTH_TOKEN });
    } else {
      res.status(401).json({ error: 'Invalid password. Please try again.' });
    }
  });

  app.post('/api/admin/logout', (req: any, res: any) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/admin/check', (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    const tokenHeader = req.headers['x-admin-token'];
    if (
      req.session?.isAdmin ||
      authHeader === `Bearer ${ADMIN_AUTH_TOKEN}` ||
      tokenHeader === ADMIN_AUTH_TOKEN
    ) {
      res.json({ success: true, token: ADMIN_AUTH_TOKEN });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  // PRODUCTS: GET
  // Merges local products with Supabase products so additions and edits are always visible
  app.get('/api/products', async (req, res) => {
    const db = await readDb();
    let productsList: any[] = Array.isArray(db.products) ? [...db.products] : [];

    // Background sync with Supabase
    try {
      const { data: supaProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(supaProducts) && supaProducts.length > 0) {
        let dbChanged = false;
        supaProducts.forEach((sp: any) => {
          const matchIndex = productsList.findIndex(p => String(p.id) === String(sp.id));
          if (matchIndex === -1) {
            // New product from Supabase not in local DB
            productsList.unshift({
              id: sp.id,
              name: sp.name,
              category: sp.category,
              price: Number(sp.price),
              description: sp.description,
              availability: Boolean(sp.availability),
              featured: Boolean(sp.featured),
              images: Array.isArray(sp.images) && sp.images.length > 0 ? sp.images : ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'],
              createdAt: sp.created_at || new Date().toISOString()
            });
            dbChanged = true;
          }
        });
        if (dbChanged) {
          db.products = productsList;
          await writeDb(db);
        }
      }
    } catch (err) {
      console.warn('Supabase products check note:', err);
    }

    res.json(productsList);
  });

  // PRODUCTS: POST (Add Stock)
  app.post('/api/products', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
      const uploadedImages = (req as any).files?.map((f: any) => `/uploads/${f.filename}`) || [];
      const productId = crypto.randomUUID();

      let productImages = uploadedImages;
      if (productImages.length === 0 && req.body.imageUrl && req.body.imageUrl.trim() !== '') {
        productImages = [req.body.imageUrl.trim()];
      }
      if (productImages.length === 0) {
        // Fallback luxury placeholder based on category
        const cat = (req.body.category || 'Shoes').toLowerCase();
        if (cat === 'bags') {
          productImages = ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'];
        } else if (cat === 'clothes') {
          productImages = ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop'];
        } else {
          productImages = ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'];
        }
      }

      const newProduct = {
        id: productId,
        name: req.body.name || 'Luxury Item',
        category: req.body.category || 'Shoes',
        price: parseFloat(req.body.price) || 0,
        description: req.body.description || '',
        availability: req.body.availability === 'true' || req.body.availability === true,
        featured: req.body.featured === 'true' || req.body.featured === true,
        images: productImages,
        createdAt: new Date().toISOString()
      };

      // 1. Immediately save to persistent db.json so it is 100% available
      const db = await readDb();
      db.products.unshift(newProduct);
      await writeDb(db);

      // 2. Sync to Supabase in background
      try {
        await supabase.from('products').insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            category: newProduct.category,
            price: newProduct.price,
            description: newProduct.description,
            availability: newProduct.availability,
            featured: newProduct.featured,
            images: newProduct.images
          }
        ]);
      } catch (err) {
        console.warn('Supabase product insert note:', err);
      }

      res.status(201).json(newProduct);
    } catch (error: any) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: error.message || 'Failed to save new product' });
    }
  });

  // PRODUCTS: PUT (Edit Stock)
  app.put('/api/products/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
      const db = await readDb();
      let productIndex = db.products.findIndex((p: any) => String(p.id) === String(req.params.id));
      
      let product: any;
      if (productIndex === -1) {
        // If not yet in local db, create record with this ID
        product = {
          id: req.params.id,
          createdAt: new Date().toISOString()
        };
        db.products.push(product);
        productIndex = db.products.length - 1;
      } else {
        product = db.products[productIndex];
      }
      
      if (req.body.name !== undefined) product.name = req.body.name;
      if (req.body.category !== undefined) product.category = req.body.category;
      if (req.body.price !== undefined) product.price = parseFloat(req.body.price) || 0;
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.availability !== undefined) {
        product.availability = req.body.availability === 'true' || req.body.availability === true;
      }
      if (req.body.featured !== undefined) {
        product.featured = req.body.featured === 'true' || req.body.featured === true;
      }
      product.updatedAt = new Date().toISOString();
      
      const newImages = (req as any).files?.map((f: any) => `/uploads/${f.filename}`) || [];
      if (newImages.length > 0) {
        product.images = newImages;
      } else if (req.body.imageUrl && req.body.imageUrl.trim() !== '') {
        product.images = [req.body.imageUrl.trim()];
      }
      
      // Save local db
      db.products[productIndex] = product;
      await writeDb(db);

      // Attempt Supabase update in background
      try {
        await supabase
          .from('products')
          .update({
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            availability: product.availability,
            featured: product.featured,
            images: product.images,
            updated_at: new Date().toISOString()
          })
          .eq('id', req.params.id);
      } catch (err) {
        console.warn('Supabase product update note:', err);
      }

      res.json(product);
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: error.message || 'Failed to update product' });
    }
  });

  // PRODUCTS: DELETE
  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      // Supabase delete in background
      try {
        await supabase.from('products').delete().eq('id', req.params.id);
      } catch (err) {
        console.warn('Supabase product delete note:', err);
      }

      const db = await readDb();
      db.products = db.products.filter((p: any) => String(p.id) !== String(req.params.id));
      await writeDb(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete product' });
    }
  });

  // Content
  app.get('/api/content', async (req, res) => {
    const db = await readDb();
    res.json(db.content);
  });

  app.put('/api/content', requireAdmin, async (req, res) => {
    const db = await readDb();
    db.content = { ...db.content, ...req.body };
    await writeDb(db);
    res.json(db.content);
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const submission = {
      id: crypto.randomUUID(),
      name,
      email,
      message,
      created_at: new Date().toISOString()
    };

    // Store in Supabase
    try {
      await supabase.from('contact_messages').insert([submission]);
    } catch (e) {
      console.warn('Supabase contact insert note:', e);
    }

    // Local DB backup
    try {
      const db = await readDb();
      if (!db.messages) db.messages = [];
      db.messages.unshift(submission);
      await writeDb(db);
    } catch (e) {
      console.error(e);
    }

    res.json({ success: true, message: 'Message sent successfully!' });
  });

  // Newsletter submission
  app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Store in Supabase
    try {
      await supabase.from('newsletter_subscribers').insert([{ email }]);
    } catch (e) {
      console.warn('Supabase newsletter insert note:', e);
    }

    // Local DB backup
    try {
      const db = await readDb();
      if (!db.subscribers) db.subscribers = [];
      if (!db.subscribers.some((s: any) => s.email === email)) {
        db.subscribers.unshift({ email, created_at: new Date().toISOString() });
        await writeDb(db);
      }
    } catch (e) {
      console.error(e);
    }

    res.json({ success: true, message: 'Subscribed successfully!' });
  });

  // Helper to establish secure email transporter
  async function getEmailTransporter(dbSettings?: any) {
    const host = (dbSettings?.smtpHost || process.env.SMTP_HOST || '').trim();
    const port = parseInt(String(dbSettings?.smtpPort || process.env.SMTP_PORT || '465'));
    const user = (dbSettings?.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
    const pass = (dbSettings?.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
    const senderEmail = (dbSettings?.senderEmail || process.env.SMTP_FROM || user || 'concierge@adashenry.com').trim();
    const senderName = (dbSettings?.senderName || process.env.SMTP_NAME || "ADA'S HENRY Luxury Concierge").trim();

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
        return { transporter, senderEmail, senderName, isConfigured: true, isEthereal: false };
      } catch (err) {
        console.warn('Configured SMTP error:', err);
      }
    }

    return { transporter: null, senderEmail, senderName, isConfigured: false, isEthereal: false };
  }

  // Admin Inquiries / Contact Messages
  app.get('/api/admin/messages', requireAdmin, async (req, res) => {
    const db = await readDb();
    const localMessages = db.messages || [];

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge Supabase inquiries with local reply metadata
        const merged = data.map((remote: any) => {
          const match = localMessages.find((loc: any) => 
            (loc.id && remote.id && String(loc.id) === String(remote.id)) || 
            (loc.email && remote.email && loc.email.toLowerCase() === remote.email.toLowerCase())
          );
          return match ? { ...remote, ...match } : remote;
        });
        return res.json(merged);
      }
    } catch (e) {}

    res.json(localMessages);
  });

  // Admin Record Reply (e.g. sent via Gmail Web, Mailto, or WhatsApp)
  app.post('/api/admin/mark-replied', requireAdmin, async (req, res) => {
    try {
      const { inquiryId, to, customerName, subject, message, method } = req.body;
      const db = await readDb();
      const now = new Date().toISOString();

      const replyRecord = {
        id: crypto.randomUUID(),
        inquiryId: inquiryId || null,
        to: to || '',
        customerName: customerName || 'Valued Client',
        subject: subject || "ADA'S HENRY Luxury Concierge — Response",
        message: message || '',
        sentAt: now,
        method: method || 'gmail_direct',
        liveDelivery: true
      };

      if (!db.emailLogs) db.emailLogs = [];
      db.emailLogs.unshift(replyRecord);

      if (!db.messages) db.messages = [];
      const found = db.messages.find((m: any) => 
        (inquiryId && String(m.id) === String(inquiryId)) || 
        (m.email && to && m.email.toLowerCase() === to.toLowerCase())
      );

      if (found) {
        found.replied = true;
        found.lastRepliedAt = now;
        found.replyMethod = method || 'gmail_direct';
        if (!found.replies) found.replies = [];
        found.replies.push(replyRecord);
      } else if (to) {
        db.messages.unshift({
          id: inquiryId || crypto.randomUUID(),
          email: to,
          name: customerName || 'Valued Client',
          message: '',
          replied: true,
          lastRepliedAt: now,
          replyMethod: method || 'gmail_direct',
          replies: [replyRecord],
          created_at: now
        });
      }

      await writeDb(db);
      res.json({ success: true, sentAt: now, replyRecord });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to record reply.' });
    }
  });

  // Admin Reply via Server SMTP directly to customer
  app.post('/api/admin/reply-email', requireAdmin, async (req, res) => {
    try {
      const { inquiryId, to, customerName, subject, message, originalMessage, allowPreviewSandbox } = req.body;

      if (!to || !to.includes('@')) {
        return res.status(400).json({ error: 'Valid customer email address is required.' });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Email message content cannot be empty.' });
      }

      const db = await readDb();
      const emailSettings = db.emailSettings || {};
      const { transporter, senderEmail, senderName, isConfigured } = await getEmailTransporter(emailSettings);

      const emailSubject = subject?.trim() || `ADA'S HENRY Luxury Concierge — Response to your inquiry`;
      const clientName = customerName || 'Valued Client';

      const formattedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #faf7f5; color: #222222; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ebdcd5; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
            .header { background: #121212; color: #ffffff; text-align: center; padding: 32px 24px; }
            .logo-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 5px; margin: 0; color: #ffffff; font-weight: 700; }
            .logo-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #d4a373; margin-top: 6px; font-weight: 500; }
            .content { padding: 32px 28px; font-size: 15px; line-height: 1.7; color: #2d3748; }
            .greeting { font-size: 17px; font-weight: 600; margin-bottom: 20px; color: #111111; font-family: 'Playfair Display', Georgia, serif; }
            .body-text { white-space: pre-wrap; margin-bottom: 24px; color: #374151; font-size: 15px; }
            .quote-box { background: #fbf7f5; border-left: 3px solid #d4a373; padding: 14px 18px; margin: 24px 0; border-radius: 2px; }
            .quote-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8c5b3e; margin-bottom: 5px; }
            .quote-content { font-size: 13px; font-style: italic; color: #555555; margin: 0; }
            .signature { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0eae6; font-size: 13px; color: #555555; }
            .sig-name { font-weight: 600; color: #111111; font-size: 15px; font-family: 'Playfair Display', Georgia, serif; }
            .footer { background: #fbf9f7; border-top: 1px solid #ebdcd5; padding: 22px; text-align: center; font-size: 12px; color: #718096; }
            .footer p { margin: 3px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-title">ADA'S HENRY</h1>
              <div class="logo-subtitle">Luxury Footwear, Handbags & Ready-to-Wear</div>
            </div>
            <div class="content">
              <div class="greeting">Dear ${clientName},</div>
              <div class="body-text">${message.replace(/\n/g, '<br/>')}</div>

              ${originalMessage ? `
                <div class="quote-box">
                  <div class="quote-title">In Reference to Your Inquiry:</div>
                  <p class="quote-content">"${originalMessage}"</p>
                </div>
              ` : ''}

              <div class="signature">
                <div class="sig-name">ADA'S HENRY Concierge Team</div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">Elegance Redefined | Client Relations</div>
                <div style="margin-top: 8px; font-size: 13px;">
                  <span>Direct: +234 906 756 6746</span> &bull; 
                  <span>Email: ${senderEmail}</span>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ADA'S HENRY Luxury Brand. All rights reserved.</p>
              <p>Lagos, Nigeria &bull; Worldwide Discreet White-Glove Delivery</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const plainText = `Dear ${clientName},\n\n${message}\n\n${originalMessage ? `In Reference to Your Inquiry:\n"${originalMessage}"\n\n` : ''}Warm regards,\nADA'S HENRY Concierge Team\nElegance Redefined | Luxury Shoes, Bags & Outfits\nDirect: +234 906 756 6746\nEmail: ${senderEmail}\nLagos, Nigeria`;

      if (!isConfigured || !transporter) {
        if (!allowPreviewSandbox) {
          return res.status(400).json({
            notConfigured: true,
            error: 'Real SMTP / Gmail credentials are not configured yet. Configure your Gmail and 16-character App Password in Store Settings -> Email Delivery Settings, or use the "Send via Gmail" button for instant 100% direct inbox delivery.'
          });
        }

        // Test sandbox fallback if explicitly requested
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass }
        });
        const info = await testTransporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to,
          subject: emailSubject,
          text: plainText,
          html: formattedHtml,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);

        return res.json({
          success: true,
          liveDelivery: false,
          isSimulated: true,
          message: `Preview generated in sandbox. Real delivery requires SMTP credentials.`,
          previewUrl
        });
      }

      // Live delivery via configured SMTP
      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        subject: emailSubject,
        text: plainText,
        html: formattedHtml,
      });

      const replyRecord = {
        id: crypto.randomUUID(),
        inquiryId: inquiryId || null,
        to,
        customerName: clientName,
        subject: emailSubject,
        message,
        sentAt: new Date().toISOString(),
        liveDelivery: true,
        messageId: info.messageId || null,
        method: 'direct_smtp'
      };

      // Record email log
      if (!db.emailLogs) db.emailLogs = [];
      db.emailLogs.unshift(replyRecord);

      // Update inquiry in db.messages
      if (!db.messages) db.messages = [];
      const found = db.messages.find((m: any) => 
        (inquiryId && String(m.id) === String(inquiryId)) || 
        (m.email && m.email.toLowerCase() === to.toLowerCase())
      );
      if (found) {
        found.replied = true;
        found.lastRepliedAt = replyRecord.sentAt;
        found.replyMethod = 'direct_smtp';
        if (!found.replies) found.replies = [];
        found.replies.push(replyRecord);
      } else {
        db.messages.unshift({
          id: inquiryId || crypto.randomUUID(),
          email: to,
          name: clientName,
          message: originalMessage || '',
          replied: true,
          lastRepliedAt: replyRecord.sentAt,
          replyMethod: 'direct_smtp',
          replies: [replyRecord],
          created_at: new Date().toISOString()
        });
      }

      await writeDb(db);

      res.json({
        success: true,
        liveDelivery: true,
        message: `Email reply successfully delivered directly to ${to}!`,
        recipient: to,
        sentAt: replyRecord.sentAt,
        messageId: info.messageId
      });
    } catch (error: any) {
      console.error('Email sending error:', error);
      let errorMsg = error.message || 'Failed to dispatch email reply.';
      if (errorMsg.includes('Invalid login') || errorMsg.includes('Username and Password not accepted') || errorMsg.includes('535')) {
        errorMsg = 'Authentication failed. Please check your Gmail App Password in Store Settings -> Email Settings.';
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  // Email service status / settings
  app.get('/api/admin/email-settings', requireAdmin, async (req, res) => {
    const db = await readDb();
    const settings = db.emailSettings || {};
    const hasEnv = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD));
    const hasDb = Boolean(settings.smtpHost && settings.smtpUser && settings.smtpPass);
    const configured = hasEnv || hasDb;

    res.json({
      configured,
      provider: settings.provider || (settings.smtpHost?.includes('gmail') ? 'gmail' : 'custom'),
      senderEmail: settings.senderEmail || process.env.SMTP_FROM || settings.smtpUser || process.env.SMTP_USER || 'concierge@adashenry.com',
      senderName: settings.senderName || "ADA'S HENRY Luxury Concierge",
      smtpHost: settings.smtpHost || (process.env.SMTP_HOST ? process.env.SMTP_HOST : 'smtp.gmail.com'),
      smtpPort: settings.smtpPort || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465),
      smtpUser: settings.smtpUser || process.env.SMTP_USER || '',
      hasPassword: Boolean(settings.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD),
      emailCount: (db.emailLogs || []).length
    });
  });

  // Save Email & SMTP Settings
  app.put('/api/admin/email-settings', requireAdmin, async (req, res) => {
    try {
      const { provider, smtpHost, smtpPort, smtpUser, smtpPass, senderEmail, senderName } = req.body;
      const db = await readDb();
      if (!db.emailSettings) db.emailSettings = {};

      const currentPass = db.emailSettings.smtpPass || '';

      db.emailSettings = {
        provider: provider || 'gmail',
        smtpHost: smtpHost ? smtpHost.trim() : (provider === 'gmail' ? 'smtp.gmail.com' : 'smtp.gmail.com'),
        smtpPort: smtpPort ? parseInt(String(smtpPort)) : 465,
        smtpUser: smtpUser ? smtpUser.trim() : '',
        smtpPass: smtpPass && smtpPass.trim() !== '' ? smtpPass.trim().replace(/\s+/g, '') : currentPass,
        senderEmail: senderEmail ? senderEmail.trim() : (smtpUser ? smtpUser.trim() : ''),
        senderName: senderName ? senderName.trim() : "ADA'S HENRY Luxury Concierge",
        updatedAt: new Date().toISOString()
      };

      await writeDb(db);
      res.json({
        success: true,
        message: 'Email delivery settings saved successfully.',
        configured: Boolean(db.emailSettings.smtpHost && db.emailSettings.smtpUser && db.emailSettings.smtpPass)
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to save email settings.' });
    }
  });

  // Test Real Email Delivery
  app.post('/api/admin/test-email', requireAdmin, async (req, res) => {
    try {
      const { testEmail, smtpHost, smtpPort, smtpUser, smtpPass, senderEmail, senderName } = req.body;
      if (!testEmail || !testEmail.includes('@')) {
        return res.status(400).json({ error: 'Please enter a valid destination email address for testing.' });
      }

      const db = await readDb();
      const current = db.emailSettings || {};

      const host = (smtpHost || current.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
      const port = parseInt(String(smtpPort || current.smtpPort || process.env.SMTP_PORT || '465'));
      const user = (smtpUser || current.smtpUser || process.env.SMTP_USER || '').trim();
      const pass = (smtpPass && smtpPass.trim() !== '' ? smtpPass.trim().replace(/\s+/g, '') : (current.smtpPass || process.env.SMTP_PASS || '')).trim();
      const fromEmail = (senderEmail || current.senderEmail || user || 'concierge@adashenry.com').trim();
      const fromName = (senderName || current.senderName || "ADA'S HENRY Luxury Concierge").trim();

      if (!host || !user || !pass) {
        return res.status(400).json({
          error: 'Missing SMTP credentials. Please enter SMTP Host, Username/Email, and App Password.'
        });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      // Verify connection credentials with SMTP server
      await transporter.verify();

      // Send real test email
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testEmail,
        subject: `ADA'S HENRY — Live Email Delivery Test Verification`,
        text: `Hello,\n\nThis is a real test email from your ADA'S HENRY Luxury Brand admin dashboard.\n\nYour email service is active and verified! Customer replies sent from your dashboard will be delivered directly to their inboxes.\n\nVerified at: ${new Date().toLocaleString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #ebdcd5; border-radius: 8px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px;">
              <h1 style="font-family: Georgia, serif; font-size: 24px; letter-spacing: 4px; margin: 0; color: #111;">ADA'S HENRY</h1>
              <p style="font-size: 11px; letter-spacing: 2px; color: #d4a373; margin: 4px 0 0; text-transform: uppercase;">Luxury Footwear & Ready-to-Wear</p>
            </div>
            <div style="background: #e6f4ea; border-left: 4px solid #34a853; padding: 14px 18px; border-radius: 4px; margin-bottom: 20px;">
              <strong style="color: #137333; font-size: 15px;">✓ Live Email Delivery Verified!</strong>
              <p style="margin: 4px 0 0; color: #2e603e; font-size: 13px;">
                Your SMTP / Gmail delivery connection is verified and functioning. Customer replies sent from the ADA'S HENRY dashboard will arrive directly in client inboxes.
              </p>
            </div>
            <div style="font-size: 13px; color: #555; line-height: 1.6;">
              <p><strong>Configured Sender:</strong> ${fromEmail} (${fromName})</p>
              <p><strong>Target Destination:</strong> ${testEmail}</p>
              <p><strong>SMTP Host:</strong> ${host} (Port ${port})</p>
              <p><strong>Delivery Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999;">
              ADA'S HENRY Concierge System &bull; Lagos, Nigeria &bull; Worldwide Delivery
            </div>
          </div>
        `
      });

      res.json({
        success: true,
        message: `Live test email successfully delivered to ${testEmail}! Please check your inbox.`,
        messageId: info.messageId
      });
    } catch (err: any) {
      console.error('Test email error:', err);
      let errorMsg = err.message || 'Failed to send test email.';
      if (errorMsg.includes('Invalid login') || errorMsg.includes('Username and Password not accepted') || errorMsg.includes('535') || errorMsg.includes('BadCredentials')) {
        errorMsg = 'Authentication failed. If using Gmail, make sure 2-Step Verification is enabled on your Google Account, and generate a 16-character Google App Password (not your regular Gmail password) at https://myaccount.google.com/apppasswords.';
      }
      res.status(400).json({ error: errorMsg });
    }
  });

  // Admin Newsletter Subscribers
  app.get('/api/admin/subscribers', requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    } catch (e) {}

    const db = await readDb();
    res.json(db.subscribers || []);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
