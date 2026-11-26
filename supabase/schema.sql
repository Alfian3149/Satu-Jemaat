-- Skema SatuJemaat untuk Supabase.
-- Jalankan sekali di SQL Editor proyek Supabase yang terhubung ke aplikasi ini.
-- Setelah akun pertama mendaftar, jadikan admin dengan perintah di bagian akhir.

create extension if not exists pgcrypto;

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.households (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  family_number text,
  address text not null,
  sector_id uuid not null references public.sectors (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('admin', 'sector-officer', 'member')),
  sector_id uuid references public.sectors (id),
  household_id uuid references public.households (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  address text not null,
  phone text not null,
  email text,
  nik text not null,
  birth_place text,
  birth_date date not null,
  sector_id uuid not null references public.sectors (id),
  registered_since date,
  previous_church text,
  baptism_date date,
  baptism_place text,
  confirmation_date date,
  confirmation_place text,
  blessing_date date,
  blessing_place text,
  household_id uuid references public.households (id),
  family_role text check (
    family_role is null
    or family_role in ('head', 'spouse', 'child', 'parent', 'other')
  ),
  account_id uuid unique references public.profiles (id),
  profile_photo_path text,
  selfie_photo_path text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_nik_key unique (nik),
  constraint members_nik_length check (nik ~ '^[0-9]{16}$')
);

create table public.member_relations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  related_member_id uuid not null references public.members (id),
  relation_type text not null check (relation_type in ('husband', 'wife', 'father', 'mother', 'child')),
  unique (member_id, related_member_id, relation_type)
);

create table public.member_photos (
  id uuid primary key default gen_random_uuid(),
  alt text not null,
  kind text not null check (kind in ('profile', 'selfie')),
  member_id uuid not null references public.members (id) on delete cascade,
  sector_id uuid not null references public.sectors (id),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table public.advanced_member_data (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.members (id) on delete cascade,
  sector_id uuid not null references public.sectors (id),
  theology jsonb not null default '{}'::jsonb,
  service_witness jsonb not null default '{}'::jsonb,
  gemasa jsonb not null default '{}'::jsonb,
  ppsdi_ppk jsonb not null default '{}'::jsonb,
  pegp jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_types_name_key unique (name)
);

create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint income_sources_name_key unique (name)
);

create table public.activity_records (
  id uuid primary key default gen_random_uuid(),
  activity_type_id uuid not null references public.activity_types (id),
  activity_date date not null,
  place text not null,
  activity_time text not null,
  attendee_count integer not null check (attendee_count >= 0),
  notes text,
  sector_id uuid not null references public.sectors (id),
  recorded_by uuid not null references public.profiles (id),
  has_income boolean not null default false,
  grand_total integer not null default 0 check (grand_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_income_entries (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.activity_records (id) on delete cascade,
  source_id uuid not null references public.income_sources (id),
  total integer not null default 0 check (total >= 0),
  unique (record_id, source_id)
);

create table public.activity_income_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.activity_income_entries (id) on delete cascade,
  denomination integer not null check (denomination >= 0),
  quantity integer not null check (quantity >= 0),
  subtotal integer not null check (subtotal >= 0)
);

create index sectors_name_idx on public.sectors (name);
create index households_sector_idx on public.households (sector_id);
create index households_name_idx on public.households (family_name);
create index members_sector_idx on public.members (sector_id);
create index members_household_idx on public.members (household_id);
create index members_name_idx on public.members (full_name);
create index activity_records_sector_idx on public.activity_records (sector_id);
create index activity_records_date_idx on public.activity_records (activity_date desc);
create index advanced_member_sector_idx on public.advanced_member_data (sector_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sectors_updated before update on public.sectors
for each row execute function public.set_updated_at();
create trigger households_updated before update on public.households
for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();
create trigger members_updated before update on public.members
for each row execute function public.set_updated_at();
create trigger advanced_updated before update on public.advanced_member_data
for each row execute function public.set_updated_at();
create trigger activity_types_updated before update on public.activity_types
for each row execute function public.set_updated_at();
create trigger income_sources_updated before update on public.income_sources
for each row execute function public.set_updated_at();
create trigger activity_records_updated before update on public.activity_records
for each row execute function public.set_updated_at();

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_sector_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select sector_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Jemaat'),
    new.email,
    'member'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_profile_email();

create or replace function public.protect_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() is distinct from 'admin' then
    if new.id = auth.uid()
      and new.role = 'admin'
      and old.role is distinct from 'admin'
      and not exists (select 1 from public.profiles where role = 'admin')
    then
      new.sector_id = old.sector_id;
      new.household_id = old.household_id;
      new.email = old.email;
    else
      new.role = old.role;
      new.sector_id = old.sector_id;
      new.household_id = old.household_id;
      new.email = old.email;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile();

create or replace function public.enforce_officer_sector()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() = 'sector-officer' then
    if public.current_sector_id() is null then
      raise exception 'Petugas belum memiliki sektor tugas.';
    end if;
    new.sector_id = public.current_sector_id();
  end if;
  return new;
end;
$$;

create trigger households_officer_sector
before insert or update on public.households
for each row execute function public.enforce_officer_sector();

create trigger members_officer_sector
before insert or update on public.members
for each row execute function public.enforce_officer_sector();

create or replace function public.prepare_activity_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() = 'sector-officer' then
    if public.current_sector_id() is null then
      raise exception 'Petugas belum memiliki sektor tugas.';
    end if;
    new.sector_id = public.current_sector_id();
  end if;
  new.recorded_by = auth.uid();
  if not exists (
    select 1 from public.activity_types
    where id = new.activity_type_id and active
  ) then
    raise exception 'Nama kegiatan tidak aktif atau tidak ditemukan.';
  end if;
  if not new.has_income then
    new.grand_total = 0;
  end if;
  return new;
end;
$$;

create trigger activity_records_prepare
before insert or update on public.activity_records
for each row execute function public.prepare_activity_record();

create or replace function public.prepare_advanced_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_sector uuid;
begin
  select sector_id into member_sector from public.members where id = new.member_id;
  if member_sector is null then
    raise exception 'Jemaat belum memiliki sektor.';
  end if;
  if public.current_role() = 'sector-officer' and public.current_sector_id() is distinct from member_sector then
    raise exception 'Jemaat tidak berada dalam sektor tugas Anda.';
  end if;
  if public.current_role() not in ('admin', 'sector-officer') then
    raise exception 'Anda tidak memiliki izin mengelola data lanjutan.';
  end if;
  new.sector_id = member_sector;
  return new;
end;
$$;

create trigger advanced_member_prepare
before insert or update on public.advanced_member_data
for each row execute function public.prepare_advanced_member();

create or replace function public.prepare_member_photo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_sector uuid;
begin
  select sector_id into member_sector from public.members where id = new.member_id;
  if member_sector is null then
    raise exception 'Jemaat belum memiliki sektor.';
  end if;
  if public.current_role() = 'sector-officer' and public.current_sector_id() is distinct from member_sector then
    raise exception 'Jemaat tidak berada dalam sektor tugas Anda.';
  end if;
  if public.current_role() not in ('admin', 'sector-officer') then
    raise exception 'Anda tidak memiliki izin mengunggah foto jemaat.';
  end if;
  new.sector_id = member_sector;
  return new;
end;
$$;

create trigger member_photos_prepare
before insert or update on public.member_photos
for each row execute function public.prepare_member_photo();

create or replace function public.apply_income_line()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  parent_record uuid;
  line_id uuid;
  entry_id uuid;
  line_subtotal integer := 0;
begin
  if tg_op = 'DELETE' then
    line_id := old.id;
    entry_id := old.entry_id;
  else
    new.subtotal := greatest(0, new.denomination) * greatest(0, new.quantity);
    line_id := new.id;
    entry_id := new.entry_id;
    line_subtotal := new.subtotal;
  end if;

  update public.activity_income_entries as entry
  set total = coalesce((
    select sum(line.subtotal)
    from public.activity_income_lines as line
    where line.entry_id = entry.id
      and line.id is distinct from line_id
  ), 0) + line_subtotal
  where entry.id = entry_id
  returning entry.record_id into parent_record;

  update public.activity_records as record
  set grand_total = coalesce((
    select sum(entry.total)
    from public.activity_income_entries as entry
    where entry.record_id = record.id
  ), 0)
  where record.id = parent_record;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.protect_member_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() not in ('admin', 'sector-officer') then
    new.sector_id := old.sector_id;
    new.household_id := old.household_id;
    new.family_role := old.family_role;
    new.account_id := old.account_id;
    new.status := old.status;
    new.profile_photo_path := old.profile_photo_path;
    new.selfie_photo_path := old.selfie_photo_path;
    new.nik := old.nik;
  end if;
  return new;
end;
$$;

create trigger members_protect_fields
before update on public.members
for each row execute function public.protect_member_fields();

create trigger income_lines_refresh
after insert or update or delete on public.activity_income_lines
for each row execute function public.refresh_income_totals();

create or replace function public.read_member_nik(member_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_role text;
  result text;
begin
  actor_role := public.current_role();
  select nik into result from public.members where id = member_id;
  if result is null then
    return null;
  end if;
  if actor_role = 'admin' then
    return result;
  end if;
  if actor_role = 'sector-officer' and exists (
    select 1 from public.members
    where id = member_id and sector_id = public.current_sector_id()
  ) then
    return result;
  end if;
  if exists (
    select 1 from public.members where id = member_id and account_id = auth.uid()
  ) then
    return result;
  end if;
  return null;
end;
$$;

create or replace function public.search_member_ids_by_nik(query text)
returns table (id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select members.id
  from public.members
  where public.current_role() in ('admin', 'sector-officer')
    and char_length(query) >= 4
    and (
      public.current_role() = 'admin'
      or members.sector_id = public.current_sector_id()
    )
    and members.nik like '%' || query || '%'
  limit 50
$$;

alter table public.sectors enable row level security;
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.member_relations enable row level security;
alter table public.member_photos enable row level security;
alter table public.advanced_member_data enable row level security;
alter table public.activity_types enable row level security;
alter table public.income_sources enable row level security;
alter table public.activity_records enable row level security;
alter table public.activity_income_entries enable row level security;
alter table public.activity_income_lines enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke select (nik) on public.members from anon, authenticated;
grant execute on function public.read_member_nik(uuid) to authenticated;
grant execute on function public.search_member_ids_by_nik(text) to authenticated;

create policy sectors_read on public.sectors
for select to authenticated
using (auth.uid() is not null);

create policy sectors_write on public.sectors
for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy households_read on public.households
for select to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
  or id = public.current_household_id()
);

create policy households_insert on public.households
for insert to authenticated
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy households_update on public.households
for update to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
)
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy households_delete on public.households
for delete to authenticated
using (public.current_role() = 'admin');

create policy profiles_read on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or public.current_role() = 'admin'
  or (
    public.current_role() = 'sector-officer'
    and sector_id = public.current_sector_id()
  )
);

create policy profiles_update on public.profiles
for update to authenticated
using (id = auth.uid() or public.current_role() = 'admin')
with check (id = auth.uid() or public.current_role() = 'admin');

create policy members_read on public.members
for select to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
  or account_id = auth.uid()
  or (public.current_household_id() is not null and household_id = public.current_household_id())
);

create policy members_insert on public.members
for insert to authenticated
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy members_update on public.members
for update to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
  or account_id = auth.uid()
)
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
  or account_id = auth.uid()
);

create policy members_delete on public.members
for delete to authenticated
using (public.current_role() = 'admin');

create policy relations_read on public.member_relations
for select to authenticated
using (
  exists (
    select 1 from public.members
    where members.id = member_relations.member_id
      and (
        public.current_role() = 'admin'
        or (public.current_role() = 'sector-officer' and members.sector_id = public.current_sector_id())
        or members.account_id = auth.uid()
        or (
          public.current_household_id() is not null
          and members.household_id = public.current_household_id()
        )
      )
  )
);

create policy relations_write on public.member_relations
for all to authenticated
using (
  public.current_role() in ('admin', 'sector-officer')
  and exists (
    select 1 from public.members
    where members.id = member_relations.member_id
      and (
        public.current_role() = 'admin'
        or members.sector_id = public.current_sector_id()
      )
  )
)
with check (
  public.current_role() in ('admin', 'sector-officer')
  and exists (
    select 1 from public.members
    where members.id = member_relations.member_id
      and (
        public.current_role() = 'admin'
        or members.sector_id = public.current_sector_id()
      )
  )
);

create policy photos_read on public.member_photos
for select to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
  or exists (
    select 1 from public.members
    where members.id = member_photos.member_id and members.account_id = auth.uid()
  )
);

create policy photos_write on public.member_photos
for insert to authenticated
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy advanced_read on public.advanced_member_data
for select to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy advanced_write on public.advanced_member_data
for insert to authenticated
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy advanced_update on public.advanced_member_data
for update to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
)
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy catalogs_read on public.activity_types
for select to authenticated
using (auth.uid() is not null);

create policy catalogs_write on public.activity_types
for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy income_read on public.income_sources
for select to authenticated
using (auth.uid() is not null);

create policy income_write on public.income_sources
for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy activities_read on public.activity_records
for select to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy activities_insert on public.activity_records
for insert to authenticated
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy activities_update on public.activity_records
for update to authenticated
using (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
)
with check (
  public.current_role() = 'admin'
  or (public.current_role() = 'sector-officer' and sector_id = public.current_sector_id())
);

create policy activities_delete on public.activity_records
for delete to authenticated
using (
  public.current_role() = 'admin'
  or (
    public.current_role() = 'sector-officer'
    and sector_id = public.current_sector_id()
    and recorded_by = auth.uid()
  )
);

create policy income_entries_access on public.activity_income_entries
for all to authenticated
using (
  exists (
    select 1 from public.activity_records
    where activity_records.id = activity_income_entries.record_id
      and (
        public.current_role() = 'admin'
        or (
          public.current_role() = 'sector-officer'
          and activity_records.sector_id = public.current_sector_id()
        )
      )
  )
)
with check (
  exists (
    select 1 from public.activity_records
    where activity_records.id = activity_income_entries.record_id
      and (
        public.current_role() = 'admin'
        or (
          public.current_role() = 'sector-officer'
          and activity_records.sector_id = public.current_sector_id()
        )
      )
  )
);

create policy income_lines_access on public.activity_income_lines
for all to authenticated
using (
  exists (
    select 1
    from public.activity_income_entries
    join public.activity_records on activity_records.id = activity_income_entries.record_id
    where activity_income_entries.id = activity_income_lines.entry_id
      and (
        public.current_role() = 'admin'
        or (
          public.current_role() = 'sector-officer'
          and activity_records.sector_id = public.current_sector_id()
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.activity_income_entries
    join public.activity_records on activity_records.id = activity_income_entries.record_id
    where activity_income_entries.id = activity_income_lines.entry_id
      and (
        public.current_role() = 'admin'
        or (
          public.current_role() = 'sector-officer'
          and activity_records.sector_id = public.current_sector_id()
        )
      )
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy member_photo_objects_read on storage.objects
for select to authenticated
using (
  bucket_id = 'member-photos'
  and (
    public.current_role() = 'admin'
    or (
      public.current_role() = 'sector-officer'
      and (storage.foldername(name))[1] = public.current_sector_id()::text
    )
    or exists (
      select 1 from public.members
      where members.account_id = auth.uid()
        and storage.objects.name in (members.profile_photo_path, members.selfie_photo_path)
    )
  )
);

create policy member_photo_objects_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'member-photos'
  and (
    public.current_role() = 'admin'
    or (
      public.current_role() = 'sector-officer'
      and (storage.foldername(name))[1] = public.current_sector_id()::text
    )
  )
);

-- Setelah pendaftaran akun pertama:
create or replace function public.admin_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where role = 'admin')
$$;

create or replace function public.claim_first_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Masuk terlebih dahulu.';
  end if;
  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'Admin sudah ada.';
  end if;
  update public.profiles
  set role = 'admin'
  where id = auth.uid();
end;
$$;

grant execute on function public.admin_exists() to authenticated;
grant execute on function public.claim_first_admin() to authenticated;

-- Akun pertama menjadi admin dari dalam aplikasi.
-- Jika fungsi di atas ditambahkan pada database yang sudah ada, jalankan
-- bagian admin_exists, claim_first_admin, dan protect_profile yang baru.
