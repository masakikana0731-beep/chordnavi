// コードナビ service worker（オフライン用キャッシュ）
const V = 'chordnavi-047448ef78';
const CORE = ["./", "help/h_adl.webp", "help/h_cand.webp", "help/h_dock.webp", "help/h_guide.webp", "help/h_input.webp", "help/h_lib.webp", "help/h_main.webp", "help/h_rec.webp", "help/h_review.webp", "help/h_scale.webp", "help/h_set.webp", "help/h_song.webp", "help/h_stage.webp", "help/h_voicing.webp", "help/h_wall.webp", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "manifest.webmanifest", "sounds/bass-ac.json", "sounds/bass-el.json", "sounds/gtr-clean.json", "sounds/gtr-jazz.json", "sounds/gtr-nylon.json", "sounds/gtr-steel.json", "sounds/vibes.json", "vendor/lame.min.js", "vendor/mp4-muxer.js", "vendor/rec-worklet.js", "vendor/webm-muxer.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('chordnavi-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ca => ca.put('./', c)); } return res; }).catch(() => caches.match('./', {ignoreSearch:true})));
    return;
  }
  if (u.origin === location.origin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); } return res; })));
  }
});
