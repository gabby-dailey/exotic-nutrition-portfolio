const { isAuthenticated } = require('./_auth');

// Swap YOUTUBE_ID once the episode is uploaded to YouTube (unlisted), either by
// setting the YOUTUBE_ID environment variable in Vercel, or editing the fallback below.
const YOUTUBE_ID = process.env.YOUTUBE_ID || 'w7FgiwGtRVU';

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!isAuthenticated(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  res.status(200).json({
    ok: true,
    video: {
      youtubeId: YOUTUBE_ID,
    },
    intro: {
      performance:
        'The Exotic Nutrition Podcast series has become one of the strongest performing creative formats we’ve run on Meta this year. Since March, the series has driven over $83,000 in tracked purchase revenue across three episodes. Ep 1 closed at a blended 31x ROAS. Ep 2 at 25x. Ep 3 at 21x. Cost per purchase has stayed under $8 throughout. For reference, Meta ecommerce benchmarks typically sit between 3x and 5x ROAS. This series has been running at four to five times that standard.',
      personal:
        'This episode is the one I’ve been most excited about. It’s longer than the previous two at 45 seconds because the story it tells needed the space. It’s about the wildlife rehabilitation side of Exotic Nutrition, the rehabbers, the rescued animals, and the products that actually make a difference. It’s funny and it’s real and it’s one of my favorites that we’ve made so far.',
      watch:
        'Sit back and watch our latest episode: Back to the Wild, a story of Exotic Nutrition’s Philanthropic Efforts.',
    },
  });
};
