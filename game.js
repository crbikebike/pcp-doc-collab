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
  // `recap` is echoed back in the result when they choose the DPC answer.
  // Option order + polarity are mixed on purpose.
  const QUESTIONS = [
    {
      id: 'wait', ill: 'reading-bench',
      text: 'Do you enjoy waiting weeks for an appointment — then meeting a doctor who’s never met you?',
      options: [
        { label: 'Ugh, no thanks', dpc: true, react: 'Same.' },
        { label: 'Love it — keeps life spicy', dpc: false, react: 'Bold.' },
      ],
      recap: 'you’re done waiting weeks to see a stranger',
    },
    {
      id: 'bills', ill: 'growth-chart',
      text: 'Be honest: do you love a surprise bill showing up three weeks after a quick visit?',
      options: [
        { label: 'Absolutely not', dpc: true, react: 'Noted.' },
        { label: 'I live for them 🧾', dpc: false, react: 'A thrill-seeker.' },
      ],
      recap: 'you’re over surprise bills',
    },
    {
      id: 'knows', ill: 'doctor',
      text: 'Would you actually like a doctor who knows your name, your history, and your life?',
      options: [
        { label: 'Wild idea, but yes', dpc: true, react: 'Great choice.' },
        { label: 'Nah, I like starting over each time', dpc: false, react: 'Living dangerously.' },
      ],
      recap: 'you want a doctor who truly knows you',
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

    // personalized recap from their DPC-favorable picks
    const phrases = QUESTIONS.filter((q, i) => answers[i] && answers[i].dpc).map(q => q.recap);
    const recap = phrases.length ? sentence(phrases) : '';

    const top = fit
      ? { eyebrow: 'The verdict', h: 'Sounds like we’re a fit. 🎉' }
      : { eyebrow: 'The verdict', h: 'Hmm — we might not match. Yet.' };

    const body = fit
      ? `
        ${recap ? `<p class="recap">${cap(recap)} — that’s exactly what Parity is built for.</p>` : `<p class="recap">You and Parity want the same thing: care that actually works for you.</p>`}
        <ul class="recap-list">
          <li><span class="w-ic">✓</span><span>A doctor who knows you — body and mind, under one roof</span></li>
          <li><span class="w-ic">✓</span><span>Same-day access, real conversations, no phone-tree runaround</span></li>
          <li><span class="w-ic">✓</span><span>One flat membership — and never a surprise bill</span></li>
        </ul>
        <div class="result-cta">
          <a href="#join" class="btn btn-primary btn-lg" data-join>Become a founding member <span class="arrow">→</span></a>
          <br><button class="restart" data-restart>Retake the quiz</button>
        </div>`
      : `
        <p class="recap">…but that’s probably just because you haven’t experienced direct care yet. Most people don’t know it’s an option until they feel it.</p>
        ${recap ? `<p class="recap-soft">For what it’s worth, ${recap}. That’s more “us” than you think.</p>` : ''}
        <div class="result-cta">
          <a href="#care" class="btn btn-primary btn-lg" data-learn>See what DPC actually feels like <span class="arrow">→</span></a>
          <br><button class="restart" data-restart>Retake the quiz</button>
        </div>`;

    paint(`
      <div class="result">
        <div class="result-card ${fit ? 'is-fit' : 'is-miss'}">
          <div class="rc-top">
            <span class="eyebrow">${top.eyebrow}</span>
            <h2>${top.h}</h2>
            <div class="score-pill">${score}/${QUESTIONS.length} DPC</div>
          </div>
          <div class="rc-body">${body}</div>
        </div>
      </div>`);

    const join = $('[data-join]', stage); if (join) join.addEventListener('click', close);
    const learn = $('[data-learn]', stage); if (learn) learn.addEventListener('click', close);
    $('[data-restart]', stage).addEventListener('click', renderIntro);
  }

  // join short phrases into a natural sentence: "a, b, and c"
  function sentence(arr) {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr[0] + ' and ' + arr[1];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

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
