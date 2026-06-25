create extension if not exists "pgcrypto";

create type app_role as enum ('admin', 'anggota');
create type member_status as enum ('aktif', 'nonaktif', 'ditangguhkan');
create type member_type as enum ('anggota_lama', 'anggota_baru');
create type event_status as enum ('draft', 'aktif', 'selesai', 'dibatalkan');
create type attendance_method as enum ('qr_code', 'manual');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  role app_role not null default 'anggota',
  email text,
  phone text,
  must_change_password boolean not null default false,
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

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null,
  date date not null,
  pinned boolean not null default false,
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

-- Note: struktur pengurus, unit, produk, dan galeri bersifat hardcoded di aplikasi
-- (src/lib/data.ts), jadi tidak membutuhkan tabel di sini.

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
alter table announcements enable row level security;
alter table settings enable row level security;
alter table audit_logs enable row level security;

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

create policy "public can read announcements" on announcements for select using (true);
create policy "admin full access announcements" on announcements for all using (is_admin()) with check (is_admin());
create policy "admin full access settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin read audit logs" on audit_logs for select using (is_admin());
create policy "admin insert audit logs" on audit_logs for insert with check (is_admin());
