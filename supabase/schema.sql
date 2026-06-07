create extension if not exists pgcrypto;

create type public.staff_role as enum ('admin', 'kitchen', 'inventory', 'courier');
create type public.order_status as enum ('new', 'accepted', 'preparing', 'baking', 'packing', 'out_for_delivery', 'ready_for_pickup', 'completed', 'cancelled');
create type public.delivery_task_status as enum ('queued', 'assigned', 'accepted', 'arrived_at_restaurant', 'picked_up', 'near_customer', 'delivered', 'failed', 'cancelled');

create table public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.staff_role not null default 'kitchen',
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.categories(id),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  icon text not null default '+',
  allergens text[] not null default '{}',
  weight_label text,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order integer not null default 0
);

create table public.product_extras (
  product_id uuid not null references public.products(id) on delete cascade,
  extra_product_id uuid not null references public.products(id) on delete restrict,
  primary key (product_id, extra_product_id)
);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  village text not null unique,
  fee numeric(10,2) not null default 0,
  minimum_order numeric(10,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text not null,
  email text,
  newsletter_opt_in boolean not null default false,
  loyalty_points integer not null default 0,
  registered_at timestamptz,
  last_order_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  status public.order_status not null default 'new',
  village text not null,
  street text not null,
  note text,
  payment_method text not null check (payment_method in ('card', 'cash')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  accepted_at timestamptz,
  promised_at timestamptz,
  completed_at timestamptz,
  loyalty_awarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  variant_name text,
  extras text[] not null default '{}',
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null check (line_total >= 0),
  kitchen_note text
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  message text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.couriers (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  phone text,
  vehicle_type text not null default 'car',
  is_active boolean not null default true,
  is_online boolean not null default false,
  last_lat numeric(10,7),
  last_lng numeric(10,7),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.delivery_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  courier_id uuid references public.couriers(id) on delete set null,
  status public.delivery_task_status not null default 'queued',
  pickup_address text not null default 'Pizza Jašterka, Hlohovec',
  dropoff_village text not null,
  dropoff_street text not null,
  distance_km numeric(8,2),
  fee numeric(10,2) not null default 0,
  assigned_at timestamptz,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  delivery_task_id uuid not null references public.delivery_tasks(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.delivery_task_status not null,
  message text not null,
  lat numeric(10,7),
  lng numeric(10,7),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.courier_rewards (
  id uuid primary key default gen_random_uuid(),
  courier_id uuid not null references public.couriers(id) on delete cascade,
  delivery_task_id uuid references public.delivery_tasks(id) on delete set null,
  amount numeric(10,2) not null,
  reason text not null,
  reward_type text not null default 'bonus' check (reward_type in ('bonus', 'adjustment', 'penalty')),
  created_at timestamptz not null default now()
);

create table public.courier_payouts (
  id uuid primary key default gen_random_uuid(),
  courier_id uuid not null references public.couriers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  deliveries_count integer not null default 0,
  delivery_earnings numeric(10,2) not null default 0,
  rewards_total numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  is_paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null default 'g',
  stock_qty numeric(12,3) not null default 0,
  low_stock_qty numeric(12,3) not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.product_ingredients (
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  qty numeric(12,3) not null check (qty >= 0),
  primary key (product_id, ingredient_id)
);

create table public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_extras enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.couriers enable row level security;
alter table public.delivery_tasks enable row level security;
alter table public.delivery_events enable row level security;
alter table public.courier_rewards enable row level security;
alter table public.courier_payouts enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.notification_subscriptions enable row level security;

create policy "Public menu read categories" on public.categories for select using (is_active);
create policy "Public menu read products" on public.products for select using (is_active);
create policy "Public menu read variants" on public.product_variants for select using (true);
create policy "Public menu read extras" on public.product_extras for select using (true);
create policy "Public read delivery zones" on public.delivery_zones for select using (is_active);
create policy "Customer read own order by token through api only" on public.orders for select using (false);
create policy "Staff full categories" on public.categories for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin')));
create policy "Staff full products" on public.products for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin')));
create policy "Staff read orders" on public.orders for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','kitchen','courier')));
create policy "Staff update orders" on public.orders for update using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','kitchen','courier'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','kitchen','courier')));
create policy "Staff read items" on public.order_items for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','kitchen','courier')));
create policy "Staff read events" on public.order_events for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','kitchen','courier')));
create policy "Inventory staff full ingredients" on public.ingredients for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','inventory'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','inventory')));
create policy "Courier staff read couriers" on public.couriers for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Admin full couriers" on public.couriers for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin')));
create policy "Courier staff read tasks" on public.delivery_tasks for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Courier staff update tasks" on public.delivery_tasks for update using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Courier staff read events" on public.delivery_events for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Courier staff read rewards" on public.courier_rewards for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Admin full rewards" on public.courier_rewards for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin')));
create policy "Courier staff read payouts" on public.courier_payouts for select using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin','courier','kitchen')));
create policy "Admin full payouts" on public.courier_payouts for all using (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin'))) with check (exists (select 1 from public.staff_profiles s where s.id = auth.uid() and s.role in ('admin')));

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_events;
alter publication supabase_realtime add table public.delivery_tasks;
alter publication supabase_realtime add table public.delivery_events;
alter publication supabase_realtime add table public.couriers;
alter publication supabase_realtime add table public.courier_rewards;
alter publication supabase_realtime add table public.courier_payouts;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.ingredients;