import 'dotenv/config';
import crypto from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import multer from 'multer';
import nodemailer from 'nodemailer';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  APPLICATION_STATUSES,
  OFFER_LETTERS_DIR,
  RESUMES_DIR,
  db,
} from './server/db.ts';
import { generateOfficialOfferLetterPdf } from './server/pdf.ts';
import {
  TokenPayload,
  checkRateLimit,
  generateNumericOtp,
  hashOtp,
  hashPassword,
  isSmtpConfigured,
  isValidEmail,
  maskEmail,
  safeResolveInDir,
  sanitizeDownloadFilename,
  signToken,
  validateMagicBytes,
  verifyOtpHash,
  verifyPassword,
  verifyToken,
} from './server/security.ts';

interface AuthenticatedRequest extends Request {
  auth?: TokenPayload;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Basic security headers (preserving iframe embedding compatibility for preview)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '1mb' }));

// Multer in-memory storage for strict magic-byte validation prior to writing to private storage
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const offerPdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string') return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function requireAdmin(allowedRoles?: Array<'super_admin' | 'hr_manager' | 'recruiter'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = extractBearer(req);
    const payload = token ? verifyToken(token) : null;
    if (!payload || payload.typ !== 'admin' || !payload.role) {
      res.status(401).json({ error: 'Administrator authentication required.' });
      return;
    }
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      res.status(403).json({
        error: 'Insufficient permissions for this administrative action.',
      });
      return;
    }
    req.auth = payload;
    next();
  };
}

function requireCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.typ !== 'candidate' || !payload.applicationId) {
    res.status(401).json({ error: 'Verified candidate session required.' });
    return;
  }
  req.auth = payload;
  next();
}

function generateApplicationId(): string {
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const num = crypto.randomInt(10000, 99999);
    const candidateId = `LC-${year}-${num}`;
    const existing = db
      .prepare('SELECT id FROM applications WHERE application_id = ?')
      .get(candidateId);
    if (!existing) return candidateId;
  }
  return `LC-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function sendOtpEmail(toEmail: string, candidateName: string, applicationId: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Luggage City Careers <careers@luggagecity.ca>',
    to: toEmail,
    subject: `Luggage City Offer Verification Code — ${applicationId}`,
    text: `Hello ${candidateName},\n\nYour one-time verification code for the Luggage City Offer Letter Portal is: ${code}\n\nApplication ID: ${applicationId}\nThis code expires in 10 minutes. If you did not request this verification, please ignore this message.\n\nLuggage City Human Resources`,
  });
}

// ============================================================================
// PUBLIC API ROUTES
// ============================================================================

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, smtpConfigured: isSmtpConfigured() });
});

app.get('/api/jobs', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, slug, title, department, employment_type, location, description, requirements_json, salary_range, is_active, created_at
       FROM jobs WHERE is_active = 1 ORDER BY id DESC`
    )
    .all() as Array<Record<string, unknown>>;

  const jobs = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    department: row.department,
    employmentType: row.employment_type,
    location: row.location,
    description: row.description,
    requirements: JSON.parse(String(row.requirements_json || '[]')),
    salaryRange: row.salary_range,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }));

  res.json({ jobs });
});

app.post('/api/applications', (req, res) => {
  resumeUpload.single('resume')(req, res, (uploadErr) => {
    if (uploadErr) {
      res.status(400).json({
        error:
          uploadErr instanceof multer.MulterError && uploadErr.code === 'LIMIT_FILE_SIZE'
            ? 'Resume file must be 5 MB or smaller.'
            : 'Failed to process resume upload.',
      });
      return;
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(`apply:${ip}`, 12, 15 * 60 * 1000)) {
      res.status(429).json({
        error: 'Too many submissions received. Please try again later.',
      });
      return;
    }

    const { fullName, email, phone, positionTitle, location, coverLetter, jobId } =
      req.body as Record<string, string>;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !isValidEmail(email) ||
      !phone?.trim() ||
      !positionTitle?.trim() ||
      !location?.trim() ||
      !coverLetter?.trim()
    ) {
      res.status(400).json({
        error: 'Please complete all required application fields with a valid email address.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        error: 'Please attach your resume in PDF, DOC, or DOCX format.',
      });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.doc', '.docx'];
    if (!allowedExts.includes(ext) || !validateMagicBytes(req.file.buffer, ext)) {
      res.status(400).json({
        error: 'Invalid resume format. Only genuine PDF, DOC, or DOCX files are accepted.',
      });
      return;
    }

    let department = 'Retail & Corporate';
    let parsedJobId: number | null = null;
    if (jobId && /^\d+$/.test(jobId)) {
      const jobRow = db
        .prepare('SELECT id, title, department FROM jobs WHERE id = ? AND is_active = 1')
        .get(Number(jobId)) as { id: number; title: string; department: string } | undefined;
      if (jobRow) {
        parsedJobId = jobRow.id;
        department = jobRow.department;
      }
    } else {
      const matchedJob = db
        .prepare('SELECT id, department FROM jobs WHERE LOWER(title) = LOWER(?) LIMIT 1')
        .get(positionTitle.trim()) as { id: number; department: string } | undefined;
      if (matchedJob) {
        parsedJobId = matchedJob.id;
        department = matchedJob.department;
      }
    }

    const storageFilename = `${crypto.randomUUID()}${ext}`;
    const targetPath = safeResolveInDir(RESUMES_DIR, storageFilename);
    fs.writeFileSync(targetPath, req.file.buffer, { mode: 0o600 });

    const applicationId = generateApplicationId();
    const normalizedEmail = email.trim().toLowerCase();

    db.prepare(
      `INSERT INTO applications (
        application_id, job_id, position_title, department, location,
        full_name, email, phone, cover_letter,
        resume_storage_name, resume_original_name, resume_mime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      applicationId,
      parsedJobId,
      positionTitle.trim().slice(0, 140),
      department,
      location.trim().slice(0, 140),
      fullName.trim().slice(0, 140),
      normalizedEmail,
      phone.trim().slice(0, 40),
      coverLetter.trim().slice(0, 5000),
      storageFilename,
      sanitizeDownloadFilename(req.file.originalname, `resume${ext}`),
      req.file.mimetype || 'application/octet-stream'
    );

    res.status(201).json({
      applicationId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      positionTitle: positionTitle.trim(),
      department,
      status: 'Application Received',
      submittedAt: new Date().toISOString(),
    });
  });
});

app.post('/api/newsletter', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(email);
  res.status(201).json({ subscribed: true, email });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body as Record<string, string>;
  if (!name?.trim() || !isValidEmail(email || '') || !subject?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Please fill in your name, valid email, subject, and message.' });
    return;
  }
  db.prepare(
    `INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`
  ).run(
    name.trim().slice(0, 120),
    email.trim().toLowerCase(),
    (phone || '').trim().slice(0, 40),
    subject.trim().slice(0, 160),
    message.trim().slice(0, 4000)
  );
  res.status(201).json({ received: true });
});

app.post('/api/repairs', (req, res) => {
  const { name, email, phone, brand, itemType, issueDescription, preferredLocation } =
    req.body as Record<string, string>;
  if (
    !name?.trim() ||
    !isValidEmail(email || '') ||
    !phone?.trim() ||
    !brand?.trim() ||
    !itemType?.trim() ||
    !issueDescription?.trim()
  ) {
    res.status(400).json({ error: 'Please complete all required repair inquiry fields.' });
    return;
  }
  const refCode = `REP-${crypto.randomInt(100000, 999999)}`;
  db.prepare(
    `INSERT INTO repair_inquiries (name, email, phone, brand, item_type, issue_description, preferred_location)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    name.trim().slice(0, 120),
    email.trim().toLowerCase(),
    phone.trim().slice(0, 40),
    brand.trim().slice(0, 80),
    itemType.trim().slice(0, 80),
    issueDescription.trim().slice(0, 3000),
    (preferredLocation || 'Woodbridge Flagship Repair Centre').trim().slice(0, 140)
  );
  res.status(201).json({ received: true, referenceCode: refCode });
});

app.post('/api/orders', (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    province,
    postalCode,
    items,
  } = req.body as {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    items?: Array<{ id: string; name: string; priceCad: number; quantity: number; color?: string }>;
  };

  if (
    !customerName?.trim() ||
    !customerEmail?.trim() ||
    !isValidEmail(customerEmail) ||
    !customerPhone?.trim() ||
    !shippingAddress?.trim() ||
    !city?.trim() ||
    !province?.trim() ||
    !postalCode?.trim() ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    res.status(400).json({ error: 'Please provide complete shipping information and at least one item.' });
    return;
  }

  let subtotal = 0;
  const cleanItems = items.slice(0, 50).map((it) => {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(it.quantity) || 1)));
    const price = Math.max(0, Number(it.priceCad) || 0);
    subtotal += qty * price;
    return {
      id: String(it.id || ''),
      name: String(it.name || '').slice(0, 160),
      priceCad: price,
      quantity: qty,
      color: it.color ? String(it.color).slice(0, 60) : undefined,
    };
  });

  const taxRates: Record<string, number> = {
    ON: 0.13,
    NS: 0.15,
    NB: 0.15,
    NL: 0.15,
    PE: 0.15,
    QC: 0.14975,
    BC: 0.12,
    MB: 0.12,
    SK: 0.11,
    AB: 0.05,
    NT: 0.05,
    NU: 0.05,
    YT: 0.05,
  };
  const taxRate = taxRates[province.toUpperCase()] ?? 0.13;
  const shipping = subtotal >= 69 ? 0 : 14.95;
  const tax = Number(((subtotal + shipping) * taxRate).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const orderNumber = `LC-ORD-${crypto.randomInt(100000, 999999)}`;

  db.prepare(
    `INSERT INTO orders (
      order_number, customer_name, customer_email, customer_phone,
      shipping_address, city, province, postal_code, items_json,
      subtotal_cad, shipping_cad, tax_cad, total_cad
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    orderNumber,
    customerName.trim().slice(0, 140),
    customerEmail.trim().toLowerCase(),
    customerPhone.trim().slice(0, 40),
    shippingAddress.trim().slice(0, 240),
    city.trim().slice(0, 100),
    province.trim().toUpperCase().slice(0, 10),
    postalCode.trim().toUpperCase().slice(0, 20),
    JSON.stringify(cleanItems),
    Number(subtotal.toFixed(2)),
    shipping,
    tax,
    total
  );

  res.status(201).json({
    orderNumber,
    subtotalCad: Number(subtotal.toFixed(2)),
    shippingCad: shipping,
    taxCad: tax,
    totalCad: total,
    status: 'Confirmed — Preparing Shipment',
    createdAt: new Date().toISOString(),
  });
});

// ============================================================================
// CANDIDATE OFFER LETTER VERIFICATION PORTAL API
// ============================================================================

app.get('/api/candidate/config', (_req, res) => {
  res.json({ smtpConfigured: isSmtpConfigured() });
});

app.post('/api/candidate/request-otp', async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(`otp-req:${ip}`, 10, 10 * 60 * 1000)) {
    res.status(429).json({
      error: 'Too many verification attempts. Please wait a few minutes before retrying.',
    });
    return;
  }

  const applicationId = String(req.body?.applicationId || '').trim().toUpperCase();
  const email = String(req.body?.email || '').trim().toLowerCase();

  const genericMismatchMsg =
    'We could not verify the provided credentials. Please confirm your Application ID and registered email address.';

  if (!applicationId || !isValidEmail(email)) {
    res.status(400).json({ error: genericMismatchMsg });
    return;
  }

  const record = db
    .prepare(
      `SELECT application_id, full_name, email FROM applications WHERE UPPER(application_id) = ? AND LOWER(email) = ?`
    )
    .get(applicationId, email) as
    | { application_id: string; full_name: string; email: string }
    | undefined;

  if (!record) {
    res.status(400).json({ error: genericMismatchMsg });
    return;
  }

  if (!isSmtpConfigured()) {
    res.status(503).json({
      smtpConfigured: false,
      error:
        'Email OTP delivery (SMTP) is not yet configured on this server. To receive verification codes by email, an administrator must configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM, or issue an authorized one-time verification code from the HR Admin Dashboard.',
    });
    return;
  }

  const otp = generateNumericOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const codeHash = hashOtp(otp, salt);
  const expiresAt = Date.now() + 10 * 60 * 1000;

  db.prepare(
    `UPDATE candidate_otps SET consumed = 1 WHERE UPPER(application_id) = ? AND consumed = 0`
  ).run(record.application_id.toUpperCase());

  db.prepare(
    `INSERT INTO candidate_otps (application_id, email, code_hash, salt, expires_at, delivery_mode)
     VALUES (?, ?, ?, ?, ?, 'smtp')`
  ).run(record.application_id, record.email.toLowerCase(), codeHash, salt, expiresAt);

  try {
    await sendOtpEmail(record.email, record.full_name, record.application_id, otp);
    res.json({
      otpSent: true,
      smtpConfigured: true,
      maskedEmail: maskEmail(record.email),
      expiresInMinutes: 10,
    });
  } catch {
    res.status(502).json({
      error:
        'Unable to dispatch the verification email via the configured SMTP server. Please verify SMTP credentials or contact HR.',
    });
  }
});

app.post('/api/candidate/verify-otp', (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(`otp-ver:${ip}`, 15, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many verification attempts. Please wait before trying again.' });
    return;
  }

  const applicationId = String(req.body?.applicationId || '').trim().toUpperCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();

  if (!applicationId || !isValidEmail(email) || !/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'Invalid verification code or credentials.' });
    return;
  }

  const otpRow = db
    .prepare(
      `SELECT id, application_id, email, code_hash, salt, expires_at, attempts
       FROM candidate_otps
       WHERE UPPER(application_id) = ? AND LOWER(email) = ? AND consumed = 0
       ORDER BY id DESC LIMIT 1`
    )
    .get(applicationId, email) as
    | {
        id: number;
        application_id: string;
        email: string;
        code_hash: string;
        salt: string;
        expires_at: number;
        attempts: number;
      }
    | undefined;

  if (!otpRow || Date.now() > otpRow.expires_at || otpRow.attempts >= 5) {
    res.status(400).json({
      error: 'Verification code is invalid or expired. Please request a new code.',
    });
    return;
  }

  if (!verifyOtpHash(code, otpRow.salt, otpRow.code_hash)) {
    db.prepare('UPDATE candidate_otps SET attempts = attempts + 1 WHERE id = ?').run(otpRow.id);
    res.status(400).json({ error: 'Incorrect verification code. Please check and try again.' });
    return;
  }

  db.prepare('UPDATE candidate_otps SET consumed = 1 WHERE id = ?').run(otpRow.id);

  const token = signToken(
    {
      typ: 'candidate',
      sub: otpRow.application_id,
      applicationId: otpRow.application_id,
      email: otpRow.email,
    },
    30 * 60
  );

  res.json({ verified: true, token });
});

app.get('/api/candidate/status', requireCandidate, (req: AuthenticatedRequest, res) => {
  const row = db
    .prepare(
      `SELECT application_id, full_name, email, position_title, department, location,
              status, offer_status, offer_issue_date, joining_date, offer_pdf_storage_name, created_at
       FROM applications
       WHERE UPPER(application_id) = ? AND LOWER(email) = ?`
    )
    .get(req.auth!.applicationId!.toUpperCase(), req.auth!.email.toLowerCase()) as
    | Record<string, string | null>
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  let hasOfferPdf = false;
  if (row.offer_status === 'issued' && row.offer_pdf_storage_name) {
    try {
      const pdfPath = safeResolveInDir(OFFER_LETTERS_DIR, row.offer_pdf_storage_name);
      hasOfferPdf = fs.existsSync(pdfPath);
    } catch {
      hasOfferPdf = false;
    }
  }

  res.json({
    candidate: {
      candidateName: row.full_name,
      applicationId: row.application_id,
      appliedPosition: row.position_title,
      department: row.department,
      location: row.location,
      applicationStatus: row.status,
      offerLetterStatus: row.offer_status,
      offerIssueDate: row.offer_issue_date,
      joiningDate: row.joining_date,
      hasOfferPdf,
      submittedAt: row.created_at,
    },
  });
});

app.get('/api/candidate/offer-letter/pdf', requireCandidate, (req: AuthenticatedRequest, res) => {
  const row = db
    .prepare(
      `SELECT application_id, offer_status, offer_pdf_storage_name, offer_pdf_original_name
       FROM applications
       WHERE UPPER(application_id) = ? AND LOWER(email) = ?`
    )
    .get(req.auth!.applicationId!.toUpperCase(), req.auth!.email.toLowerCase()) as
    | {
        application_id: string;
        offer_status: string;
        offer_pdf_storage_name: string | null;
        offer_pdf_original_name: string | null;
      }
    | undefined;

  if (!row || row.offer_status !== 'issued' || !row.offer_pdf_storage_name) {
    res.status(403).json({
      error: 'No active offer letter is currently available for this application.',
    });
    return;
  }

  let pdfPath: string;
  try {
    pdfPath = safeResolveInDir(OFFER_LETTERS_DIR, row.offer_pdf_storage_name);
  } catch {
    res.status(403).json({ error: 'Unauthorized document path.' });
    return;
  }

  if (!fs.existsSync(pdfPath)) {
    res.status(404).json({ error: 'Offer letter file not found in secure storage.' });
    return;
  }

  const download = req.query.download === '1';
  const safeName = sanitizeDownloadFilename(
    row.offer_pdf_original_name || `LuggageCity_Offer_${row.application_id}.pdf`,
    `LuggageCity_Offer_${row.application_id}.pdf`
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader(
    'Content-Disposition',
    `${download ? 'attachment' : 'inline'}; filename="${safeName}"`
  );
  fs.createReadStream(pdfPath).pipe(res);
});

// ============================================================================
// ADMIN AUTHENTICATION & RBAC API
// ============================================================================

function getAdminSetupState() {
  const envAdminConfigured = Boolean(process.env.ADMIN_PASSWORD?.trim());
  const countRow = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
  return {
    setupRequired: !envAdminConfigured && countRow.count === 0,
    envAdminConfigured,
    smtpConfigured: isSmtpConfigured(),
  };
}

app.get('/api/admin/auth/status', (_req, res) => {
  res.json(getAdminSetupState());
});

app.post('/api/admin/auth/setup', (req, res) => {
  const state = getAdminSetupState();
  if (!state.setupRequired) {
    res.status(403).json({ error: 'Administrator account has already been initialized.' });
    return;
  }

  const { fullName, email, password } = req.body as Record<string, string>;
  if (!fullName?.trim() || !isValidEmail(email || '') || !password || password.length < 8) {
    res.status(400).json({
      error: 'Provide your full name, a valid email address, and a password of at least 8 characters.',
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(password);

  try {
    const info = db
      .prepare(
        `INSERT INTO admins (email, full_name, role, password_hash) VALUES (?, ?, 'super_admin', ?)`
      )
      .run(normalizedEmail, fullName.trim().slice(0, 120), passwordHash);

    const token = signToken(
      {
        typ: 'admin',
        sub: String(info.lastInsertRowid),
        email: normalizedEmail,
        role: 'super_admin',
        fullName: fullName.trim(),
      },
      8 * 60 * 60
    );

    res.status(201).json({
      token,
      admin: {
        id: Number(info.lastInsertRowid),
        email: normalizedEmail,
        fullName: fullName.trim(),
        role: 'super_admin',
      },
    });
  } catch {
    res.status(409).json({ error: 'Administrator setup already completed.' });
  }
});

app.post('/api/admin/auth/login', (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(`admin-login:${ip}`, 12, 10 * 60 * 1000)) {
    res.status(429).json({ error: 'Too many login attempts. Please try again shortly.' });
    return;
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  // Check server-side environment override first
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  const envEmail = (process.env.ADMIN_EMAIL?.trim() || 'admin@luggagecity.ca').toLowerCase();
  if (envPass && email === envEmail) {
    const a = Buffer.from(password);
    const b = Buffer.from(envPass);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      const token = signToken(
        {
          typ: 'admin',
          sub: 'env-super-admin',
          email: envEmail,
          role: 'super_admin',
          fullName: 'Luggage City Administrator',
        },
        8 * 60 * 60
      );
      res.json({
        token,
        admin: {
          id: 0,
          email: envEmail,
          fullName: 'Luggage City Administrator',
          role: 'super_admin',
        },
      });
      return;
    }
  }

  const adminRow = db
    .prepare('SELECT id, email, full_name, role, password_hash FROM admins WHERE LOWER(email) = ?')
    .get(email) as
    | {
        id: number;
        email: string;
        full_name: string;
        role: 'super_admin' | 'hr_manager' | 'recruiter';
        password_hash: string;
      }
    | undefined;

  if (!adminRow || !verifyPassword(password, adminRow.password_hash)) {
    res.status(401).json({ error: 'Invalid administrator email or password.' });
    return;
  }

  const token = signToken(
    {
      typ: 'admin',
      sub: String(adminRow.id),
      email: adminRow.email,
      role: adminRow.role,
      fullName: adminRow.full_name,
    },
    8 * 60 * 60
  );

  res.json({
    token,
    admin: {
      id: adminRow.id,
      email: adminRow.email,
      fullName: adminRow.full_name,
      role: adminRow.role,
    },
  });
});

app.get('/api/admin/me', requireAdmin(), (req: AuthenticatedRequest, res) => {
  res.json({
    admin: {
      email: req.auth!.email,
      fullName: req.auth!.fullName,
      role: req.auth!.role,
    },
    smtpConfigured: isSmtpConfigured(),
  });
});

app.get('/api/admin/overview', requireAdmin(), (_req, res) => {
  const activeJobs = (
    db.prepare('SELECT COUNT(*) as c FROM jobs WHERE is_active = 1').get() as { c: number }
  ).c;
  const totalJobs = (
    db.prepare('SELECT COUNT(*) as c FROM jobs').get() as { c: number }
  ).c;
  const totalApplications = (
    db.prepare('SELECT COUNT(*) as c FROM applications').get() as { c: number }
  ).c;
  const issuedOffers = (
    db.prepare("SELECT COUNT(*) as c FROM applications WHERE offer_status = 'issued'").get() as {
      c: number;
    }
  ).c;
  const shortlistedCount = (
    db
      .prepare(
        "SELECT COUNT(*) as c FROM applications WHERE status IN ('Shortlisted', 'Interview Scheduled', 'Selected')"
      )
      .get() as { c: number }
  ).c;
  const repairRequests = (
    db.prepare('SELECT COUNT(*) as c FROM repair_inquiries').get() as { c: number }
  ).c;
  const ordersCount = (
    db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }
  ).c;

  res.json({
    stats: {
      activeJobs,
      totalJobs,
      totalApplications,
      shortlistedCount,
      issuedOffers,
      repairRequests,
      ordersCount,
    },
    smtpConfigured: isSmtpConfigured(),
  });
});

// Admin Users RBAC Management (super_admin only)
app.get('/api/admin/users', requireAdmin(['super_admin']), (_req, res) => {
  const users = db
    .prepare('SELECT id, email, full_name, role, created_at FROM admins ORDER BY id ASC')
    .all();
  res.json({ users });
});

app.post('/api/admin/users', requireAdmin(['super_admin']), (req, res) => {
  const { fullName, email, role, password } = req.body as Record<string, string>;
  const validRoles = ['super_admin', 'hr_manager', 'recruiter'];
  if (
    !fullName?.trim() ||
    !isValidEmail(email || '') ||
    !validRoles.includes(role) ||
    !password ||
    password.length < 8
  ) {
    res.status(400).json({
      error: 'Provide full name, valid email, valid role, and password (min 8 chars).',
    });
    return;
  }

  try {
    const info = db
      .prepare('INSERT INTO admins (email, full_name, role, password_hash) VALUES (?, ?, ?, ?)')
      .run(email.trim().toLowerCase(), fullName.trim().slice(0, 120), role, hashPassword(password));
    res.status(201).json({
      id: Number(info.lastInsertRowid),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
    });
  } catch {
    res.status(409).json({ error: 'An admin user with this email already exists.' });
  }
});

// Admin Job Management
app.get('/api/admin/jobs', requireAdmin(), (_req, res) => {
  const rows = db.prepare('SELECT * FROM jobs ORDER BY id DESC').all() as Array<
    Record<string, unknown>
  >;
  res.json({
    jobs: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      department: row.department,
      employmentType: row.employment_type,
      location: row.location,
      description: row.description,
      requirements: JSON.parse(String(row.requirements_json || '[]')),
      salaryRange: row.salary_range,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

app.post('/api/admin/jobs', requireAdmin(['super_admin', 'hr_manager']), (req, res) => {
  const { title, department, employmentType, location, description, requirements, salaryRange } =
    req.body as {
      title?: string;
      department?: string;
      employmentType?: string;
      location?: string;
      description?: string;
      requirements?: string[] | string;
      salaryRange?: string;
    };

  if (!title?.trim() || !department?.trim() || !employmentType?.trim() || !location?.trim() || !description?.trim()) {
    res.status(400).json({ error: 'All required job fields must be completed.' });
    return;
  }

  const reqList = Array.isArray(requirements)
    ? requirements.map((r) => String(r).trim()).filter(Boolean)
    : String(requirements || '')
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

  const slugBase = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const slug = `${slugBase}-${crypto.randomInt(100, 999)}`;

  const info = db
    .prepare(
      `INSERT INTO jobs (slug, title, department, employment_type, location, description, requirements_json, salary_range, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .run(
      slug,
      title.trim().slice(0, 140),
      department.trim().slice(0, 100),
      employmentType.trim().slice(0, 80),
      location.trim().slice(0, 140),
      description.trim().slice(0, 4000),
      JSON.stringify(reqList),
      (salaryRange || '').trim().slice(0, 100)
    );

  res.status(201).json({ id: Number(info.lastInsertRowid), slug });
});

app.put('/api/admin/jobs/:id', requireAdmin(['super_admin', 'hr_manager']), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }

  const { title, department, employmentType, location, description, requirements, salaryRange, isActive } =
    req.body as {
      title?: string;
      department?: string;
      employmentType?: string;
      location?: string;
      description?: string;
      requirements?: string[] | string;
      salaryRange?: string;
      isActive?: boolean;
    };

  if (!title?.trim() || !department?.trim() || !employmentType?.trim() || !location?.trim() || !description?.trim()) {
    res.status(400).json({ error: 'All required job fields must be completed.' });
    return;
  }

  const reqList = Array.isArray(requirements)
    ? requirements.map((r) => String(r).trim()).filter(Boolean)
    : String(requirements || '')
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

  const result = db
    .prepare(
      `UPDATE jobs
       SET title = ?, department = ?, employment_type = ?, location = ?, description = ?,
           requirements_json = ?, salary_range = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`
    )
    .run(
      title.trim().slice(0, 140),
      department.trim().slice(0, 100),
      employmentType.trim().slice(0, 80),
      location.trim().slice(0, 140),
      description.trim().slice(0, 4000),
      JSON.stringify(reqList),
      (salaryRange || '').trim().slice(0, 100),
      isActive === false ? 0 : 1,
      id
    );

  if (result.changes === 0) {
    res.status(404).json({ error: 'Job listing not found.' });
    return;
  }
  res.json({ updated: true });
});

app.patch('/api/admin/jobs/:id/toggle', requireAdmin(['super_admin', 'hr_manager']), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }
  const existing = db.prepare('SELECT is_active FROM jobs WHERE id = ?').get(id) as
    | { is_active: number }
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Job listing not found.' });
    return;
  }
  const nextActive = existing.is_active ? 0 : 1;
  db.prepare("UPDATE jobs SET is_active = ?, updated_at = datetime('now') WHERE id = ?").run(
    nextActive,
    id
  );
  res.json({ isActive: Boolean(nextActive) });
});

app.delete('/api/admin/jobs/:id', requireAdmin(['super_admin', 'hr_manager']), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }
  const result = db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Job listing not found.' });
    return;
  }
  res.json({ deleted: true });
});

// Admin Application Management
app.get('/api/admin/applications', requireAdmin(), (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const position = typeof req.query.position === 'string' ? req.query.position.trim() : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (status && status !== 'all') {
    clauses.push('status = ?');
    params.push(status);
  }
  if (position && position !== 'all') {
    clauses.push('position_title = ?');
    params.push(position);
  }
  if (q) {
    clauses.push(
      '(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(application_id) LIKE ? OR LOWER(position_title) LIKE ?)'
    );
    const wildcard = `%${q}%`;
    params.push(wildcard, wildcard, wildcard, wildcard);
  }

  const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM applications ${whereSql} ORDER BY id DESC`)
    .all(...params) as Array<Record<string, unknown>>;

  res.json({
    applications: rows.map((row) => ({
      id: row.id,
      applicationId: row.application_id,
      jobId: row.job_id,
      positionTitle: row.position_title,
      department: row.department,
      location: row.location,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      coverLetter: row.cover_letter,
      resumeOriginalName: row.resume_original_name,
      status: row.status,
      internalNotes: row.internal_notes,
      offerStatus: row.offer_status,
      offerIssueDate: row.offer_issue_date,
      joiningDate: row.joining_date,
      offerCompensation: row.offer_compensation,
      offerPdfOriginalName: row.offer_pdf_original_name,
      offerPublishedBy: row.offer_published_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

app.patch('/api/admin/applications/:id', requireAdmin(), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid application ID.' });
    return;
  }

  const { status, internalNotes } = req.body as {
    status?: string;
    internalNotes?: string;
  };

  const existing = db.prepare('SELECT id, status, internal_notes FROM applications WHERE id = ?').get(id) as
    | { id: number; status: string; internal_notes: string }
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  let nextStatus = existing.status;
  if (status !== undefined) {
    if (!(APPLICATION_STATUSES as readonly string[]).includes(status)) {
      res.status(400).json({ error: 'Invalid application status value.' });
      return;
    }
    nextStatus = status;
  }

  const nextNotes =
    internalNotes !== undefined ? String(internalNotes).slice(0, 4000) : existing.internal_notes;

  db.prepare(
    `UPDATE applications SET status = ?, internal_notes = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(nextStatus, nextNotes, id);

  res.json({ updated: true, status: nextStatus, internalNotes: nextNotes });
});

app.get('/api/admin/applications/:id/resume', requireAdmin(), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid application ID.' });
    return;
  }
  const row = db
    .prepare(
      'SELECT resume_storage_name, resume_original_name, resume_mime FROM applications WHERE id = ?'
    )
    .get(id) as
    | { resume_storage_name: string; resume_original_name: string; resume_mime: string }
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  let filePath: string;
  try {
    filePath = safeResolveInDir(RESUMES_DIR, row.resume_storage_name);
  } catch {
    res.status(403).json({ error: 'Invalid file path.' });
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'Resume file is no longer available.' });
    return;
  }

  const safeName = sanitizeDownloadFilename(row.resume_original_name, 'resume.pdf');
  res.setHeader('Content-Type', row.resume_mime || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  fs.createReadStream(filePath).pipe(res);
});

// Admin Offer Letter Management (Generate Official PDF or Upload Official PDF)
app.post(
  '/api/admin/applications/:id/offer/generate',
  requireAdmin(['super_admin', 'hr_manager']),
  async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid application ID.' });
      return;
    }

    const { offerIssueDate, joiningDate, compensation, signatoryName, signatoryTitle } =
      req.body as Record<string, string>;

    if (!offerIssueDate?.trim() || !joiningDate?.trim()) {
      res.status(400).json({ error: 'Offer issue date and joining date are required.' });
      return;
    }

    const appRow = db
      .prepare(
        `SELECT id, application_id, full_name, email, position_title, department, location, offer_pdf_storage_name
         FROM applications WHERE id = ?`
      )
      .get(id) as
      | {
          id: number;
          application_id: string;
          full_name: string;
          email: string;
          position_title: string;
          department: string;
          location: string;
          offer_pdf_storage_name: string | null;
        }
      | undefined;

    if (!appRow) {
      res.status(404).json({ error: 'Candidate application not found.' });
      return;
    }

    const storageFilename = `offer-${crypto.randomUUID()}.pdf`;
    const outputPath = safeResolveInDir(OFFER_LETTERS_DIR, storageFilename);

    await generateOfficialOfferLetterPdf({
      outputPath,
      applicationId: appRow.application_id,
      candidateName: appRow.full_name,
      candidateEmail: appRow.email,
      positionTitle: appRow.position_title,
      department: appRow.department,
      location: appRow.location,
      offerIssueDate: offerIssueDate.trim(),
      joiningDate: joiningDate.trim(),
      compensation: compensation?.trim() || undefined,
      signatoryName: signatoryName?.trim() || req.auth!.fullName || 'Luggage City Human Resources',
      signatoryTitle: signatoryTitle?.trim() || 'Human Resources & Talent Acquisition',
    });

    // Clean up superseded private PDF if one existed
    if (appRow.offer_pdf_storage_name) {
      try {
        const oldPath = safeResolveInDir(OFFER_LETTERS_DIR, appRow.offer_pdf_storage_name);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {
        // ignore cleanup failure
      }
    }

    const originalName = `LuggageCity_Offer_${appRow.application_id}.pdf`;
    db.prepare(
      `UPDATE applications
       SET status = 'Offer Letter Issued',
           offer_status = 'issued',
           offer_issue_date = ?,
           joining_date = ?,
           offer_compensation = ?,
           offer_pdf_storage_name = ?,
           offer_pdf_original_name = ?,
           offer_published_by = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      offerIssueDate.trim(),
      joiningDate.trim(),
      (compensation || '').trim().slice(0, 140),
      storageFilename,
      originalName,
      req.auth!.email,
      id
    );

    res.status(201).json({
      published: true,
      applicationId: appRow.application_id,
      offerStatus: 'issued',
      offerIssueDate: offerIssueDate.trim(),
      joiningDate: joiningDate.trim(),
      fileName: originalName,
    });
  }
);

app.post(
  '/api/admin/applications/:id/offer/upload',
  requireAdmin(['super_admin', 'hr_manager']),
  (req: AuthenticatedRequest, res) => {
    offerPdfUpload.single('offerPdf')(req, res, (uploadErr) => {
      if (uploadErr) {
        res.status(400).json({
          error:
            uploadErr instanceof multer.MulterError && uploadErr.code === 'LIMIT_FILE_SIZE'
              ? 'Offer letter PDF must be 10 MB or smaller.'
              : 'Failed to process offer letter PDF upload.',
        });
        return;
      }

      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Invalid application ID.' });
        return;
      }

      const { offerIssueDate, joiningDate, compensation } = req.body as Record<string, string>;
      if (!offerIssueDate?.trim() || !joiningDate?.trim()) {
        res.status(400).json({ error: 'Offer issue date and joining date are required.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Please select an official offer letter PDF file to upload.' });
        return;
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext !== '.pdf' || !validateMagicBytes(req.file.buffer, '.pdf')) {
        res.status(400).json({ error: 'Uploaded offer letter must be a valid PDF document.' });
        return;
      }

      const appRow = db
        .prepare('SELECT id, application_id, offer_pdf_storage_name FROM applications WHERE id = ?')
        .get(id) as
        | { id: number; application_id: string; offer_pdf_storage_name: string | null }
        | undefined;
      if (!appRow) {
        res.status(404).json({ error: 'Candidate application not found.' });
        return;
      }

      const storageFilename = `offer-${crypto.randomUUID()}.pdf`;
      const targetPath = safeResolveInDir(OFFER_LETTERS_DIR, storageFilename);
      fs.writeFileSync(targetPath, req.file.buffer, { mode: 0o600 });

      if (appRow.offer_pdf_storage_name) {
        try {
          const oldPath = safeResolveInDir(OFFER_LETTERS_DIR, appRow.offer_pdf_storage_name);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        } catch {
          // ignore
        }
      }

      const safeOrigName = sanitizeDownloadFilename(
        req.file.originalname,
        `LuggageCity_Offer_${appRow.application_id}.pdf`
      );

      db.prepare(
        `UPDATE applications
         SET status = 'Offer Letter Issued',
             offer_status = 'issued',
             offer_issue_date = ?,
             joining_date = ?,
             offer_compensation = ?,
             offer_pdf_storage_name = ?,
             offer_pdf_original_name = ?,
             offer_published_by = ?,
             updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        offerIssueDate.trim(),
        joiningDate.trim(),
        (compensation || '').trim().slice(0, 140),
        storageFilename,
        safeOrigName,
        req.auth!.email,
        id
      );

      res.status(201).json({
        published: true,
        applicationId: appRow.application_id,
        offerStatus: 'issued',
        offerIssueDate: offerIssueDate.trim(),
        joiningDate: joiningDate.trim(),
        fileName: safeOrigName,
      });
    });
  }
);

app.patch(
  '/api/admin/applications/:id/offer/revoke',
  requireAdmin(['super_admin', 'hr_manager']),
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid application ID.' });
      return;
    }

    const result = db
      .prepare(
        `UPDATE applications
         SET offer_status = 'revoked', status = 'Under Review', updated_at = datetime('now')
         WHERE id = ?`
      )
      .run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }
    res.json({ revoked: true });
  }
);

app.get('/api/admin/applications/:id/offer/pdf', requireAdmin(), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid application ID.' });
    return;
  }

  const row = db
    .prepare(
      'SELECT application_id, offer_pdf_storage_name, offer_pdf_original_name FROM applications WHERE id = ?'
    )
    .get(id) as
    | {
        application_id: string;
        offer_pdf_storage_name: string | null;
        offer_pdf_original_name: string | null;
      }
    | undefined;

  if (!row || !row.offer_pdf_storage_name) {
    res.status(404).json({ error: 'No offer letter PDF stored for this candidate.' });
    return;
  }

  const pdfPath = safeResolveInDir(OFFER_LETTERS_DIR, row.offer_pdf_storage_name);
  if (!fs.existsSync(pdfPath)) {
    res.status(404).json({ error: 'Offer letter file missing in private storage.' });
    return;
  }

  const safeName = sanitizeDownloadFilename(
    row.offer_pdf_original_name || `LuggageCity_Offer_${row.application_id}.pdf`,
    `LuggageCity_Offer_${row.application_id}.pdf`
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  fs.createReadStream(pdfPath).pipe(res);
});

// Authorized HR Admin one-time verification code generator (strictly authenticated, for use when SMTP is pending)
app.post(
  '/api/admin/applications/:id/issue-verification-code',
  requireAdmin(['super_admin', 'hr_manager']),
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid application ID.' });
      return;
    }

    const record = db
      .prepare('SELECT application_id, email FROM applications WHERE id = ?')
      .get(id) as { application_id: string; email: string } | undefined;

    if (!record) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }

    const code = generateNumericOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = hashOtp(code, salt);
    const expiresAt = Date.now() + 10 * 60 * 1000;

    db.prepare(
      `UPDATE candidate_otps SET consumed = 1 WHERE UPPER(application_id) = ? AND consumed = 0`
    ).run(record.application_id.toUpperCase());

    db.prepare(
      `INSERT INTO candidate_otps (application_id, email, code_hash, salt, expires_at, delivery_mode)
       VALUES (?, ?, ?, ?, ?, 'admin_issued')`
    ).run(record.application_id, record.email.toLowerCase(), codeHash, salt, expiresAt);

    res.status(201).json({
      applicationId: record.application_id,
      email: record.email,
      verificationCode: code,
      expiresInMinutes: 10,
    });
  }
);

// ============================================================================
// VITE DEV MIDDLEWARE / PRODUCTION STATIC HOSTING
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luggage City server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
