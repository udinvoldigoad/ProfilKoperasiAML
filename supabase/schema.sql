create extension if not exists "pgcrypto";

create type app_role as enum ('admin', 'anggota');
create type member_status as enum ('aktif', 'nonaktif', 'ditangguhkan');
create type member_type as enum ('anggota_lama', 'anggota_baru');
create type event_status as enum ('draft', 'aktif', 'selesai', 'dibatalkan');
create type publish_status as enum ('draft', 'publish');
create type attendance_method as enum ('qr_code', 'manual');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  role app_role not null default 'anggota',
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete set null,
  member_number text not null unique,
  full_name text not null,
  nik text not null unique check (nik ~ '^[0-9]{16}$'),
  birth_place text not null,
  birth_date date not null check (birth_date <= current_date),
  address text not null,
  photo_url text,
  email text,
  phone text,
  status member_status not null default 'aktif',
  member_type member_type not null default 'anggota_lama',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column members.nik is 'Identifier login anggota di UI. NIK wajib unik dan 16 digit.';

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  location text not null,
  description text not null,
  status event_status not null default 'draft',
  qr_token text unique,
  qr_expires_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table attendances (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete restrict,
  member_id uuid not null references members(id) on delete restrict,
  attended_at timestamptz not null default now(),
  method attendance_method not null default 'qr_code',
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create table board_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text not null,
  photo_url text,
  contact text,
  period text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  category text not null,
  status text not null default 'aktif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  thumbnail_url text,
  content text not null,
  author_id uuid references profiles(id) on delete set null,
  status publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  description text,
  event_date date,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  contact text,
  description text,
  photo_url text,
  maps_url text,
  status text not null default 'aktif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index members_status_type_idx on members(status, member_type) where deleted_at is null;
create index events_status_date_idx on events(status, date) where deleted_at is null;
create index attendances_member_idx on attendances(member_id);
create index audit_logs_created_idx on audit_logs(created_at desc);

create or replace function current_profile_role()
returns app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

alter table profiles enable row level security;
alter table members enable row level security;
alter table events enable row level security;
alter table attendances enable row level security;
alter table board_members enable row level security;
alter table products enable row level security;
alter table posts enable row level security;
alter table gallery enable row level security;
alter table units enable row level security;
alter table settings enable row level security;
alter table audit_logs enable row level security;

create policy "public can read published content" on posts
for select using (status = 'publish');

create policy "public can read profile content" on board_members
for select using (true);

create policy "public can read active products" on products
for select using (status = 'aktif');

create policy "public can read gallery" on gallery
for select using (true);

create policy "public can read active units" on units
for select using (status = 'aktif');

create policy "admin full access profiles" on profiles
for all using (is_admin()) with check (is_admin());

create policy "member read own profile" on profiles
for select using (auth_user_id = auth.uid());

create policy "admin full access members" on members
for all using (is_admin()) with check (is_admin());

create policy "member read own member row" on members
for select using (
  profile_id in (select id from profiles where auth_user_id = auth.uid())
);

create policy "member update allowed fields through server only" on members
for update using (
  profile_id in (select id from profiles where auth_user_id = auth.uid())
) with check (
  profile_id in (select id from profiles where auth_user_id = auth.uid())
);

create policy "admin full access events" on events
for all using (is_admin()) with check (is_admin());

create policy "members read active events" on events
for select using (deleted_at is null and status in ('aktif', 'selesai'));

create policy "admin full access attendances" on attendances
for all using (is_admin()) with check (is_admin());

create policy "members read own attendance" on attendances
for select using (
  member_id in (
    select m.id
    from members m
    join profiles p on p.id = m.profile_id
    where p.auth_user_id = auth.uid()
  )
);

create policy "admin full access board members" on board_members for all using (is_admin()) with check (is_admin());
create policy "admin full access products" on products for all using (is_admin()) with check (is_admin());
create policy "admin full access posts" on posts for all using (is_admin()) with check (is_admin());
create policy "admin full access gallery" on gallery for all using (is_admin()) with check (is_admin());
create policy "admin full access units" on units for all using (is_admin()) with check (is_admin());
create policy "admin full access settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin read audit logs" on audit_logs for select using (is_admin());
create policy "admin insert audit logs" on audit_logs for insert with check (is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('member-photos', 'member-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('news-thumbnails', 'news-thumbnails', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('board-photos', 'board-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;


