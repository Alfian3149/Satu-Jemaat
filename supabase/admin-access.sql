-- Jalankan di SQL Editor Supabase jika skema utama sudah pernah dipasang.
-- Ini menghubungkan peran admin ke tabel public.profiles.

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
