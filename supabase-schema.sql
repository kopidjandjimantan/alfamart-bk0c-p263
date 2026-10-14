-- Jalankan di Supabase Dashboard > SQL Editor.
-- RLS aktif tanpa policy publik: hanya backend Vercel dengan service role yang dapat mengelola tabel ini.
create table if not exists public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('super_admin', 'admin')),
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id) on delete set null
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant all on table public.admin_users to service_role;

-- Bootstrap hanya sekali, setelah akun pertama dibuat lewat Authentication > Users.
-- Ganti email ini dengan email akun pertama yang akan menjadi Super Admin, lalu jalankan:
insert into public.admin_users (auth_user_id, email, role)
select id, lower(email), 'super_admin' from auth.users
where lower(email) = lower('ganti-email-superadmin@contoh.com')
on conflict (auth_user_id) do update set role = 'super_admin', email = excluded.email;
