-- Jalankan di SQL Editor Supabase jika tabel members sudah ada.
-- Menambah tanggal terdaftar dan asal gereja tanpa menghapus data lama.

alter table public.members
  add column if not exists registered_since date,
  add column if not exists previous_church text;
