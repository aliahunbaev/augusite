/*
  Live data sources. Each one is optional: when its keys in content.js are
  blank, the matching loader resolves to the static lists in content.js
  instead, so the iPod never has to know where its data came from.

  Everything here returns plain objects in the shapes the iPod draws:
    videos   { title, youtube, thumb }
    playlist { title, id, thumb }
    show     { venue, city, date, url }
    product  { id, title, price, image, description, url, variants: [{ id, title, available }] }
*/
(function () {
  const C = window.SITE;
  const I = C.integrations || {};

  /* ---------------- Google Analytics ---------------- */

  // Hand-assembled rather than the stock snippet: Consent Mode v2 defaulted
  // by timezone (Europe starts denied and gets a small bar), page_view sent
  // once by hand because the iPod never changes the URL, and testing traffic
  // tagged internal so it can be filtered out of the real numbers.
  const analytics = { track() {} };
  (function () {
    const id = I.googleAnalyticsId;
    if (!id) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    let store = null;
    try { store = localStorage; } catch (e) {}
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    const needsConsent = /^Europe\//.test(tz);
    const choice = store && store.getItem('site-consent');

    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: choice || (needsConsent ? 'denied' : 'granted'),
    });
    gtag('js', new Date());

    if (/[?&]internal=1/.test(location.search) && store) store.setItem('site-internal', '1');
    const internal = (store && store.getItem('site-internal') === '1') || /^(localhost|127\.)/.test(location.hostname);
    if (internal) gtag('set', { traffic_type: 'internal' });

    gtag('config', id, { send_page_view: false });
    gtag('event', 'page_view', {
      backdrop: window.__siteBackdrop || '',
      entry_point: location.hash ? location.hash.slice(1) + '_link' : 'root',
    });

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);

    analytics.track = (name, params) => gtag('event', name, params || {});

    if (!needsConsent || choice) return;
    addEventListener('DOMContentLoaded', () => {
      const bar = document.createElement('div');
      bar.className = 'consent';
      bar.innerHTML = '<span>This site uses cookies for anonymous analytics.</span>';
      for (const [label, value] of [['Allow', 'granted'], ['Decline', 'denied']]) {
        const b = document.createElement('button');
        b.textContent = label;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (store) store.setItem('site-consent', value);
          gtag('consent', 'update', { analytics_storage: value });
          bar.remove();
        });
        bar.appendChild(b);
      }
      document.body.appendChild(bar);
    });
  })();

  /* ---------------- YouTube ---------------- */

  const yt = I.youtube || {};
  const ytOn = !!(yt.apiKey && yt.channelId);
  const ytGet = (path, params) => {
    const q = new URLSearchParams({ key: yt.apiKey, ...params });
    return fetch(`https://www.googleapis.com/youtube/v3/${path}?${q}`).then((r) => {
      if (!r.ok) throw new Error('YouTube ' + r.status);
      return r.json();
    });
  };
  const thumbOf = (sn) => {
    const t = sn && sn.thumbnails;
    return t ? (t.medium || t.high || t.default || {}).url || '' : '';
  };

  async function playlistItems(playlistId) {
    const out = [];
    let pageToken = '';
    do {
      const res = await ytGet('playlistItems', {
        part: 'snippet', playlistId, maxResults: 50, ...(pageToken ? { pageToken } : {}),
      });
      for (const it of res.items || []) {
        const sn = it.snippet;
        const vid = sn.resourceId && sn.resourceId.videoId;
        if (!vid || /^(Private|Deleted) video$/.test(sn.title)) continue;
        out.push({ title: sn.title, youtube: vid, thumb: thumbOf(sn) });
      }
      pageToken = res.nextPageToken || '';
    } while (pageToken && out.length < 200);
    return out;
  }

  let uploadsPromise = null;
  function allVideos() {
    if (!ytOn) {
      return Promise.resolve((C.videos || []).map((v) => ({
        ...v, thumb: v.thumb || (v.youtube ? `https://i.ytimg.com/vi/${v.youtube}/mqdefault.jpg` : ''),
      })));
    }
    uploadsPromise = uploadsPromise || ytGet('channels', { part: 'contentDetails', id: yt.channelId })
      .then((res) => {
        const id = res.items && res.items[0] && res.items[0].contentDetails.relatedPlaylists.uploads;
        return id ? playlistItems(id) : [];
      });
    return uploadsPromise;
  }

  function playlists() {
    if (!ytOn) return Promise.resolve([]);
    const hide = new Set((yt.hidePlaylists || []).map((t) => t.toLowerCase()));
    return ytGet('playlists', { part: 'snippet', channelId: yt.channelId, maxResults: 50 })
      .then((res) => (res.items || [])
        .filter((p) => !hide.has(p.snippet.title.toLowerCase()))
        .map((p) => ({ title: p.snippet.title, id: p.id, thumb: thumbOf(p.snippet) })));
  }

  /* ---------------- Shows ---------------- */

  const bit = I.bandsintown || {};
  const today = () => new Date().toISOString().slice(0, 10);

  function shows() {
    if (!(bit.appId && bit.artist)) {
      return Promise.resolve((C.shows || [])
        .filter((s) => !s.date || s.date >= today())
        .sort((a, b) => String(a.date).localeCompare(String(b.date))));
    }
    const url = `https://rest.bandsintown.com/artists/${encodeURIComponent(bit.artist)}/events?app_id=${encodeURIComponent(bit.appId)}`;
    return fetch(url).then((r) => r.json()).then((list) => (Array.isArray(list) ? list : []).map((e) => {
      const v = e.venue || {};
      const where = [v.city, v.region || v.country].filter(Boolean).join(', ');
      const ticket = (e.offers || []).find((o) => o.type === 'Tickets');
      return {
        venue: e.title || v.name || '',
        city: where,
        date: String(e.datetime || '').slice(0, 10),
        url: (ticket && ticket.url) || e.url || '',
      };
    }));
  }

  /* ---------------- Shopify ---------------- */

  const sh = I.shopify || {};
  const shopOn = !!(sh.domain && sh.storefrontToken);
  const CART_KEY = 'site-cart';

  function gql(query, variables) {
    return fetch(`https://${sh.domain}/api/${sh.apiVersion || '2025-07'}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': sh.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
    }).then((r) => r.json()).then((res) => {
      if (res.errors) throw new Error(res.errors.map((e) => e.message).join('; '));
      return res.data;
    });
  }

  const money = (m) => {
    if (!m) return '';
    const n = Number(m.amount);
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: m.currencyCode }).format(n);
    } catch (e) {
      return '$' + n.toFixed(2);
    }
  };

  const PRODUCT_FIELDS = `
    id title description
    featuredImage { url(transform: { maxWidth: 400 }) }
    priceRange { minVariantPrice { amount currencyCode } }
    variants(first: 30) { nodes { id title availableForSale } }`;

  function mapProduct(p) {
    return {
      id: p.id,
      title: p.title,
      price: money(p.priceRange.minVariantPrice),
      image: p.featuredImage ? p.featuredImage.url : '',
      description: p.description,
      variants: p.variants.nodes.map((v) => ({ id: v.id, title: v.title, available: v.availableForSale })),
    };
  }

  function products() {
    if (!shopOn) {
      return Promise.resolve((C.merch || []).map((m, i) => ({
        id: 'static-' + i,
        title: m.title,
        price: m.price || '',
        image: m.image || '',
        description: m.description || '',
        url: m.url || '',
        variants: (m.sizes || []).map((s) => ({ id: s, title: s, available: true })),
      })));
    }
    const byCollection = sh.collection
      ? gql(`query($h: String!) { collection(handle: $h) { products(first: 50) { nodes { ${PRODUCT_FIELDS} } } } }`, { h: sh.collection })
        .then((d) => (d.collection ? d.collection.products.nodes : null))
      : Promise.resolve(null);
    return byCollection.then((nodes) => nodes ||
      gql(`{ products(first: 50) { nodes { ${PRODUCT_FIELDS} } } }`).then((d) => d.products.nodes))
      .then((nodes) => nodes.map(mapProduct));
  }

  const CART_FIELDS = `
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) { nodes { id quantity
      merchandise { ... on ProductVariant { id title product { title } } } } }`;

  function mapCart(c) {
    if (!c) return null;
    return {
      id: c.id,
      checkoutUrl: c.checkoutUrl,
      count: c.totalQuantity,
      subtotal: money(c.cost.subtotalAmount),
      lines: c.lines.nodes.map((l) => ({
        id: l.id,
        quantity: l.quantity,
        title: l.merchandise.product.title,
        variant: l.merchandise.title === 'Default Title' ? '' : l.merchandise.title,
      })),
    };
  }

  const cartId = () => { try { return localStorage.getItem(CART_KEY); } catch (e) { return null; } };
  const saveCart = (c) => {
    try { c ? localStorage.setItem(CART_KEY, c.id) : localStorage.removeItem(CART_KEY); } catch (e) {}
    return c;
  };

  const cart = {
    enabled: shopOn,
    get() {
      const id = cartId();
      if (!shopOn || !id) return Promise.resolve(null);
      return gql(`query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id })
        .then((d) => (d.cart ? mapCart(d.cart) : saveCart(null)));
    },
    add(variantId) {
      const id = cartId();
      const line = [{ merchandiseId: variantId, quantity: 1 }];
      const req = id
        ? gql(`mutation($id: ID!, $l: [CartLineInput!]!) { cartLinesAdd(cartId: $id, lines: $l) { cart { ${CART_FIELDS} } } }`, { id, l: line })
          .then((d) => d.cartLinesAdd.cart)
        : gql(`mutation($l: [CartLineInput!]!) { cartCreate(input: { lines: $l }) { cart { ${CART_FIELDS} } } }`, { l: line })
          .then((d) => d.cartCreate.cart);
      return req.then((c) => {
        if (!c && id) { saveCart(null); return cart.add(variantId); } // expired cart
        analytics.track('add_to_cart', { item_id: variantId });
        return saveCart(mapCart(c));
      });
    },
    setQuantity(lineId, quantity) {
      return gql(`mutation($id: ID!, $l: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $id, lines: $l) { cart { ${CART_FIELDS} } } }`,
        { id: cartId(), l: [{ id: lineId, quantity }] }).then((d) => mapCart(d.cartLinesUpdate.cart));
    },
  };

  window.SiteData = { allVideos, playlists, playlistItems, shows, products, cart, analytics, youtubeLive: ytOn };
})();
