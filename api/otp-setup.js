const QRCode = require('qrcode');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (process.env.OTP_SETUP_ENABLED !== 'true') return res.status(403).json({ error: 'Aktivasi OTP sedang ditutup. Aktifkan sementara OTP_SETUP_ENABLED=true di Vercel.' });
  const { ADMIN_USERNAME, ADMIN_PASSWORD, TOTP_SECRET } = process.env;
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !TOTP_SECRET) return res.status(500).json({ error: 'Environment Variables belum lengkap.' });
  if (!body || body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Username atau password salah.' });
  const label = encodeURIComponent(`Alfamart P263:${ADMIN_USERNAME}`);
  const uri = `otpauth://totp/${label}?secret=${encodeURIComponent(TOTP_SECRET)}&issuer=Alfamart%20P263&algorithm=SHA1&digits=6&period=30`;
  try {
    const qr = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 2, width: 280 });
    return res.status(200).json({ qr, message: 'Pindai QR ini di Google Authenticator. Setelah berhasil, nonaktifkan OTP_SETUP_ENABLED di Vercel.' });
  } catch (_) { return res.status(500).json({ error: 'QR tidak dapat dibuat.' }); }
};
