/* ============================================================
   Parity Direct Care — "Is DPC right for you?"
   A quick, cheeky 5-question quiz. One question at a time,
   leading and lightly sarcastic — insurance is the punchline,
   never the patient. Ends on a personalized verdict:
   a fit flows to signup, a "miss" nudges you to learn more.
   ============================================================ */
(function () {
  const FIT_THRESHOLD = 2; // DPC-favorable answers (of 3) needed to "match"

  // Each question: two witty buttons. `dpc:true` = the DPC-favorable pick.
  // `affirm` is the result-screen line tying that specific pick back to DPC —
  // shown for whichever option they choose, not just the favorable one.
  // Option order + polarity are mixed on purpose.
  const QUESTIONS = [
    {
      id: 'knows', ill: 'doctor',
      text: 'Would you like a doctor who knows your name, your history, and your life?',
      options: [
        { label: 'Sounds Great!', dpc: true, react: 'Great choice.',
          affirm: "You want a doctor who knows your name, your history, your whole deal. That's just Tuesday at Parity." },
        { label: "No, I do not.", dpc: false, react: 'Living dangerously.',
          affirm: "No rush. When you're ready for a doctor who actually remembers you, we'll be right here." },
      ],
    },
    {
      id: 'wait', ill: 'reading-bench',
      text: 'Do you want access to your doctor in days rather than weeks?',
      options: [
        { label: 'Yes. Yes I do.', dpc: true, react: 'Same.',
          affirm: 'Same-day access, real conversations, and no waiting room full of month-old magazines.' },
        { label: 'No way!', dpc: false, react: 'Bold.',
          affirm: 'When long waits wear thin, same-day access will be here for you.' },
      ],
    },
    {
      id: 'bills', ill: 'growth-chart',
      text: 'How does getting rid of surprise bills after an office visit sound?',
      options: [
        { label: 'Sounds lovely!', dpc: true, react: 'Noted.',
          affirm: 'One flat membership, zero surprise invoices, and bills you can finally predict.' },
        { label: 'I enjoy mystery bills.', dpc: false, react: 'A thrill-seeker.',
          affirm: 'Fair enough. A flat, predictable membership is here the day surprise bills stop being fun.' },
      ],
    },
  ];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  let root, stage, step = 0, answers = [], lastFocus;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildShell() {
    root = document.getElementById('game');
    root.innerHTML = `
      <div class="game-bar">
        <div class="game-bar-inner">
          <span class="brand"><span class="mark">P</span> Is direct care right for you?</span>
          <span class="game-progress" aria-hidden="true">${QUESTIONS.map(() => '<i></i>').join('')}</span>
          <button class="game-close" aria-label="Close quiz">✕</button>
        </div>
      </div>
      <div class="game-inner"><div class="g-stage"></div></div>`;
    stage = $('.g-stage', root);
    $('.game-close', root).addEventListener('click', close);
  }

  function setProgress(n) {
    root.querySelectorAll('.game-progress i').forEach((d, i) => d.classList.toggle('on', i < n));
  }

  function paint(html) {
    stage.innerHTML = html;
    if (!reduced()) { stage.classList.remove('swap'); void stage.offsetWidth; stage.classList.add('swap'); }
    if (window.PDCIllustrations) window.PDCIllustrations.hydrate(stage);
    const inner = root.querySelector('.game-inner');
    if (inner) inner.scrollTop = 0;
  }

  /* ---------- intro ---------- */
  function renderIntro() {
    step = 0; answers = [];
    setProgress(0);
    paint(`
      <div class="quiz-intro">
        <span class="ill big" data-ill="momentum-rocket" aria-hidden="true"></span>
        <span class="eyebrow">Be honest with yourself</span>
        <h2>Three quick questions.<br>Let’s find out if we’re a match.</h2>
        <p>No wrong answers — well, maybe a few. Takes about twenty seconds.</p>
        <button class="btn btn-primary btn-lg" data-start>Let’s go <span class="arrow">→</span></button>
      </div>`);
    $('[data-start]', stage).addEventListener('click', () => renderQuestion(0));
  }

  /* ---------- one question ---------- */
  function renderQuestion(i) {
    step = i;
    setProgress(i);
    const q = QUESTIONS[i];
    paint(`
      <div class="quiz-card" data-q="${q.id}">
        <div class="q-count">${i + 1} <span>/ ${QUESTIONS.length}</span></div>
        <span class="ill big" data-ill="${q.ill}" aria-hidden="true"></span>
        <h2 class="q-text">${q.text}</h2>
        <div class="answers">
          ${q.options.map((o, oi) => `<button class="answer ${o.dpc ? 'answer-primary' : 'answer-secondary'}" data-opt="${oi}">${o.label}</button>`).join('')}
        </div>
        <div class="q-foot">
          ${i > 0 ? '<button class="q-back" data-back>← back</button>' : '<span></span>'}
          <span class="react-chip" data-react></span>
        </div>
      </div>`);

    const card = $('.quiz-card', stage);
    card.querySelectorAll('.answer').forEach(btn => {
      btn.addEventListener('click', () => choose(i, +btn.getAttribute('data-opt'), btn));
    });
    const back = $('[data-back]', card);
    if (back) back.addEventListener('click', () => renderQuestion(i - 1));
  }

  function choose(i, oi, btn) {
    const q = QUESTIONS[i];
    answers[i] = q.options[oi];
    const card = btn.closest('.quiz-card');
    card.querySelectorAll('.answer').forEach(b => { b.disabled = true; b.classList.toggle('picked', b === btn); });
    const chip = $('[data-react]', card);
    if (chip) { chip.textContent = q.options[oi].react; chip.classList.add('show'); }

    const next = () => { if (i + 1 < QUESTIONS.length) renderQuestion(i + 1); else renderResult(); };
    if (reduced()) next(); else setTimeout(next, 640);
  }

  /* ---------- result ---------- */
  function renderResult() {
    setProgress(QUESTIONS.length);
    const chosen = answers.filter(Boolean);
    const score = chosen.filter(a => a.dpc).length;
    const fit = score >= FIT_THRESHOLD;

    const top = fit
      ? { ill: 'weightlifting', eyebrow: 'The verdict', h: 'Sounds like we’re a fit.' }
      : { ill: 'calm-armchair', eyebrow: 'The verdict', h: 'Hmm — we might not match. Yet.' };

    const rows = QUESTIONS.map((q, i) => `
        <li class="affirm-row ${answers[i].dpc ? 'is-match' : 'is-open'}">
          <span class="aff-ic ill" data-ill="${q.ill}" aria-hidden="true"></span>
          <div class="aff-copy"><p class="aff-line">${answers[i].affirm}</p></div>
          <span class="aff-mark" aria-hidden="true">${answers[i].dpc ? '✓' : '~'}</span>
        </li>`).join('');

    const cta = fit
      ? { href: '#join', attr: 'data-join', label: 'Become a founding member' }
      : { href: '#care', attr: 'data-learn', label: 'See what DPC actually feels like' };

    paint(`
      <div class="result">
        <div class="result-card ${fit ? 'is-fit' : 'is-miss'}">
          <div class="rc-top">
            <span class="ill big" data-ill="${top.ill}" aria-hidden="true"></span>
            <span class="eyebrow">${top.eyebrow}</span>
            <h2>${top.h}</h2>
          </div>
          <div class="rc-body">
            <ul class="affirm-list">${rows}</ul>
            <div class="result-cta">
              <a href="${cta.href}" class="btn btn-primary btn-lg" ${cta.attr}>${cta.label} <span class="arrow">→</span></a>
              <br><button class="restart" data-restart>Retake the quiz</button>
            </div>
          </div>
        </div>
      </div>`);

    const join = $('[data-join]', stage); if (join) join.addEventListener('click', close);
    const learn = $('[data-learn]', stage); if (learn) learn.addEventListener('click', close);
    $('[data-restart]', stage).addEventListener('click', renderIntro);
  }

  /* ---------- open / close ---------- */
  function open() {
    if (!root || !root.querySelector('.game-bar')) buildShell();
    renderIntro();
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    const start = root.querySelector('[data-start]');
    if (start) start.focus();
  }
  function close() {
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root && root.classList.contains('open')) close();
  });

  window.PDCGame = { open, close };
})();
