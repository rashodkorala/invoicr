-- ── Clients ──────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  company text,
  address text,
  city text,
  province text,
  postal_code text,
  email text,
  phone text
);

-- ── Invoices ─────────────────────────────────────────────────
create type invoice_status as enum ('draft', 'sent', 'deposit_paid', 'paid');

create table invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  invoice_number text not null unique,
  date date not null,
  client_id uuid references clients(id),
  status invoice_status default 'draft',
  payment_terms text,
  tax_rate numeric default 0,
  subtotal numeric not null,
  total numeric not null,
  notes text
);

-- ── Line Items ───────────────────────────────────────────────
create table line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  rate numeric,
  quantity numeric,
  amount numeric not null,
  sort_order int default 0,
  is_subitem boolean default false
);

-- ── Settings (single row) ────────────────────────────────────
create table settings (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null default 'Rashod Korala',
  address text default '25 Paton Street',
  city text default 'St. John''s',
  province text default 'NL',
  postal_code text default 'A1B 3E8',
  email text default 'rmanamperiko@mun.ca',
  phone text default '+1 709 697 6280',
  website text default 'www.rashodkorala.com',
  etransfer_email text default 'rmanamperiko@mun.ca',
  next_invoice_number int default 4
);

-- Seed settings with your details
insert into settings default values;

-- ── Row Level Security ───────────────────────────────────────
alter table clients enable row level security;
alter table invoices enable row level security;
alter table line_items enable row level security;
alter table settings enable row level security;

-- Service role bypasses RLS, so the backend has full access.
-- Add user-level policies here if you add Supabase Auth in future.
