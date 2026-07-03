/* ============================================================
   Parity Direct Care — palette system
   Ports the 11 palettes from the original picker, exposes a
   live switcher that rewrites CSS variables on :root and
   persists the choice. Default = "Sage Clinic".
   ============================================================ */
(function () {
  const PALETTES = {
    warm: [
      { name: 'Hearth', tag: 'Plum-grey warmth',
        primary: '#565264', secondary: '#706677', accent: '#A6808C', surface: '#FBF8F6', bg: '#E7DFDA', cta: '#8A4F5E', ctaText: '#FFFFFF', text: '#322E36', muted: '#7C7480' },
      { name: 'Clay & Linen', tag: 'Earthy terracotta',
        primary: '#6B4A3A', secondary: '#9C7A66', accent: '#C9A892', surface: '#FBF6F0', bg: '#F0E6DB', cta: '#9C4626', ctaText: '#FFFFFF', text: '#382A20', muted: '#8C7464' },
      { name: 'Dusk Comfort', tag: 'Muted mauve & rose',
        primary: '#4E3D45', secondary: '#7D6670', accent: '#C2A0A6', surface: '#FBF7F6', bg: '#EFE4E2', cta: '#9E3F49', ctaText: '#FFFFFF', text: '#2E2429', muted: '#80707A' },
    ],
    cool: [
      { name: 'Sage Clinic', tag: 'Olive & soft mauve',
        primary: '#45503B', secondary: '#747572', accent: '#B098A4', surface: '#FFFFFF', bg: '#E5EBEA', cta: '#2F6F62', ctaText: '#FFFFFF', text: '#2A2E26', muted: '#76796F' },
      { name: 'Still Water', tag: 'Teal-slate & aqua',
        primary: '#2C4A52', secondary: '#5E7B82', accent: '#9DB4B8', surface: '#FFFFFF', bg: '#E9F0F1', cta: '#2E6F7C', ctaText: '#FFFFFF', text: '#1E2E33', muted: '#6B8087' },
      { name: 'Morning Sage', tag: 'Forest & terracotta',
        primary: '#3D5043', secondary: '#6E8071', accent: '#A8B9A4', surface: '#FFFFFF', bg: '#EAEFE9', cta: '#A84E2A', ctaText: '#FFFFFF', text: '#232A24', muted: '#74806F' },
      { name: 'Harbor Blue', tag: 'Deep navy & slate',
        primary: '#22405C', secondary: '#4F6E8A', accent: '#9DB5CC', surface: '#FFFFFF', bg: '#E7EEF4', cta: '#1F6E8C', ctaText: '#FFFFFF', text: '#1A2B3A', muted: '#647C92' },
      { name: 'Harbor Blue · Coral', tag: 'Navy with coral CTA',
        primary: '#22405C', secondary: '#4F6E8A', accent: '#9DB5CC', surface: '#FFFFFF', bg: '#E7EEF4', cta: '#C24A3A', ctaText: '#FFFFFF', text: '#1A2B3A', muted: '#647C92' },
      { name: 'Heather', tag: 'Plum & lavender-grey',
        primary: '#473A52', secondary: '#6E5F7A', accent: '#B3A2C2', surface: '#FFFFFF', bg: '#ECE8F0', cta: '#6A4E8C', ctaText: '#FFFFFF', text: '#272030', muted: '#7C7088' },
      { name: 'Driftwood', tag: 'Cool taupe & sand',
        primary: '#4A4036', secondary: '#7A6E60', accent: '#C2B2A0', surface: '#FFFFFF', bg: '#ECE7E0', cta: '#3F6E63', ctaText: '#FFFFFF', text: '#2B241D', muted: '#80776A' },
      { name: 'Driftwood · Sandstone', tag: 'Taupe with sandstone CTA',
        primary: '#4A4036', secondary: '#7A6E60', accent: '#C2B2A0', surface: '#FFFFFF', bg: '#ECE7E0', cta: '#9A5A33', ctaText: '#FFFFFF', text: '#2B241D', muted: '#80776A' },
    ],
  };

  const ALL = [...PALETTES.warm, ...PALETTES.cool];
  const DEFAULT = 'Sage Clinic';
  const STORE_KEY = 'pdc-palette';
  const ROLES = ['primary', 'secondary', 'accent', 'surface', 'bg', 'cta', 'ctaText', 'text', 'muted'];
  const VAR = { ctaText: '--cta-text' }; // camelCase → CSS var override

  function apply(p) {
    const root = document.documentElement;
    ROLES.forEach(r => root.style.setProperty(VAR[r] || ('--' + r), p[r]));
    root.style.setProperty('color-scheme', 'light');
  }

  function find(name) { return ALL.find(p => p.name === name); }

  function setPalette(name, persist) {
    const p = find(name) || find(DEFAULT);
    apply(p);
    if (persist) { try { localStorage.setItem(STORE_KEY, p.name); } catch (e) {} }
    document.querySelectorAll('[data-pal]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-pal') === p.name);
    });
    const toggleChips = document.querySelector('.pal-toggle .chips');
    if (toggleChips) {
      toggleChips.innerHTML = ['primary', 'accent', 'cta'].map(r => `<i style="background:${p[r]}"></i>`).join('');
    }
    const nameEl = document.querySelector('.pal-toggle .cur');
    if (nameEl) nameEl.textContent = p.name;
    return p;
  }

  // Apply stored (or default) palette ASAP to avoid a flash.
  let stored = DEFAULT;
  try { stored = localStorage.getItem(STORE_KEY) || DEFAULT; } catch (e) {}
  if (!find(stored)) stored = DEFAULT;
  apply(find(stored));

  // Build the floating switcher once the DOM is ready.
  function buildSwitcher() {
    if (document.querySelector('.pal-switch')) return;
    const wrap = document.createElement('div');
    wrap.className = 'pal-switch';

    const group = (title, list) => `
      <h5>${title}</h5>
      ${list.map(p => `
        <button class="pal-opt" data-pal="${p.name}">
          <span class="sw">${['primary', 'secondary', 'accent', 'cta'].map(r => `<i style="background:${p[r]}"></i>`).join('')}</span>
          <span>
            <span class="pal-name">${p.name}</span><br>
            <span class="pal-tag">${p.tag}</span>
          </span>
        </button>`).join('')}`;

    wrap.innerHTML = `
      <button class="pal-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Change color palette">
        <span class="chips"></span>
        <span><span class="cur">${stored}</span></span>
      </button>
      <div class="pal-panel" role="menu" aria-label="Color palettes">
        <button class="pal-close" aria-label="Close palette menu">✕</button>
        ${group('Cool &amp; calming', PALETTES.cool)}
        ${group('Warm &amp; comforting', PALETTES.warm)}
      </div>`;
    document.body.appendChild(wrap);

    const toggle = wrap.querySelector('.pal-toggle');
    const panel = wrap.querySelector('.pal-panel');
    const openMenu = (open) => {
      panel.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => openMenu(!panel.classList.contains('open')));
    wrap.querySelector('.pal-close').addEventListener('click', () => openMenu(false));
    wrap.querySelectorAll('.pal-opt').forEach(btn => {
      btn.addEventListener('click', () => { setPalette(btn.getAttribute('data-pal'), true); openMenu(false); });
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) openMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openMenu(false); });

    setPalette(stored, false); // sync chips + active state
  }

  window.PDCPalettes = { PALETTES, ALL, setPalette, DEFAULT };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSwitcher);
  } else {
    buildSwitcher();
  }
})();
