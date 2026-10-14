const { config, json, readBody, sb, setSession, handleError } = require('../lib/admin-auth');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const c = config();
    const { email, password } = readBody(req);
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) return json(res, 400, { error: 'Email dan password wajib diisi.' });
    let auth;
    try { auth = await sb('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: email.trim().toLowerCase(), password }, anon: true }); }
    catch { return json(res, 401, { error: 'Email atau password salah, atau akun belum terdaftar sebagai admin.' }); }
    const rows = await sb(`/rest/v1/admin_users?select=auth_user_id,email,role&auth_user_id=eq.${encodeURIComponent(auth.user.id)}&limit=1`);
    if (!Array.isArray(rows) || !rows.length) return json(res, 403, { error: 'Akun berhasil login, tetapi belum diberi hak akses admin.' });
    setSession(res, auth.user.id);
    return json(res, 200, { ok: true, email: rows[0].email, role: rows[0].role });
  } catch (e) { return handleError(res, e); }
};
