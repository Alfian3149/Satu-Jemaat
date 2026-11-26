-- Jalankan di SQL Editor Supabase jika tabel members sudah ada.
-- Menambah email, tempat lahir, dan pemberkatan tanpa menghapus data lama.

alter table public.members
  add column if not exists email text,
  add column if not exists birth_place text,
  add column if not exists blessing_date date,
  add column if not exists blessing_place text;
