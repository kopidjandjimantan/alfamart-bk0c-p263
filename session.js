const { json, currentAdmin, handleError } = require('../lib/admin-auth');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' });
  try { const admin = await currentAdmin(req); return json(res, 200, { authenticated: !!admin, email: admin?.email || null, role: admin?.role || null, canManageAdmins: admin?.role === 'super_admin' }); }
  catch (e) { return handleError(res, e); }
};
