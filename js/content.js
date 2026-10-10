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
    // For now: Augu's Instagram photos (640px, so soft at full screen)
    { src: 'assets/photos/ig-DeKnJh9y4Hc.webp', ar: 0.750, hand: 0, bg: '#3d4b40' },
    { src: 'assets/photos/ig-DeFb-mgG0gt.webp', ar: 0.750, hand: 0, bg: '#4c4c37' },
    { src: 'assets/photos/ig-Ddu-7J5DRze.webp', ar: 1.000, hand: 0, bg: '#954a5c' },
    { src: 'assets/photos/ig-Dc8xLtBFrgW.webp', ar: 0.750, hand: 0, bg: '#774842' },
    { src: 'assets/photos/ig-DcjJ6FgFmhM.webp', ar: 0.752, hand: 0, bg: '#74635c' },
    { src: 'assets/photos/ig-Dbn4pTfliHg.webp', ar: 0.750, hand: 0, bg: '#877661' },
    { src: 'assets/photos/ig-DbJUJ7HG_V5.webp', ar: 1.753, hand: 0, bg: '#8c8a8c' },
    { src: 'assets/photos/ig-DagCp2_mzqN.webp', ar: 1.499, hand: 0, bg: '#4d4d53' },
  ],

  // From Apple Music (artist 1720582590). Tracks are Apple's official
  // 30-second previews, streamed from Apple; `link` opens the full song.
  // To use full songs, swap `file` for e.g. 'assets/music/maluv.mp3' and
  // drop `preview: true`.
  albums: [
    {
      title: 'In Blue.',
      year: '2024',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/01/cf/4f01cf86-6c38-d6bc-6518-323d596a84e8/artwork.jpg/600x600bb.jpg',
      link: 'https://music.apple.com/us/album/in-blue/1764701993',
      tracks: [
        { title: 'feel.', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9f/0b/27/9f0b27c7-ff6a-e852-e618-e04faeeac840/mzaf_6329814366344089453.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/feel/1764701993?i=1764701994' },
        { title: 'cruel.', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/ce/a2/14cea213-868d-17a7-575b-c7969305eae8/mzaf_3896403372188126929.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/cruel/1764701993?i=1764701995' },
        { title: 'BLUE', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a8/e0/ba/a8e0baeb-6407-d350-b818-3a4862ef91d0/mzaf_15520978721779375358.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/blue/1764701993?i=1764701996' },
        { title: 'SmrrNights', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d4/4c/06/d44c065d-d080-1b91-9eda-aaf5dd822eb0/mzaf_11396105729854474492.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/smrrnights/1764701993?i=1764701997' },
        { title: 'LONG4YAH', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/e4/eb/6ae4eb58-c3d4-7ba8-e1f0-c2571f094e46/mzaf_7178924615766466275.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/long4yah/1764701993?i=1764701998' },
        { title: 'rain', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ec/5c/87/ec5c8760-d5b4-fcfd-62ad-50dd0c8fdbcf/mzaf_1617437628582182573.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/rain/1764701993?i=1764701999' },
        { title: 'moss', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a5/36/ce/a536ce05-85c5-724d-c031-6e07960dbeee/mzaf_15748909786829995024.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/moss/1764701993?i=1764702000' },
      ],
    },
    {
      title: 'Singles',
      year: '2023–2026',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ff/6f/a6/ff6fa6b0-96fd-face-96d0-fc3380f29fec/artwork.jpg/600x600bb.jpg',
      link: 'https://music.apple.com/us/artist/augu/1720582590',
      tracks: [
        { title: 'FuckTheWorld (Demo)', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f5/9a/36/f59a36ec-d4d7-c55f-f66c-3460c551de66/mzaf_6479365299739703502.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/fucktheworld-demo/6816763031?i=6816763033', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ff/6f/a6/ff6fa6b0-96fd-face-96d0-fc3380f29fec/artwork.jpg/600x600bb.jpg' },
        { title: 'SawYaCarr/douluvme?', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/87/c7/1d/87c71d4b-d4c4-3335-6b4f-e6bd3bbb03f4/mzaf_7910272335217240499.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/sawyacarr-douluvme/6786703954?i=6786703955', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/75/cc/14/75cc143c-3ce1-626b-5fd2-0161932ac3fd/artwork.jpg/600x600bb.jpg' },
        { title: 'Broke Bike (feat. Kaleb Reyna)', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d9/87/f4/d987f4ea-73e3-16df-ddc7-a464619442fa/mzaf_16320165982304417420.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/broke-bike-feat-kaleb-reyna/6777515678?i=6777515679', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cb/26/0c/cb260ca4-ae50-a25b-5c78-5c9eb978cac1/artwork.jpg/600x600bb.jpg' },
        { title: 'Tears', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6c/ca/4d/6cca4d53-cf50-b86c-1f13-d19d05aed98c/mzaf_2539363919044779328.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/tears/1888072800?i=1888072801', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/23/63/6f/23636f52-174f-453c-9080-69f7a970ddab/artwork.jpg/600x600bb.jpg' },
        { title: 'MaLuv', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/90/0c/6a900ce5-da41-6f64-8a8a-4f9a54d27796/mzaf_17242907595601587970.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/maluv/1884831257?i=1884831258', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ce/50/3f/ce503f0f-165f-be25-ce64-b96b7aa46c5f/artwork.jpg/600x600bb.jpg' },
        { title: 'PIG', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bc/83/1a/bc831a49-449f-b455-834c-2eca4d562669/mzaf_8044197710188327245.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/pig/1826235504?i=1826235506', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/5c/2a/94/5c2a94e0-c09e-593c-1412-d2467159edb2/artwork.jpg/600x600bb.jpg' },
        { title: 'rain', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/77/77/6d/77776dfc-2f4f-79c4-10c2-16fdd5a6e76e/mzaf_13463822485974820110.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/rain/1764181243?i=1764181244', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/bd/4c/cf/bd4ccfcc-d565-9592-def2-38fc97ec19e5/artwork.jpg/600x600bb.jpg' },
        { title: '4Door', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/3c/55/e7/3c55e724-5da9-52f9-4d58-9b89b3f050a7/mzaf_1502756075921453881.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/4door/1720644628?i=1720644629', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9d/2f/22/9d2f22a7-77c7-11f1-f9a0-d382a0811761/artwork.jpg/600x600bb.jpg' },
      ],
    },
    {
      title: 'Features',
      year: '',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/39/79/d9/3979d9b9-1fd8-5f0e-bb0f-47998df4122c/artwork.jpg/600x600bb.jpg',
      tracks: [
        { title: 'GIVE IT AWAY (feat. Atgsupreme & Augu)', artist: 'Kaleb Reyna', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d0/a0/45/d0a04594-a106-8fa0-ada8-6cb599675cc6/mzaf_17502817914915763736.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/give-it-away-feat-atgsupreme-augu/1759747159?i=1759747160', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/39/79/d9/3979d9b9-1fd8-5f0e-bb0f-47998df4122c/artwork.jpg/600x600bb.jpg' },
        { title: 'empath (feat. Augu)', artist: 'grant parris & oku', file: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a5/d4/7c/a5d47c02-0e22-9c4e-6e5a-3b03edbd72c7/mzaf_14152914683382564839.plus.aac.p.m4a', preview: true, link: 'https://music.apple.com/us/album/empath-feat-augu/1888341693?i=1888341697', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c2/ea/5d/c2ea5d05-956b-d472-6abf-32359df9fa14/artwork.jpg/600x600bb.jpg' },
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
    { label: 'Apple Music', url: 'https://music.apple.com/us/artist/augu/1720582590' },
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
