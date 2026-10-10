/*
  Everything on the site lives in this one file. Edit the values below —
  no other file needs to change.

  Paths are relative to index.html, e.g. 'assets/music/song.mp3'.
  Anything left empty ('' or []) is handled gracefully: empty sections are
  hidden from the main menu, missing art gets a generated placeholder, and
  tracks without a file say "Coming soon".

  The entries marked TODO are demo placeholders so the site has something to
  show before real content goes in. Replace or delete them.
*/
window.SITE = {
  artist: 'Augu',
  description: 'Augu — official site.',

  // First-person photos (a lap, a desk, a train seat...). One is dealt per
  // visit from a shuffled bag, so every photo shows before any repeats.
  //   src   the image
  //   hand  slides the resting iPod sideways so it lands in the lap, as a
  //         fraction of the photo's rendered width (+ is right). Tune by eye.
  //   bg    the photo's mid-tone, shown while it loads
  // Leave empty for a plain gradient backdrop.
  backdrops: [
    // { src: 'assets/backdrops/bench.webp', hand: 0.04, bg: '#706e71' },
  ],

  albums: [
    {
      title: 'Album Title',               // TODO
      year: '2026',
      cover: '',                           // e.g. 'assets/covers/album.webp'
      tracks: [
        { title: 'Track One', file: '' },  // e.g. 'assets/music/track-one.mp3'
        { title: 'Track Two', file: '' },
        { title: 'Track Three', file: '' },
        { title: 'Track Four', file: '' },
        { title: 'Track Five', file: '' },
      ],
    },
    {
      title: 'Debut Album',                // TODO
      year: '2025',
      cover: '',
      tracks: [
        { title: 'Intro', file: '' },
        { title: 'Second Song', file: '' },
        { title: 'Third Song', file: '' },
      ],
    },
  ],

  // Cover Flow. `thumb` is shown in the flow (small, ~400px webp); `full`
  // loads only when a photo is opened. Either may be omitted.
  photos: [
    // From instagram.com/augu_2005, newest first
    { thumb: 'assets/photos/thumb/ig-DeM3LsxS-eY.webp', full: 'assets/photos/ig-DeM3LsxS-eY.webp' },  // 2026-10-07 (reel cover)
    { thumb: 'assets/photos/thumb/ig-DeKnJh9y4Hc.webp', full: 'assets/photos/ig-DeKnJh9y4Hc.webp' },  // 2026-10-06
    { thumb: 'assets/photos/thumb/ig-DeFb-mgG0gt.webp', full: 'assets/photos/ig-DeFb-mgG0gt.webp' },  // 2026-10-04
    { thumb: 'assets/photos/thumb/ig-Ddu-7J5DRze.webp', full: 'assets/photos/ig-Ddu-7J5DRze.webp' },  // 2026-09-25
    { thumb: 'assets/photos/thumb/ig-Dc8xLtBFrgW.webp', full: 'assets/photos/ig-Dc8xLtBFrgW.webp' },  // 2026-09-06
    { thumb: 'assets/photos/thumb/ig-Dct9wkXyBKk.webp', full: 'assets/photos/ig-Dct9wkXyBKk.webp' },  // 2026-08-31 (reel cover)
    { thumb: 'assets/photos/thumb/ig-DcjJ6FgFmhM.webp', full: 'assets/photos/ig-DcjJ6FgFmhM.webp' },  // 2026-08-27
    { thumb: 'assets/photos/thumb/ig-Dbn4pTfliHg.webp', full: 'assets/photos/ig-Dbn4pTfliHg.webp' },  // 2026-08-04
    { thumb: 'assets/photos/thumb/ig-DbJUJ7HG_V5.webp', full: 'assets/photos/ig-DbJUJ7HG_V5.webp' },  // 2026-07-23
    { thumb: 'assets/photos/thumb/ig-DagCp2_mzqN.webp', full: 'assets/photos/ig-DagCp2_mzqN.webp' },  // 2026-07-07
    { thumb: 'assets/photos/thumb/ig-DaYCdKgSx7J.webp', full: 'assets/photos/ig-DaYCdKgSx7J.webp' },  // 2026-07-04 (reel cover)
  ],

  // Merch without Shopify: each product opens its own buy link.
  // (With Shopify configured below, the live catalog and cart replace this.)
  merch: [
    // TODO
    { title: 'Tour Tee', price: '$35', image: '', sizes: ['S', 'M', 'L', 'XL'], url: '', description: 'Heavyweight cotton tee.' },
    { title: 'Hoodie', price: '$70', image: '', sizes: ['M', 'L', 'XL'], url: '', description: 'Garment-dyed hoodie.' },
    { title: 'Vinyl', price: '$30', image: '', sizes: [], url: '', description: '12" LP.' },
  ],

  // Videos without the YouTube API — the id is the part after "v=" in a link
  videos: [
    // { title: 'Music Video', youtube: 'VIDEO_ID' },
  ],

  // Shows without Bandsintown. Dates as YYYY-MM-DD; past dates are hidden.
  shows: [
    // TODO
    { venue: "Baby's All Right", city: 'Brooklyn, NY', date: '2026-12-12', url: '' },
  ],

  // Newest first
  news: [
    // { source: 'Pitchfork', headline: 'Best New Track', preview: '"..."', url: 'https://...' },
  ],

  about: {
    photo: '',                             // e.g. 'assets/photos/about.webp'
    bio: [
      'Write a short bio here.',           // TODO
      'Add more paragraphs as separate strings.',
    ],
    credit: '',                            // e.g. 'website by ...'
  },

  contact: [
    // TODO
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'TikTok', url: 'https://tiktok.com/' },
    { label: 'YouTube', url: 'https://youtube.com/' },
    { label: 'Email', url: 'mailto:hello@example.com' },
    { label: 'Spotify', url: 'https://open.spotify.com/' },
    { label: 'Apple Music', url: 'https://music.apple.com/' },
  ],

  integrations: {
    // GA4 measurement ID, e.g. 'G-XXXXXXX'. Visitors in Europe get a consent
    // bar; localhost and ?internal=1 visits are tagged as internal traffic.
    googleAnalyticsId: '',

    // YouTube Data API v3: a browser key restricted to your domain, and the
    // channel ID (starts with "UC"). Playlists become submenus.
    youtube: {
      apiKey: '',
      channelId: '',
      hidePlaylists: [],                   // playlist titles to leave out
    },

    // Bandsintown: your app_id and the artist name as listed there
    bandsintown: {
      appId: '',
      artist: '',
    },

    // Shopify Storefront API: the store's myshopify domain and a public
    // Storefront access token. Products come from the collection below
    // (falls back to all products), and the cart checks out on Shopify.
    shopify: {
      domain: '',                          // e.g. 'augu-store.myshopify.com'
      storefrontToken: '',
      collection: 'frontpage',
      apiVersion: '2025-07',
    },
  },
};
