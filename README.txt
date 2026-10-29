ALFAMART P263 — LOGIN PASSWORD + GOOGLE AUTHENTICATOR (TOTP)

Perubahan:
- Menambahkan kolom OTP 6 digit pada login utama.
- Verifikasi username, password, dan OTP dilakukan di server Vercel.
- QR setup Google Authenticator tersedia di /setup-otp.html.
- Riwayat perangkat pada versi ini masih tersimpan di browser/perangkat masing-masing, bukan database pusat.
- Jangan masukkan file database berisi data sensitif ke repository publik.

PENTING: Sebelum deploy, ganti kredensial admin di Vercel Environment Variables. Jangan menyimpan password/secret di index.html atau GitHub.

LANGKAH GITHUB + VERCEL
1. Upload isi folder ini ke root repository GitHub (termasuk folder api dan package.json).
2. Vercel > Project > Settings > Environment Variables, buat:
   ADMIN_USERNAME = username admin yang kamu pilih
   ADMIN_PASSWORD = password kuat yang kamu pilih (minimal 16 karakter disarankan)
   SESSION_SECRET = rahasia acak panjang minimal 32 karakter
   TOTP_SECRET = secret TOTP Base32 acak, hanya huruf A-Z dan angka 2-7, minimal 32 karakter
   OTP_SETUP_ENABLED = true (sementara untuk aktivasi pertama saja)
3. Save lalu Deployments > Redeploy deployment terbaru.
4. Buka https://DOMAIN-WEBSITE-KAMU/setup-otp.html di browser.
5. Masukkan ADMIN_USERNAME dan ADMIN_PASSWORD, lalu tampilkan QR.
6. Di HP buka Google Authenticator > tombol + > Pindai kode QR, lalu pindai QR dari halaman setup. Jika website dibuka di HP yang sama, buka halaman setup di komputer atau gunakan opsi memasukkan setup key jika disediakan oleh aplikasi; jangan kirim QR ke orang lain.
7. Setelah berhasil menambahkan akun ke Authenticator, kembali ke Vercel Environment Variables, ubah OTP_SETUP_ENABLED menjadi false (atau hapus variabel tersebut), lalu redeploy. Ini penting agar QR setup tidak dapat diminta lagi.
8. Buka halaman utama dan login menggunakan username, password, dan kode 6 digit di Authenticator.

MEMBUAT TOTP_SECRET
- Buat secret Base32 acak yang hanya kamu simpan. Jangan gunakan contoh dari internet dan jangan memasukkan secret ke GitHub.
- Jika tidak punya pembuat secret aman, buat string acak Base32 panjang (huruf A-Z dan angka 2-7) menggunakan generator rahasia tepercaya di perangkat sendiri. Jangan gunakan password akun lain.
- Jangan membagikan TOTP_SECRET, QR setup, atau kode OTP kepada siapa pun.

CATATAN TEKNIS
- Dependensi QR Code akan dipasang otomatis oleh Vercel melalui package.json.
- TOTP mengikuti standar 6 digit, periode 30 detik, SHA-1, dengan toleransi waktu satu langkah.
- Jika TOTP_SECRET diubah setelah aktivasi, akun di Authenticator harus disetel ulang dengan QR baru.
- Website ini tetap perlu diuji setelah deploy. Login tidak akan berfungsi sampai seluruh Environment Variables di atas diisi benar.
