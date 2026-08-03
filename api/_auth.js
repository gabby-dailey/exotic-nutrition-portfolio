const crypto = require('crypto');

const ACCESS_CODE = process.env.ACCESS_CODE || 'amg-exotic-creative';
const SESSION_SECRET = process.env.SESSION_SECRET || 'en-ep3-fallback-secret-change-me';
const COOKIE_NAME = 'en_session';

function expectedToken() {
  return crypto.createHmac('sha256', SESSION_SECRET).update(ACCESS_CODE).digest('hex');
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

function isAuthenticated(req) {
  return getCookie(req, COOKIE_NAME) === expectedToken();
}

function setSessionCookie(res) {
  const token = expectedToken();
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax; Secure`
  );
}

function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

module.exports = {
  ACCESS_CODE,
  isAuthenticated,
  setSessionCookie,
  getJsonBody,
};
