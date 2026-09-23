const { isAuthenticated } = require('./_auth');
const episodes = require('./_episodes');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!isAuthenticated(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  res.status(200).json({ ok: true, episodes });
};
