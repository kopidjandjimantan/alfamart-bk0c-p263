const crypto = require('crypto');
function decodeBase32(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(s || '').toUpperCase().replace(/=+$/,'').replace(/\s/g,'');
  let bits = '';
  for (const c of clean) { const n = alphabet.indexOf(c); if (n < 0) throw new Error('Secret TOTP tidak valid'); bits += n.toString(2).padStart(5,'0'); }
  const out = [];
  for (let i=0; i+8<=bits.length; i+=8) out.push(parseInt(bits.slice(i,i+8),2));
  return Buffer.from(out);
}
function verifyTotp(token, secret) {
  if (!/^\d{6}$/.test(String(token || ''))) return false;
  let key; try { key = decodeBase32(secret); } catch (_) { return false; }
  const step = Math.floor(Date.now()/30000);
  for (let drift=-1; drift<=1; drift++) {
    const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(step+drift));
    const h = crypto.createHmac('sha1', key).update(msg).digest();
    const offset = h[h.length-1] & 15;
    const num = (h.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    if (crypto.timingSafeEqual(Buffer.from(String(num).padStart(6,'0')), Buffer.from(String(token)))) return true;
  }
  return false;
}
function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET, TOTP_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET || !TOTP_SECRET)
    return res.status(500).json({ error: 'Login belum dikonfigurasi lengkap di Vercel Environment Variables.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Username atau password salah.' });
  if (!verifyTotp(body.otp, TOTP_SECRET)) return res.status(401).json({ error: 'Kode OTP salah atau kedaluwarsa.' });
  const token = sign({ username: ADMIN_USERNAME, exp: Date.now() + 8*60*60*1000 }, SESSION_SECRET);
  res.setHeader('Set-Cookie', `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${8*60*60}`);
  return res.status(200).json({ ok: true, username: ADMIN_USERNAME });
};
