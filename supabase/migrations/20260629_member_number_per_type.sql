-- Allow anggota_lama and anggota_baru to each start their own member numbers
-- from 1 while keeping the active number unique inside each type.

alter table public.members drop constraint if exists members_member_number_key;
drop index if exists public.members_member_type_number_active_key;
create unique index members_member_type_number_active_key
  on public.members(member_type, member_number)
  where deleted_at is null;