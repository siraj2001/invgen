-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies Table
create table public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  gstin text,
  pan text,
  address text,
  phone text,
  email text,
  website text,
  bank_name text,
  account_name text,
  account_number text,
  ifsc text,
  upi_id text,
  terms text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers Table
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_name text,
  gstin text,
  contact_person text,
  phone text,
  email text,
  billing_address text,
  shipping_address text,
  state text,
  pincode text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  hsn_sac text,
  unit_price numeric not null,
  gst_rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices Table
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  date date not null,
  due_date date not null,
  po_number text,
  payment_terms text,
  customer_id uuid references public.customers(id) on delete set null,
  subtotal numeric not null,
  discount numeric not null default 0,
  cgst numeric not null default 0,
  sgst numeric not null default 0,
  igst numeric not null default 0,
  grand_total numeric not null,
  amount_in_words text,
  status text not null default 'Draft',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoice Items Table
create table public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  hsn_sac text,
  quantity numeric not null,
  unit_price numeric not null,
  gst_rate numeric not null,
  tax_amount numeric not null,
  total_amount numeric not null
);

-- Quotations Table
create table public.quotations (
  id uuid primary key default uuid_generate_v4(),
  quotation_number text not null unique,
  date date not null,
  valid_until date not null,
  customer_id uuid references public.customers(id) on delete set null,
  scope_of_work text,
  subtotal numeric not null,
  discount numeric not null default 0,
  cgst numeric not null default 0,
  sgst numeric not null default 0,
  igst numeric not null default 0,
  grand_total numeric not null,
  amount_in_words text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- Since this is a single-user app without auth for now, we will enable RLS but allow all anon access (or true).
-- IMPORTANT: In a real production app with auth, you would restrict this to auth.uid()

alter table public.companies enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.quotations enable row level security;

-- Create policies for anon access (Since we are using anon key without auth for now)
create policy "Allow public access for companies" on public.companies for all using (true) with check (true);
create policy "Allow public access for customers" on public.customers for all using (true) with check (true);
create policy "Allow public access for products" on public.products for all using (true) with check (true);
create policy "Allow public access for invoices" on public.invoices for all using (true) with check (true);
create policy "Allow public access for invoice_items" on public.invoice_items for all using (true) with check (true);
create policy "Allow public access for quotations" on public.quotations for all using (true) with check (true);
