ALFAMART P263 BK 0 CIPTA MUDA — Supabase Admin Auth

Fitur
- Pengunjung publik dapat melihat halaman.
- Panel upload tampil hanya setelah sesi admin diverifikasi server.
- Login memakai email/password Supabase Auth.
- Hanya role super_admin dapat membuat atau menghapus akun admin dari menu ☰.
- Daftar admin dan role disimpan di tabel Supabase, bukan localStorage.
- Sesi menggunakan cookie HttpOnly, Secure, SameSite=Strict dan diverifikasi server.
- Admin biasa dapat menggunakan panel upload, tetapi tidak dapat mengelola akun admin.

KONFIGURASI WAJIB
1. Buat project di https://supabase.com/.
2. Di Supabase Dashboard > SQL Editor, jalankan seluruh isi file supabase-schema.sql.
3. Di Authentication > Users, buat akun untuk Super Admin pertama (email + password kuat).
4. Kembali ke SQL Editor. Ganti email contoh pada query bootstrap di supabase-schema.sql dengan email Super Admin tadi, hilangkan komentar -- pada query insert, lalu jalankan. Pastikan hasilnya satu baris pada public.admin_users dengan role super_admin.
5. Di Project Settings > API (atau API Keys), ambil Project URL, anon/publishable key, dan service_role/secret key.
6. Di Vercel > Project > Settings > Environment Variables, tambahkan untuk Production (dan Preview jika digunakan):
   SUPABASE_URL = URL project Supabase
   SUPABASE_ANON_KEY = anon/publishable key Supabase
   SUPABASE_SERVICE_ROLE_KEY = service_role/secret key Supabase (RAHASIA, hanya server)
   SESSION_SECRET = string acak rahasia minimal 32 karakter, misalnya hasil `openssl rand -base64 48`
7. Simpan dan Redeploy project Vercel.
8. Buka website, pilih ☰ > Login Admin, masuk dengan email/password akun Super Admin.
9. Setelah login, buka ☰ > Tambah User Admin. Masukkan email dan password kuat (minimal 12 karakter). Admin baru dapat login dari perangkat lain di website yang sama.

PENTING KEAMANAN
- Jangan pernah menaruh SUPABASE_SERVICE_ROLE_KEY di index.html, file frontend, atau repository publik.
- Aktifkan proteksi MFA pada akun Super Admin bila tersedia, gunakan password unik dan jangan bagikan kredensial.
- Akun admin baru dibuat di Supabase Auth dan dicatat ke public.admin_users dengan role admin.
- RLS aktif dan tidak ada policy untuk anon/authenticated; backend memakai service role. Jangan membuat policy publik pada tabel admin_users.
- Hapus atau nonaktifkan akun dari menu admin akan mencabut akun Auth tersebut. Akun Super Admin dilindungi dari penghapusan melalui menu.
- Jam dan jadwal salat Jakarta tetap memakai sumber data eksternal seperti versi sebelumnya.

STRUKTUR UTAMA
index.html              UI publik dan menu admin
api/login.js            Login Supabase Auth + membuat cookie sesi
api/session.js          Verifikasi sesi dan role terkini
api/logout.js           Menghapus cookie sesi
api/admins.js           Daftar, buat, dan hapus admin (Super Admin saja)
lib/admin-auth.js       Helper server untuk cookie, Supabase REST, dan role
supabase-schema.sql     Skema tabel dan langkah bootstrap Super Admin
