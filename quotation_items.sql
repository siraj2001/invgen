-- Quotation Items Table
create table public.quotation_items (
  id uuid primary key default uuid_generate_v4(),
  quotation_id uuid references public.quotations(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  hsn_sac text,
  quantity numeric not null,
  unit_price numeric not null,
  gst_rate numeric not null,
  tax_amount numeric not null,
  total_amount numeric not null
);

alter table public.quotation_items enable row level security;
create policy "Allow all operations for anon on quotation_items" on public.quotation_items for all to anon using (true) with check (true);
