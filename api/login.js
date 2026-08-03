const { ACCESS_CODE, setSessionCookie, getJsonBody } = require('./_auth');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  const { code } = getJsonBody(req);

  if (code !== ACCESS_CODE) {
    res.status(401).json({ ok: false, error: 'incorrect code' });
    return;
  }

  setSessionCookie(res);
  res.status(200).json({ ok: true });
};
