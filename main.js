/* ============================================================
   Parity Direct Care — page glue
   - inlines the line-art SVGs so they tint with the palette
   - launches the game, reveals sections, fakes the signup
   ============================================================ */
(function () {

  /* ---------- illustrations: inline so currentColor tints them ---------- */
  const cache = {};
  function hydrate(ctx) {
    const nodes = (ctx || document).querySelectorAll('.ill[data-ill]:not([data-loaded])');
    nodes.forEach(node => {
      const name = node.getAttribute('data-ill');
      node.setAttribute('data-loaded', '1');
      if (!cache[name]) {
        cache[name] = fetch('assets/illustrations/' + name + '.svg')
          .then(r => (r.ok ? r.text() : ''))
          .catch(() => '');
      }
      cache[name].then(svg => { if (svg) node.innerHTML = svg; });
    });
  }
  window.PDCIllustrations = { hydrate };
  hydrate(document);

  /* ---------- launch the game ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-game]');
    if (trigger) { e.preventDefault(); if (window.PDCGame) window.PDCGame.open(); }
  });

  /* ---------- sticky nav shadow ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile floating join CTA: fade in once past the hero ---------- */
  const joinFab = document.getElementById('mobile-join-fab');
  const hero = document.querySelector('.hero');
  if (joinFab && hero) {
    const onFabScroll = () => {
      const past = window.scrollY > hero.offsetHeight * 0.6;
      joinFab.classList.toggle('is-visible', past);
    };
    onFabScroll();
    window.addEventListener('scroll', onFabScroll, { passive: true });
  }

  /* ---------- scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('in'));
  }

  /* ---------- signup (preview — not wired to a backend) ---------- */
  const form = document.getElementById('signup-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      if (!name.value.trim() || !email.value.trim()) {
        (name.value.trim() ? email : name).focus();
        return;
      }
      form.style.display = 'none';
      const ok = document.getElementById('signup-success');
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ block: 'nearest' }); }
    });
  }

})();
