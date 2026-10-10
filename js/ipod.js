(function () {
  const C = window.SITE;
  const D = window.SiteData;
  const $ = (id) => document.getElementById(id);

  const ipod = $('ipod');
  const body = $('screenBody');
  const hdrTitle = $('hdrTitle');
  const hdrPlay = $('hdrPlay');
  const wheel = $('wheel');
  const hint = $('hint');

  // The device within the hand photo (assets/hand.webp, 1024 x 1536), in
  // photo pixels: its centre, its size along its own axes, and how far it
  // leans. Raising the iPod turns it upright by TILT about that centre.
  const DEV = { cx: 458, cy: 408, w: 221, h: 364 };
  const TILT = 11.8;
  const isTouch = matchMedia('(hover: none) and (pointer: coarse), (max-width: 600px)').matches;


  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Backdrop geometry ---------------- */

  // The picker in <head> chose this visit's photo. Its `hand` offset is a
  // fraction of the photo's *rendered* width: with background-size: cover
  // that is the viewport width on a wide window, but ar × height on a narrow
  // one, where the photo runs off both sides. Measure the real aspect once
  // the image arrives so the iPod stays in the lap at any window shape.
  const pick = window.__siteBackdropPick || null;
  let photoAspect = 0;
  if (pick) {
    const img = new Image();
    img.onload = () => { photoAspect = img.naturalWidth / img.naturalHeight; };
    img.src = pick.src;
  }
  const handShift = () => {
    if (!pick || !pick.hand) return 0;
    const ar = photoAspect || pick.ar || innerWidth / innerHeight;
    return Math.max(innerWidth, ar * innerHeight) * pick.hand;
  };

  /* ---------------- Placeholder art ---------------- */

  function placeholder(seed, label) {
    let h = 0;
    for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) % 7919;
    h = (h * 137) % 360; // spread neighbouring seeds across the wheel
    const initials = String(label || '').split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
    return `<div class="ph" style="background:linear-gradient(135deg,hsl(${h},55%,58%),hsl(${(h + 50) % 360},60%,30%))">${esc(initials)}</div>`;
  }
  const art = (src, seed, label) =>
    src ? `<img src="${esc(src)}" alt="" draggable="false">` : placeholder(seed, label);

  const CART_ART = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f4f4f6"/>' +
    '<path d="M22 28h9l8 34h32l7-24H35" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="44" cy="72" r="5" fill="#222"/><circle cx="66" cy="72" r="5" fill="#222"/></svg>');

  /* ---------------- Click sound ---------------- */

  let actx = null;
  function tick() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square';
      o.frequency.value = 2400;
      g.gain.setValueAtTime(0.025, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.012);
      o.connect(g).connect(actx.destination);
      o.start();
      o.stop(actx.currentTime + 0.015);
    } catch (e) {}
  }

  /* ---------------- Audio player ---------------- */

  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.6;
  const player = { album: null, index: -1, error: '' };

  function playTrack(album, index) {
    player.album = album;
    player.index = index;
    player.error = '';
    const track = album.tracks[index];
    if (track.file) {
      audio.src = track.file;
      audio.play().catch(() => {});
      D.analytics.track('play_track', { album: album.title, track: track.title });
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      player.error = 'Coming soon';
    }
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title, artist: track.artist || C.artist, album: album.title,
        artwork: (track.cover || album.cover) ? [{ src: track.cover || album.cover }] : [],
      });
    }
    updatePlayIcon();
    if (current() && current().kind === 'nowplaying') current().refresh();
  }
  function togglePlay() {
    if (!player.album || !audio.getAttribute('src')) return;
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }
  function skip(d) {
    if (!player.album) return;
    if (d < 0 && audio.currentTime > 3) { audio.currentTime = 0; return; }
    const next = player.index + d;
    if (next < 0 || next >= player.album.tracks.length) return;
    playTrack(player.album, next);
  }
  function updatePlayIcon() {
    hdrPlay.innerHTML = !player.album || !audio.getAttribute('src') ? '' : audio.paused
      ? '<svg width="8" height="8" viewBox="0 0 8 8"><rect width="3" height="8"/><rect x="5" width="3" height="8"/></svg>'
      : '<svg width="8" height="8" viewBox="0 0 8 8"><polygon points="0,0 8,4 0,8"/></svg>';
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('nexttrack', () => skip(1));
      navigator.mediaSession.setActionHandler('previoustrack', () => skip(-1));
    } catch (e) {}
  }
  audio.addEventListener('play', updatePlayIcon);
  audio.addEventListener('pause', updatePlayIcon);
  audio.addEventListener('ended', () => {
    if (player.index + 1 < player.album.tracks.length) skip(1);
  });
  audio.addEventListener('error', () => {
    if (!audio.getAttribute('src')) return;
    player.error = "Couldn't load this track";
    if (current().kind === 'nowplaying') current().refresh();
  });
  audio.addEventListener('timeupdate', () => {
    if (current().kind === 'nowplaying') current().progress();
  });

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    s = Math.max(0, Math.floor(s));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Putting the iPod down stops whatever is playing
  function stopPlayback() {
    audio.pause();
    if (current().kind === 'video') back(true);
  }

  /* ---------------- List screens ---------------- */

  // items: { label, sub?, chev?, thumb?, run() }
  // opts.artwork: show the selected row's thumbnail in a right-hand panel
  function listScreen(title, items, emptyText, opts) {
    opts = opts || {};
    return {
      title, kind: 'list', items, sel: 0,
      render(el) {
        this.el = el;
        if (this.loading) { el.innerHTML = '<div class="empty"><span class="spinner"></span>Loading…</div>'; return; }
        if (!this.items.length) {
          el.innerHTML = `<div class="empty">${esc(this.error || emptyText || 'Nothing here yet')}</div>`;
          return;
        }
        this.sel = Math.min(this.sel, this.items.length - 1);
        el.innerHTML = `<div class="split${opts.artwork ? ' has-art' : ''}">
          <div class="list">${this.items.map((it, i) => `
            <div class="row${it.sub ? ' two' : ''}" data-i="${i}">
              <span class="lbl"><span class="t">${esc(it.label)}</span>${it.sub ? `<span class="s">${esc(it.sub)}</span>` : ''}</span>
              ${it.chev ? '<span class="chev">›</span>' : ''}
            </div>`).join('')}</div>
          ${opts.artwork ? '<div class="art-panel"></div>' : ''}
        </div>`;
        el.querySelectorAll('.row').forEach((r) => r.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sel = +r.dataset.i;
          this.highlight();
          this.select();
        }));
        this.highlight();
      },
      highlight() {
        if (!this.el) return;
        const rows = this.el.querySelectorAll('.row');
        if (!rows.length) return;
        rows.forEach((r, i) => r.classList.toggle('sel', i === this.sel));
        const list = this.el.querySelector('.list');
        const r = rows[this.sel];
        if (r.offsetTop < list.scrollTop) list.scrollTop = r.offsetTop;
        else if (r.offsetTop + r.offsetHeight > list.scrollTop + list.clientHeight)
          list.scrollTop = r.offsetTop + r.offsetHeight - list.clientHeight;
        const panel = this.el.querySelector('.art-panel');
        if (panel) {
          const it = this.items[this.sel];
          panel.innerHTML = art(it.thumb, it.label, it.label);
        }
      },
      move(d) {
        if (!this.items.length) return;
        const s = Math.max(0, Math.min(this.items.length - 1, this.sel + d));
        if (s === this.sel) return;
        this.sel = s;
        this.highlight();
        tick();
      },
      select() { const it = this.items[this.sel]; if (it && it.run) it.run(); },
    };
  }

  // A list whose rows arrive from the network. Shows "Loading…", then
  // redraws itself in place if it is still the screen being looked at.
  function asyncList(title, load, emptyText, opts) {
    const s = listScreen(title, [], emptyText, opts);
    s.loading = true;
    load().then((items) => { s.items.push(...items); })
      .catch(() => { s.error = "Couldn't load — try again later"; })
      .finally(() => {
        s.loading = false;
        if (current() === s && s.el) s.render(s.el);
      });
    return s;
  }

  const openUrl = (url) => () => {
    if (!url) return;
    D.analytics.track('outbound', { url });
    if (url.startsWith('mailto:')) location.href = url;
    else window.open(url, '_blank', 'noopener');
  };

  /* ---------------- Cover Flow ---------------- */

  // items: { art (url or ''), title, sub, seed }
  // opts.onSelect(i) runs when the centre cover is chosen
  function coverFlow(title, items, opts) {
    const GAP = 64, SIDE = 26, SIZE = 92;
    return {
      title, kind: 'coverflow', items, sel: opts.start || 0,
      render(el) {
        this.el = el;
        if (this.loading) { el.innerHTML = '<div class="empty dark"><span class="spinner"></span>Loading…</div>'; return; }
        if (!this.items.length) { el.innerHTML = `<div class="empty dark">${esc(this.error || opts.empty || 'Nothing here yet')}</div>`; return; }
        this.sel = Math.min(this.sel, this.items.length - 1);
        el.innerHTML = `<div class="cf"><div class="cf-stage">${this.items.map((it, i) =>
          `<div class="cf-item" data-i="${i}" style="width:${SIZE}px;height:${SIZE}px">
             <div class="cf-face"></div><div class="cf-refl"></div>
           </div>`).join('')}</div>
          <div class="cf-cap"><span class="cf-t"></span><span class="cf-s"></span></div></div>`;
        this.nodes = [...el.querySelectorAll('.cf-item')];
        this.nodes.forEach((n) => n.addEventListener('click', (e) => {
          e.stopPropagation();
          const i = +n.dataset.i;
          if (i === this.sel) this.select();
          else { this.sel = i; this.layout(); tick(); }
        }));
        this.layout(true);
      },
      // Only covers near the centre get their image, so a 100-photo flow
      // fetches a handful of thumbnails rather than all of them.
      fill(i) {
        const n = this.nodes[i];
        if (n.dataset.filled) return;
        n.dataset.filled = '1';
        const it = this.items[i];
        const html = art(it.art, it.seed || it.title || i, it.label != null ? it.label : it.title);
        n.querySelector('.cf-face').innerHTML = html;
        n.querySelector('.cf-refl').innerHTML = html;
      },
      layout(instant) {
        this.nodes.forEach((n, i) => {
          const off = i - this.sel, a = Math.abs(off);
          let x = 0, z = 36, ry = 0;
          if (off) {
            x = Math.sign(off) * (GAP + (a - 1) * SIDE);
            z = -a * 10;
            ry = off > 0 ? -60 : 60;
          }
          if (a <= 7) this.fill(i);
          n.style.transition = instant ? 'none' : '';
          n.style.transform = `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
          n.style.zIndex = 100 - a;
          n.style.visibility = a > 6 ? 'hidden' : 'visible';
        });
        const it = this.items[this.sel];
        this.el.querySelector('.cf-t').textContent = it.title || '';
        this.el.querySelector('.cf-s').textContent = it.sub || '';
      },
      move(d) {
        const s = Math.max(0, Math.min(this.items.length - 1, this.sel + d));
        if (s === this.sel) return;
        this.sel = s;
        this.layout();
        tick();
      },
      select() { if (this.items.length) opts.onSelect(this.sel, this); },
    };
  }

  function asyncFlow(title, load, opts) {
    const s = coverFlow(title, [], opts);
    s.loading = true;
    load().then((items) => { s.items.push(...items); })
      .catch(() => { s.error = "Couldn't load — try again later"; })
      .finally(() => {
        s.loading = false;
        if (current() === s && s.el) s.render(s.el);
      });
    return s;
  }

  /* ---------------- Menus ---------------- */

  const hasVideos = () => D.youtubeLive || (C.videos || []).length;
  const hasMerch = () => D.cart.enabled || (C.merch || []).length;

  function mainMenu() {
    const all = [
      { label: 'Music', chev: true, run: () => push(musicMenu()) },
      { label: 'Photos', chev: true, show: () => (C.photos || []).length, run: () => push(photosScreen()) },
      { label: 'Videos', chev: true, show: hasVideos, run: () => push(videosMenu()) },
      { label: 'Merch', chev: true, show: hasMerch, run: () => push(merchScreen()) },
      { label: 'Shows', chev: true, run: () => push(showsMenu()) },
      { label: 'News', chev: true, show: () => (C.news || []).length, run: () => push(newsMenu()) },
      { label: 'About', chev: true, run: () => push(aboutScreen()) },
      { label: 'Contact', chev: true, run: () => push(contactMenu()) },
    ].filter((it) => !it.show || it.show());
    return listScreen(C.artist, all);
  }

  function musicMenu() {
    const albums = C.albums.map((a) => ({
      label: a.title,
      sub: [a.year, `${a.tracks.length} ${a.tracks.length === 1 ? 'song' : 'songs'}`].filter(Boolean).join(' · '),
      chev: true, thumb: a.cover, run: () => push(albumMenu(a)),
    }));
    const s = listScreen('Music', albums, 'No music yet', { artwork: true });
    // "Now Playing" leads the menu once something has been played
    const render = s.render.bind(s);
    s.render = (el) => {
      const t = player.album && player.album.tracks[player.index];
      const np = {
        label: 'Now Playing', chev: true,
        thumb: t ? t.cover || player.album.cover : '',
        run: () => push(nowPlayingScreen()),
      };
      s.items = player.album ? [np, ...albums] : albums.slice();
      render(el);
    };
    return s;
  }

  function albumMenu(album) {
    const rows = album.tracks.map((t, i) => ({
      label: t.title,
      sub: t.artist || '',
      run: () => { playTrack(album, i); push(nowPlayingScreen()); },
    }));
    // Previews are 30 seconds; the full songs live on the streaming services
    if (album.link) rows.push({ label: 'Full songs on Apple Music', chev: true, run: openUrl(album.link) });
    return listScreen(album.title, rows);
  }

  function nowPlayingScreen() {
    return {
      title: 'Now Playing', kind: 'nowplaying', volUntil: 0,
      render(el) { this.el = el; this.refresh(); },
      refresh() {
        const a = player.album;
        if (!a) { this.el.innerHTML = '<div class="empty">Nothing playing</div>'; return; }
        const t = a.tracks[player.index];
        this.el.innerHTML = `<div class="np">
          <div class="np-top">
            <div class="np-art">${art(t.cover || a.cover, a.title, a.title)}</div>
            <div class="np-info">
              <div class="np-title">${esc(t.title)}</div>
              <div class="np-artist">${esc(t.artist || C.artist)}</div>
              <div class="np-album">${esc(a.title)}</div>
              <div class="np-count">${player.index + 1} of ${a.tracks.length}</div>
            </div>
          </div>
          <div class="np-bottom">
            ${player.error ? `<div class="np-note">${esc(player.error)}</div>`
              : t.preview ? '<div class="np-note preview">Preview · full song on Apple Music</div>' : ''}
            <div class="np-times"><span class="np-cur">0:00</span><span class="np-rem">-0:00</span></div>
            <div class="np-bar"><div class="np-fill"></div><div class="np-diamond"></div></div>
          </div>
        </div>`;
        this.progress();
      },
      progress() {
        if (!this.el || !player.album) return;
        const fill = this.el.querySelector('.np-fill');
        if (!fill) return;
        const dia = this.el.querySelector('.np-diamond');
        const cur = this.el.querySelector('.np-cur');
        const rem = this.el.querySelector('.np-rem');
        const vol = Date.now() < this.volUntil;
        this.el.querySelector('.np').classList.toggle('vol', vol);
        let pct;
        if (vol) {
          pct = audio.volume * 100;
          cur.textContent = 'Volume';
          rem.textContent = `${Math.round(pct)}%`;
        } else {
          const d = audio.duration;
          pct = d ? (audio.currentTime / d) * 100 : 0;
          cur.textContent = fmt(audio.currentTime);
          rem.textContent = '-' + fmt((d || 0) - audio.currentTime);
        }
        fill.style.width = pct + '%';
        dia.style.left = pct + '%';
      },
      // The wheel is the volume knob on this screen, like the real thing
      move(d) {
        audio.volume = Math.max(0, Math.min(1, audio.volume + d * 0.05));
        this.volUntil = Date.now() + 1500;
        this.progress();
        clearTimeout(this.volTimer);
        this.volTimer = setTimeout(() => this.progress(), 1550);
        tick();
      },
      select() { togglePlay(); },
    };
  }

  /* ---------------- Photos ---------------- */

  function photosScreen() {
    const items = C.photos.map((p, i) => ({
      art: p.thumb || p.full || '', title: '', sub: `${i + 1} of ${C.photos.length}`, seed: 'photo' + i, label: '',
    }));
    return coverFlow('Photos', items, {
      onSelect: (i, flow) => push(photoView(i, flow)),
    });
  }

  function photoView(index, flow) {
    return {
      title: '', kind: 'photo', i: index,
      render(el) {
        this.el = el;
        const p = C.photos[this.i];
        const src = p.full || p.thumb;
        el.innerHTML = `<div class="photo">${src ? `<img src="${esc(src)}" alt="" draggable="false">` : placeholder('photo' + this.i, '')}</div>`;
        hdrTitle.textContent = `${this.i + 1} of ${C.photos.length}`;
      },
      move(d) {
        const n = Math.max(0, Math.min(C.photos.length - 1, this.i + d));
        if (n === this.i) return;
        this.i = n;
        flow.sel = n;
        this.render(this.el);
        tick();
      },
      select() { back(); },
    };
  }

  /* ---------------- Videos ---------------- */

  function videosMenu() {
    if (!D.youtubeLive) return videoList('Videos', D.allVideos);
    return asyncList('Videos', () => D.playlists().then((pls) => [
      { label: 'All Videos', chev: true, run: () => push(videoList('All Videos', D.allVideos)) },
      ...pls.map((p) => ({
        label: p.title, chev: true, thumb: p.thumb,
        run: () => push(videoList(p.title, () => D.playlistItems(p.id))),
      })),
    ]), 'No videos yet', { artwork: true });
  }

  function videoList(title, load) {
    return asyncList(title, () => load().then((vids) => vids.map((v) => ({
      label: v.title, thumb: v.thumb, run: () => push(videoScreen(v)),
    }))), 'No videos yet', { artwork: true });
  }

  function videoScreen(v) {
    return {
      title: v.title, kind: 'video',
      render(el) {
        audio.pause();
        D.analytics.track('play_video', { video: v.title });
        el.innerHTML = v.youtube
          ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&playsinline=1&rel=0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
          : '<div class="empty">Video coming soon</div>';
      },
      move() {}, select() {},
    };
  }

  /* ---------------- Merch ---------------- */

  let cartCount = 0;
  function merchScreen() {
    const load = () => Promise.all([D.products(), D.cart.get().catch(() => null)]).then(([products, cart]) => {
      cartCount = cart ? cart.count : 0;
      const tiles = products.map((p) => ({
        art: p.image, title: p.title, sub: p.price, seed: p.title, product: p,
      }));
      if (D.cart.enabled) tiles.unshift({ art: CART_ART, title: 'Cart', sub: cartLabel(), cart: true });
      return tiles;
    });
    const flow = asyncFlow('Merch', load, {
      empty: 'Merch coming soon',
      start: D.cart.enabled ? 1 : 0,
      onSelect: (i) => {
        const it = flow.items[i];
        push(it.cart ? cartScreen() : productScreen(it.product));
      },
    });
    // Returning from the cart or a product may have changed the count
    const render = flow.render.bind(flow);
    flow.render = (el) => {
      const c = flow.items.find((it) => it.cart);
      if (c) c.sub = cartLabel();
      render(el);
    };
    return flow;
  }
  const cartLabel = () => (cartCount ? `${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Empty');

  function productScreen(p) {
    const s = listScreen(p.title, [], '');
    const variants = p.variants.filter((v) => v.title !== 'Default Title');
    const rows = [];
    if (D.cart.enabled) {
      const choices = variants.length ? variants : p.variants;
      for (const v of choices) {
        rows.push({
          label: v.available ? (variants.length ? `Add ${v.title}` : 'Add to Cart') : `${v.title === 'Default Title' ? '' : v.title + ' — '}Sold out`,
          run() {
            if (!v.available || this.busy) return;
            this.busy = true;
            const label = this.label;
            this.label = 'Adding…';
            s.render(s.el);
            D.cart.add(v.id).then((c) => {
              cartCount = c ? c.count : cartCount;
              this.label = 'Added ✓';
            }).catch(() => { this.label = "Couldn't add"; })
              .finally(() => {
                this.busy = false;
                s.render(s.el);
                setTimeout(() => { this.label = label; if (current() === s) s.render(s.el); }, 1400);
              });
          },
        });
      }
      rows.push({ label: 'View Cart', chev: true, run: () => push(cartScreen()) });
    } else {
      rows.push({ label: p.url ? 'Buy' : 'Coming soon', run: openUrl(p.url) });
    }
    s.items = rows;
    const render = s.render.bind(s);
    s.render = (el) => {
      render(el);
      const split = el.querySelector('.split');
      if (!split) return;
      const head = document.createElement('div');
      head.className = 'prod';
      head.innerHTML = `<div class="prod-art">${art(p.image, p.title, p.title)}</div>
        <div class="prod-info"><div class="prod-t">${esc(p.title)}</div><div class="prod-p">${esc(p.price)}</div>
        ${!D.cart.enabled && variants.length ? `<div class="prod-d">${esc(variants.map((v) => v.title).join(' · '))}</div>` : ''}
        ${p.description ? `<div class="prod-d">${esc(p.description)}</div>` : ''}</div>`;
      split.classList.add('stacked');
      split.prepend(head);
      s.highlight();
    };
    return s;
  }

  function cartScreen() {
    const s = asyncList('Cart', () => D.cart.get().then(build), 'Your cart is empty');
    function build(cart) {
      cartCount = cart ? cart.count : 0;
      if (!cart || !cart.lines.length) return [];
      return [
        { label: 'Checkout', sub: `Subtotal ${cart.subtotal}`, chev: true, run: openUrl(cart.checkoutUrl) },
        ...cart.lines.map((l) => ({
          label: `${l.title}${l.variant ? ' — ' + l.variant : ''}`,
          sub: `Qty ${l.quantity} · select to remove one`,
          run() {
            D.cart.setQuantity(l.id, l.quantity - 1).then((c) => {
              s.items = build(c);
              if (current() === s) s.render(s.el);
            });
          },
        })),
      ];
    }
    return s;
  }

  /* ---------------- Shows, News, Contact, About ---------------- */

  const showDate = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T12:00:00');
    return isNaN(dt) ? d : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  function showsMenu() {
    return asyncList('Shows', () => D.shows().then((list) => list.map((s) => ({
      label: s.venue || s.city,
      sub: [s.city, showDate(s.date)].filter(Boolean).join(' · '),
      run: openUrl(s.url),
    }))), 'No upcoming shows');
  }

  function newsMenu() {
    return listScreen('News', C.news.map((n) => ({
      label: n.headline, sub: n.source, run: openUrl(n.url),
    })));
  }

  function contactMenu() {
    return listScreen('Contact', (C.contact || []).map((c) => ({
      label: c.label, run: openUrl(c.url),
    })));
  }

  function aboutScreen() {
    const a = C.about || {};
    return {
      title: 'About', kind: 'about',
      render(el) {
        el.innerHTML = `<div class="about">
          ${a.photo ? `<img src="${esc(a.photo)}" alt="${esc(C.artist)}" draggable="false">` : ''}
          <h2>${esc(C.artist)}</h2>
          ${(a.bio || []).map((p) => `<p>${esc(p)}</p>`).join('')}
          ${a.credit ? `<p class="credit">${esc(a.credit)}</p>` : ''}
        </div>`;
        this.box = el.querySelector('.about');
      },
      move(d) { this.box.scrollTop += d * 26; },
      select() {},
    };
  }

  /* ---------------- Navigation stack ---------------- */

  const stack = [];
  const current = () => stack[stack.length - 1];

  function show(screen, dir) {
    const view = document.createElement('div');
    view.className = 'view' + (screen.kind === 'coverflow' || screen.kind === 'photo' || screen.kind === 'video' ? ' dark' : '') + (dir ? ` in-${dir}` : '');
    body.replaceChildren(view);
    hdrTitle.textContent = screen.title;
    screen.render(view);
  }
  function push(screen) {
    stack.push(screen);
    show(screen, 'fwd');
    D.analytics.track('ipod_screen', { screen: screen.title });
  }
  function back(silent) {
    if (stack.length < 2) return;
    stack.pop();
    show(current(), 'back');
    if (!silent) tick();
  }

  const actions = {
    menu: () => back(),
    play: togglePlay,
    next: () => skip(1),
    prev: () => skip(-1),
    select: () => { current().select(); tick(); },
  };

  /* ---------------- Click wheel ---------------- */

  const STEP = 18; // degrees of rotation per scroll step
  let drag = null;
  const angleAt = (e) => {
    const r = wheel.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  };

  wheel.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.center') || !zoomed) return;
    e.preventDefault();
    wheel.setPointerCapture(e.pointerId);
    const a = angleAt(e);
    drag = { last: a, acc: 0, total: 0, start: a };
  });
  wheel.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const a = angleAt(e);
    let d = a - drag.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    drag.last = a;
    drag.acc += d;
    drag.total += Math.abs(d);
    while (drag.acc >= STEP) { current().move(1); drag.acc -= STEP; }
    while (drag.acc <= -STEP) { current().move(-1); drag.acc += STEP; }
  });
  wheel.addEventListener('pointerup', () => {
    if (!drag) return;
    const { total, start: a } = drag;
    drag = null;
    if (total > 6) return;
    // A tap — which of the four buttons?
    if (a > -135 && a <= -45) actions.menu();
    else if (a > -45 && a <= 45) actions.next();
    else if (a > 45 && a <= 135) actions.play();
    else actions.prev();
  });
  wheel.addEventListener('pointercancel', () => { drag = null; });

  $('center').addEventListener('click', (e) => {
    e.stopPropagation();
    if (zoomed) actions.select();
  });
  wheel.addEventListener('click', (e) => e.stopPropagation());

  // Trackpad / mouse wheel scrolls too
  let wheelAcc = 0;
  addEventListener('wheel', (e) => {
    if (!zoomed) return;
    e.preventDefault();
    wheelAcc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    while (wheelAcc >= 40) { current().move(1); wheelAcc -= 40; }
    while (wheelAcc <= -40) { current().move(-1); wheelAcc += 40; }
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (!zoomed) {
      if (e.key === 'Enter' || e.key === ' ') { zoomIn(); e.preventDefault(); }
      return;
    }
    const k = e.key;
    const flow = current().kind === 'coverflow' || current().kind === 'photo';
    if (k === 'ArrowDown' || (flow && k === 'ArrowRight')) current().move(1);
    else if (k === 'ArrowUp' || (flow && k === 'ArrowLeft')) current().move(-1);
    else if (k === 'Enter' || k === 'ArrowRight') actions.select();
    else if (k === 'Escape' || k === 'Backspace' || k === 'ArrowLeft') {
      if (stack.length < 2 && k === 'Escape') zoomOut();
      else back();
    }
    else if (k === ' ') togglePlay();
    else return;
    e.preventDefault();
  });

  /* ---------------- Pick up / put down ---------------- */

  let zoomed = false;
  let animating = false;
  // p: how far the iPod has crept up (0 = barely peeking, 1 = resting in the lap)
  let p = 0, target = 0;
  const CREEP_MAX = 0.92; // the creep approaches rest; a click completes it

  // Fit the raised iPod to the window, never above life-ish size
  // Every pose is the same transform list, so CSS can interpolate between
  // them: put the device centre at (x, y), lean it, and scale the photo.
  const pose = (x, y, rot, scale) =>
    `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale}) translate(${-DEV.cx}px, ${-DEV.cy}px)`;

  // Raised: the device fills most of the window, upright
  // (fitted by the device's bounding box at its raised angle)
  function zoomScale() {
    const t = TILT * Math.PI / 180;
    const bw = DEV.w * Math.cos(t) + DEV.h * Math.sin(t);
    const bh = DEV.h * Math.cos(t) + DEV.w * Math.sin(t);
    return Math.min((innerHeight * 0.94) / bh, (innerWidth * 0.94) / bw, 3.2);
  }
  // Resting in the lap: the device about a third of the window tall, centred
  // on the backdrop's lap. q = 0 is barely peeking, 1 is fully up.
  const restScale = (q) => (innerHeight * 0.3 / DEV.h) * (0.92 + 0.1 * q);
  function restCentre(q) {
    return {
      x: innerWidth / 2 + handShift(),
      y: innerHeight * 0.72 + (1 - q) * innerHeight * 0.55,
    };
  }
  function restTransform(q) {
    const c = restCentre(q);
    return pose(c.x, c.y, 0, restScale(q));
  }
  function zoomTransform() {
    return pose(innerWidth / 2, innerHeight / 2, TILT, zoomScale());
  }

  function setHint(text, ms) {
    hint.textContent = text;
    hint.classList.add('show');
    clearTimeout(setHint.t);
    if (ms) setHint.t = setTimeout(() => hint.classList.remove('show'), ms);
  }

  function zoomIn() {
    if (zoomed || animating) return;
    animating = true;
    D.analytics.track('zoom_in', { seconds_on_page: Math.round(performance.now() / 1000) });
    document.body.classList.add('zoomed');
    ipod.style.transition = 'transform 1.4s cubic-bezier(.25,.7,.25,1)';
    ipod.style.transform = zoomTransform();
    hint.classList.remove('show');
    setTimeout(() => {
      zoomed = true;
      animating = false;
      if (!sessionStorageGet('hinted')) {
        setHint('drag around the wheel · click outside to put it down', 5000);
        sessionStorageSet('hinted', '1');
      }
    }, 1400);
  }
  function zoomOut() {
    if (!zoomed || isTouch) return;
    zoomed = false;
    animating = true;
    D.analytics.track('zoom_out');
    stopPlayback();
    document.body.classList.remove('zoomed');
    ipod.style.transition = 'transform 1.6s cubic-bezier(.4,0,.2,1)';
    p = target = 1;
    ipod.style.transform = restTransform(1);
    hint.classList.remove('show');
    setTimeout(() => { animating = false; }, 1600);
  }

  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  if (isTouch) {
    // Phones: no cursor to summon it with, so the iPod is already up
    zoomed = true;
    document.body.classList.add('zoomed');
    ipod.style.transform = zoomTransform();
    addEventListener('resize', () => { ipod.style.transform = zoomTransform(); });
  } else {
    ipod.style.transform = restTransform(0);
    addEventListener('mousemove', (e) => {
      if (zoomed || animating) return;
      // Over the device itself → fully summoned. (The photo's box is mostly
      // transparent arm and air, so test against the device, not the box.)
      const c = restCentre(p), s = restScale(p);
      if (Math.abs(e.clientX - c.x) < (DEV.w * s) / 2 + 24 && Math.abs(e.clientY - c.y) < (DEV.h * s) / 2 + 24) {
        target = 1;
        return;
      }
      // The magnet is the column the iPod rises in: only horizontal distance
      // counts, so moving down toward it never makes it retreat.
      const cx = innerWidth / 2 + handShift();
      const dx = Math.min(1, Math.abs(e.clientX - cx) / (innerWidth / 2));
      const t = Math.max(0, (dx - 0.15) / 0.85);
      target = (1 - t * t) * CREEP_MAX;
    });

    let last = null;
    (function frame(now) {
      const dt = last == null ? 0.016 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!zoomed && !animating) {
        p += (target - p) * (1 - Math.exp(-dt * 7));
        ipod.style.transition = 'none';
        ipod.style.transform = restTransform(p);
      }
      requestAnimationFrame(frame);
    })();

    document.addEventListener('click', (e) => {
      if (animating || e.target.closest('.consent')) return;
      if (!zoomed) { zoomIn(); return; }
      if (!e.target.closest('.screen, .wheel')) zoomOut();
    });

    addEventListener('resize', () => {
      if (zoomed) { ipod.style.transition = 'none'; ipod.style.transform = zoomTransform(); }
    });

    setTimeout(() => { if (!zoomed && !animating) setHint('click to pick it up'); }, 2200);
  }

  /* ---------------- Start ---------------- */

  push(mainMenu());
  stack.length = 1;
  updatePlayIcon();

  // Deep links: /#music, #merch, #shows... The iPod is raised and the
  // screen opened on its way up, so it arrives already showing it.
  function openDeepLink() {
    const hash = location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!hash) return;
    const main = stack[0];
    const i = main.items.findIndex((it) => it.label.toLowerCase() === hash);
    if (i < 0) return;
    stack.length = 1;
    zoomIn();
    main.sel = i;
    main.select();
  }
  openDeepLink();
  addEventListener('hashchange', openDeepLink);
})();
