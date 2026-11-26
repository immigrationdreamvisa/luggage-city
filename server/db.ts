import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export const DATA_DIR = path.resolve(process.cwd(), 'private_data');
export const STORAGE_ROOT = path.resolve(process.cwd(), 'private_storage');
export const RESUMES_DIR = path.join(STORAGE_ROOT, 'resumes');
export const OFFER_LETTERS_DIR = path.join(STORAGE_ROOT, 'offer_letters');

for (const dir of [DATA_DIR, STORAGE_ROOT, RESUMES_DIR, OFFER_LETTERS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

export const db = new Database(path.join(DATA_DIR, 'luggage_city.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin', 'hr_manager', 'recruiter')),
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements_json TEXT NOT NULL,
    salary_range TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL UNIQUE,
    job_id INTEGER,
    position_title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    phone TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    resume_storage_name TEXT NOT NULL,
    resume_original_name TEXT NOT NULL,
    resume_mime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Application Received'
      CHECK(status IN (
        'Application Received',
        'Under Review',
        'Shortlisted',
        'Interview Scheduled',
        'Selected',
        'Offer Letter Issued',
        'Rejected'
      )),
    internal_notes TEXT NOT NULL DEFAULT '',
    offer_status TEXT NOT NULL DEFAULT 'not_issued'
      CHECK(offer_status IN ('not_issued', 'issued', 'revoked')),
    offer_issue_date TEXT,
    joining_date TEXT,
    offer_compensation TEXT,
    offer_pdf_storage_name TEXT,
    offer_pdf_original_name TEXT,
    offer_published_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS candidate_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    code_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    consumed INTEGER NOT NULL DEFAULT 0,
    delivery_mode TEXT NOT NULL DEFAULT 'smtp',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS repair_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    brand TEXT NOT NULL,
    item_type TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    preferred_location TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    items_json TEXT NOT NULL,
    subtotal_cad REAL NOT NULL,
    shipping_cad REAL NOT NULL,
    tax_cad REAL NOT NULL,
    total_cad REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const jobCount = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as {
  count: number;
};

if (jobCount.count === 0) {
  const seedJobs = [
    {
      slug: 'retail-sales-associate-woodbridge',
      title: 'Retail Sales Associate',
      department: 'Retail Operations',
      employment_type: 'Full-Time / Part-Time',
      location: 'Woodbridge, ON (Flagship Store)',
      description:
        'Deliver consultative, tailored product recommendations across 40+ international luggage and travel gear brands inside our 5,000 sq ft Woodbridge travel superstore.',
      requirements: [
        '1+ year of specialty retail or customer service experience',
        'Passion for travel goods, craftsmanship, and brand storytelling',
        'Ability to assist clients with luggage sizing, airline carry-on compliance, and warranty guidance',
        'Availability for flexible retail schedules including weekends',
      ],
      salary_range: '$19 – $23 / hr + Sales Incentives',
    },
    {
      slug: 'store-manager-thornhill',
      title: 'Store Manager',
      department: 'Retail Leadership',
      employment_type: 'Full-Time',
      location: 'Thornhill, ON (Promenade Mall)',
      description:
        'Lead daily store operations, visual merchandising, inventory accuracy, and team coaching at our Promenade Mall showroom while upholding Luggage City service standards.',
      requirements: [
        '3+ years of retail store management or assistant management experience',
        'Proven record achieving sales targets and developing high-performing associates',
        'Strong inventory planning, POS, and client resolution skills',
        'Excellent communication and leadership presence',
      ],
      salary_range: '$62,000 – $72,000 CAD / yr',
    },
    {
      slug: 'customer-support-representative',
      title: 'Customer Support Representative',
      department: 'Client Care & Warranty',
      employment_type: 'Full-Time',
      location: 'Woodbridge, ON (Hybrid)',
      description:
        'Support online Canadian shoppers and warranty clients via phone and email with order tracking, return authorizations, and authorized repair coordination.',
      requirements: [
        '2+ years in e-commerce customer care or retail client support',
        'Clear, empathetic written and spoken English (French is an asset)',
        'Comfort working with order management systems and carrier tracking portals',
        'Detail-oriented approach to warranty and exchange documentation',
      ],
      salary_range: '$46,000 – $54,000 CAD / yr',
    },
    {
      slug: 'warehouse-associate-woodbridge',
      title: 'Warehouse & Fulfillment Associate',
      department: 'Logistics & Distribution',
      employment_type: 'Full-Time',
      location: 'Woodbridge, ON (Distribution Hub)',
      description:
        'Manage inbound brand shipments, quality inspections, safe luggage packaging, and same-day Canadian parcel dispatch from our Vaughan fulfillment hub.',
      requirements: [
        'Experience in warehouse fulfillment, picking, packing, and shipping',
        'Ability to safely lift and handle boxed luggage sets up to 50 lbs',
        'High accuracy with barcode scanning and inventory control',
        'Punctual, dependable team player',
      ],
      salary_range: '$21 – $25 / hr',
    },
    {
      slug: 'ecommerce-executive',
      title: 'E-commerce Executive',
      department: 'Digital Commerce',
      employment_type: 'Full-Time',
      location: 'Woodbridge, ON (Hybrid)',
      description:
        'Own product catalog merchandising, seasonal campaign launches, pricing synchronization, and conversion optimization across luggagecity.ca.',
      requirements: [
        '2+ years managing multi-brand retail e-commerce storefronts',
        'Proficiency with catalog feeds, SKU specifications, and web analytics',
        'Strong collaboration skills across buying, warehouse, and marketing teams',
        'Eye for clean merchandising and accurate technical product detail',
      ],
      salary_range: '$58,000 – $68,000 CAD / yr',
    },
    {
      slug: 'marketing-specialist',
      title: 'Marketing Specialist',
      department: 'Brand & Growth',
      employment_type: 'Full-Time',
      location: 'Woodbridge, ON (Hybrid)',
      description:
        'Shape seasonal travel campaigns, email newsletters, brand co-op promotions with Samsonite and Briggs & Riley, and local showroom events.',
      requirements: [
        '2–4 years in retail, consumer goods, or lifestyle brand marketing',
        'Hands-on experience with email marketing, paid digital campaigns, and editorial copywriting',
        'Strong analytical mindset for campaign ROI and customer retention',
        'Portfolio of multi-channel retail campaigns',
      ],
      salary_range: '$56,000 – $66,000 CAD / yr',
    },
  ];

  const insertJob = db.prepare(`
    INSERT INTO jobs (slug, title, department, employment_type, location, description, requirements_json, salary_range, is_active)
    VALUES (@slug, @title, @department, @employment_type, @location, @description, @requirements_json, @salary_range, 1)
  `);

  const seedTx = db.transaction(() => {
    for (const job of seedJobs) {
      insertJob.run({
        ...job,
        requirements_json: JSON.stringify(job.requirements),
      });
    }
  });
  seedTx();
}

export const APPLICATION_STATUSES = [
  'Application Received',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Offer Letter Issued',
  'Rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
