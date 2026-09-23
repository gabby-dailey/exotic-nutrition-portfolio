const { isAuthenticated, getJsonBody } = require('./_auth');

const RECIPIENT = 'gabrielle@adventureppc.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const { type, message } = getJsonBody(req); // type: 'notes' | 'approved'

  const subject =
    type === 'approved'
      ? 'Exotic Nutrition: Episode 3 APPROVED'
      : 'Exotic Nutrition: Episode 3 feedback notes';

  const text =
    type === 'approved'
      ? 'The client approved Episode 3 ("Back to the Wild") on the review page.'
      : `The client left feedback on Episode 3 ("Back to the Wild"):\n\n${message || '(no message provided)'}`;

  const apiKey = process.env.RESEND_API_KEY;
  let emailSent = false;

  if (apiKey) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Exotic Nutrition Review <onboarding@resend.dev>',
          to: [RECIPIENT],
          subject,
          text,
        }),
      });
      emailSent = r.ok;
      if (!r.ok) {
        console.error('Resend error:', await r.text());
      }
    } catch (err) {
      console.error('Resend request failed:', err);
    }
  } else {
    console.warn('RESEND_API_KEY not set, email not sent, feedback logged only.');
    console.log(`[feedback] type=${type} message=${message || ''}`);
  }

  // The client always sees a confirmation regardless of email delivery status.
  res.status(200).json({ ok: true, emailSent });
};
