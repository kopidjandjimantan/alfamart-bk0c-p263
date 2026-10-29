const crypto = require('crypto');
function valid(token, secret) {
  if (!token || !secret) return null;
  const p = token.split('.'); if (p.length !== 2) return null;
  const expected = crypto.createHmac('sha256', secret).update(p[0]).digest('base64url');
  const a = Buffer.from(expected), b = Buffer.from(p[1]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const data = JSON.parse(Buffer.from(p[0], 'base64url').toString()); return data.exp > Date.now() ? data : null; } catch { return null; }
}
module.exports = (req, res) => {
  const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('admin_session='))?.slice('admin_session='.length);
  const session = valid(token, process.env.SESSION_SECRET);
  return res.status(200).json({ authenticated: !!session, username: session?.username || null });
};
