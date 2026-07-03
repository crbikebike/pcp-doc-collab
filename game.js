/* ============================================================
   Parity Direct Care — "Is DPC right for you?"
   Two-Paths Scenario game. Pick a moment, watch the insurance
   maze and the Parity path unfold beat by beat, land on a
   personalized result that flows into signup.
   Villain = the insurance runaround. Never the patient.
   ============================================================ */
(function () {
  const COST_MAX = 340;   // $ scale for the cost meter
  const STRESS_MAX = 100; // % scale for the stress meter

  // Each scenario: picker card + two 5-beat paths + a result.
  // Insurance beats carry {cost, stress} increments that drive the meters.
  const SCENARIOS = [
    {
      id: 'urgent', ill: 'person-running',
      title: 'A cough that won’t quit', blurb: 'Three weeks in and it’s not getting better. You need to be seen.',
      insurance: {
        tagline: 'You + your insurance card, on your own.',
        beats: [
          { when: 'Day 1', icon: '📞', text: 'You call the clinic. “Next opening is in 9 days.” Press 1 to hold.', cost: 0, stress: 26 },
          { when: 'Day 1', icon: '⏳', text: 'You give up and drive to urgent care. A 90-minute wait in a full room.', cost: 0, stress: 20 },
          { when: 'Day 1', icon: '👤', text: 'Seven minutes with someone who’s never met you and won’t again.', cost: 45, stress: 14 },
          { when: 'Day 3', icon: '🔁', text: '“Might be your chest — go get an X-ray.” Another building, another wait.', cost: 35, stress: 20 },
          { when: 'Week 4', icon: '🧾', text: 'A bill arrives with a “facility fee” you never agreed to.', cost: 152, stress: 20, surprise: true },
        ],
      },
      parity: {
        tagline: 'You + a doctor who already knows you.',
        beats: [
          { when: 'Day 1', icon: '💬', text: 'You text Dr. Rouhani: “Bad cough, going on 3 weeks.”' },
          { when: 'Day 1', icon: '✅', text: '“Come in at 2 — or hop on video if that’s easier.”' },
          { when: 'Day 1', icon: '🩺', text: 'A real, unhurried visit with the doctor who knows your history.' },
          { when: 'Day 1', icon: '🔬', text: 'Need a test? It’s at a wholesale price you can see up front.' },
          { when: 'Always', icon: '🌿', text: 'One flat membership. No bill in the mail. Ever.' },
        ],
      },
      result: {
        headline: 'For a sudden cough, Parity would’ve meant one good day — not three bad ones.',
        wins: [
          'Seen the same day, by a doctor who already knows you',
          'No 90-minute waiting rooms, no starting from scratch',
          'A price you can see — and never a surprise bill',
        ],
      },
    },
    {
      id: 'chronic', ill: 'weightlifting',
      title: 'Keeping a condition in check', blurb: 'Blood pressure, thyroid, diabetes — the long game of staying well.',
      insurance: {
        tagline: 'Managing your health around the billing calendar.',
        beats: [
          { when: 'January', icon: '🔄', text: 'Your deductible resets. Everything’s full price again until you hit it.', cost: 0, stress: 20 },
          { when: 'Visit', icon: '⏱️', text: 'A rushed 12-minute visit. Labs ordered. “See you in three months.”', cost: 55, stress: 16 },
          { when: 'Week later', icon: '📅', text: 'Your meds need a tweak — but the next slot is weeks out.', cost: 0, stress: 22 },
          { when: 'Next time', icon: '👥', text: 'A different doctor covers and starts your story from zero.', cost: 50, stress: 18 },
          { when: 'Statements', icon: '🧾', text: 'Visits + labs + facility fees quietly stack up over the year.', cost: 165, stress: 14, surprise: true },
        ],
      },
      parity: {
        tagline: 'One steady relationship, all year.',
        beats: [
          { when: 'Always', icon: '📓', text: 'Your doctor already knows your numbers — and your life.' },
          { when: 'Anytime', icon: '🩺', text: 'Unhurried visits, as often as you actually need them.' },
          { when: 'Same day', icon: '💬', text: 'Question about a result? Message it, get a real answer today.' },
          { when: 'Upfront', icon: '🔬', text: 'Labs at wholesale — see the price before you decide.' },
          { when: 'Every month', icon: '🌿', text: 'One flat fee. No deductible to “hit” first.' },
        ],
      },
      result: {
        headline: 'For an ongoing condition, Parity trades billing anxiety for a doctor who stays.',
        wins: [
          'The same physician who knows your full history, every visit',
          'Care paced to your health — not to a deductible',
          'Wholesale labs and one predictable monthly cost',
        ],
      },
    },
    {
      id: 'mental', ill: 'calm-armchair',
      title: 'A rough stretch, mentally', blurb: 'Anxiety, low mood, burnout, sleep — you need real support.',
      insurance: {
        tagline: 'Hunting for help while you’re already worn down.',
        beats: [
          { when: 'Day 1', icon: '🔍', text: 'You search for a psychiatrist. “Not accepting new patients.” Again.', cost: 0, stress: 26 },
          { when: 'Finally', icon: '📅', text: 'You find one — the first opening is three months away.', cost: 0, stress: 22 },
          { when: 'The visit', icon: '⏱️', text: 'A 15-minute med check. No time to actually talk.', cost: 40, stress: 16 },
          { when: 'Meanwhile', icon: '🔀', text: 'Your primary care and mental care never speak to each other.', cost: 0, stress: 16 },
          { when: 'Later', icon: '🧾', text: 'Turns out they were out-of-network. Stress on top of stress.', cost: 150, stress: 20, surprise: true },
        ],
      },
      parity: {
        tagline: 'Mind and body, cared for by the same doctor.',
        beats: [
          { when: 'Day 1', icon: '🩺', text: 'The doctor who knows your body treats your mind too.' },
          { when: 'This week', icon: '✅', text: 'Seen this week — not this quarter.' },
          { when: 'The visit', icon: '💬', text: 'Unrushed conversations, with space to actually talk.' },
          { when: 'Ongoing', icon: '🧩', text: 'Medication and therapy-informed care, coordinated as one.' },
          { when: 'Included', icon: '🌿', text: 'No separate mental-health maze. It’s part of your membership.' },
        ],
      },
      result: {
        headline: 'For your mental health, Parity means help this week — from a doctor who sees the whole you.',
        wins: [
          'Body and mind treated together, by one physician',
          'Weeks, not months — and unrushed visits that go deep',
          'No out-of-network surprises when you’re already stretched',
        ],
      },
    },
    {
      id: 'refill', ill: 'message-doctor',
      title: 'Just a refill (and a quick question)', blurb: 'A tiny thing. It should take thirty seconds. It never does.',
      insurance: {
        tagline: 'The simplest task, the longest runaround.',
        beats: [
          { when: 'Monday', icon: '💊', text: 'Pharmacy: “We faxed your doctor. We’re waiting on them.”', cost: 0, stress: 18 },
          { when: 'Tuesday', icon: '📩', text: 'Your portal message goes… somewhere. Days pass.', cost: 0, stress: 18 },
          { when: 'Thursday', icon: '🚫', text: '“You’ll need an appointment for that refill.”', cost: 0, stress: 22 },
          { when: 'Next week', icon: '🕒', text: 'Take time off work for a 10-minute visit.', cost: 40, stress: 16 },
          { when: 'After', icon: '🧾', text: 'A copay + visit fee — for something that took 30 seconds.', cost: 95, stress: 12, surprise: true },
        ],
      },
      parity: {
        tagline: 'Small things, handled like small things.',
        beats: [
          { when: 'Monday', icon: '💬', text: 'You text: “Need my refill.”' },
          { when: 'Minutes later', icon: '✅', text: '“Done — sent to your pharmacy.”' },
          { when: 'Same thread', icon: '🗨️', text: 'Quick question? Answered right there.' },
          { when: 'Never', icon: '🛑', text: 'No appointment. No time off. No runaround.' },
          { when: 'Included', icon: '🌿', text: 'Because small things shouldn’t cost a whole visit.' },
        ],
      },
      result: {
        headline: 'For everyday little things, Parity gives you back your afternoon.',
        wins: [
          'Refills and questions handled by text — often same day',
          'No “come in for that” appointments for 30-second tasks',
          'No copay surprise for the simplest care',
        ],
      },
    },
  ];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  let root, current, step = 0, lastFocus;

  function buildShell() {
    root = document.getElementById('game');
    root.innerHTML = `
      <div class="game-bar">
        <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;width:100%;max-width:1000px;padding:0;">
          <span class="brand"><span class="mark">P</span> Is direct care right for you?</span>
          <span class="game-progress" aria-hidden="true"><i></i><i></i><i></i></span>
          <button class="game-close" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="game-inner">
        <div class="g-screen" data-screen="pick"></div>
        <div class="g-screen" data-screen="paths"></div>
        <div class="g-screen" data-screen="result"></div>
      </div>`;
    $('.game-close', root).addEventListener('click', close);
    renderPick();
  }

  function setStep(n) {
    step = n;
    root.querySelectorAll('.game-progress i').forEach((d, i) => d.classList.toggle('on', i <= n));
    root.querySelectorAll('.g-screen').forEach(s => s.classList.remove('active'));
    root.querySelector(`[data-screen="${['pick', 'paths', 'result'][n]}"]`).classList.add('active');
    root.scrollTo ? root.scrollTo({ top: 0, behavior: 'auto' }) : (root.scrollTop = 0);
  }

  /* ---------- screen 1: pick a scenario ---------- */
  function renderPick() {
    const s = root.querySelector('[data-screen="pick"]');
    s.innerHTML = `
      <div class="g-head">
        <span class="eyebrow">A two-minute walkthrough</span>
        <h2>What brought you in today?</h2>
        <p>Pick a moment that feels familiar. We’ll play it out two ways.</p>
      </div>
      <div class="scenarios"></div>`;
    const grid = $('.scenarios', s);
    SCENARIOS.forEach(sc => {
      const card = el('button', 'scenario');
      card.setAttribute('data-scn', sc.id);
      card.innerHTML = `
        <span class="ill" data-ill="${sc.ill}" aria-hidden="true"></span>
        <span><h3>${sc.title}</h3><p>${sc.blurb}</p></span>`;
      card.addEventListener('click', () => startScenario(sc.id));
      grid.appendChild(card);
    });
    if (window.PDCIllustrations) window.PDCIllustrations.hydrate(s);
    setStep(0);
  }

  /* ---------- screen 2: two paths unfold ---------- */
  function startScenario(id) {
    current = SCENARIOS.find(x => x.id === id);
    const s = root.querySelector('[data-screen="paths"]');
    s.innerHTML = `
      <div class="g-head">
        <span class="eyebrow">${current.title}</span>
        <h2>Same problem. Two very different days.</h2>
      </div>
      <div class="paths">
        ${pathColumn('insurance', 'The insurance maze', current.insurance.tagline)}
        ${pathColumn('parity', 'The Parity path', current.parity.tagline)}
      </div>
      <div class="g-advance">
        <button class="btn btn-primary btn-lg" data-advance>What happens next <span class="arrow">→</span></button>
        <span class="hint">Tap to walk through the day</span>
      </div>`;
    setStep(1);
    // reveal state
    s._i = 0;
    s._cost = 0; s._stress = 0;
    revealBeat(s);            // show the first beat in both columns
    $('[data-advance]', s).addEventListener('click', () => {
      const done = revealBeat(s);
      if (done) {
        const btn = $('[data-advance]', s);
        btn.innerHTML = 'See what Parity would mean for you <span class="arrow">→</span>';
        btn.onclick = renderResult;
        $('.hint', s).textContent = '';
      }
    });
  }

  function pathColumn(kind, title, tagline) {
    const isIns = kind === 'insurance';
    return `
      <div class="path ${kind}">
        <div class="path-head"><h3>${title}</h3></div>
        <div class="tagline">${tagline}</div>
        <div class="meters">
          <div class="meter cost">
            <div class="m-top"><span>Out of pocket</span><span class="m-val" data-cost>${isIns ? '$0' : '$0'}</span></div>
            <div class="track"><div class="fill" data-fill-cost></div></div>
          </div>
          <div class="meter stress">
            <div class="m-top"><span>Stress</span><span class="m-val" data-stress>0%</span></div>
            <div class="track"><div class="fill" data-fill-stress></div></div>
          </div>
        </div>
        <div class="beats" data-beats="${kind}"></div>
      </div>`;
  }

  // Reveal beat at index _i in both columns; returns true when finished.
  function revealBeat(s) {
    const i = s._i;
    const ins = current.insurance.beats[i];
    const par = current.parity.beats[i];
    if (!ins) return true;

    addBeat($('[data-beats="insurance"]', s), ins, true);
    addBeat($('[data-beats="parity"]', s), par, false);

    // insurance meters climb; parity stays calm & free
    s._cost += (ins.cost || 0);
    s._stress += (ins.stress || 0);
    updateMeters(s.querySelector('.path.insurance'), s._cost, s._stress);
    updateMeters(s.querySelector('.path.parity'), 0, Math.min(10, 4 + i)); // barely a flicker

    s._i++;
    return s._i >= current.insurance.beats.length;
  }

  function addBeat(container, beat, isIns) {
    const b = el('div', 'beat' + (beat.surprise ? ' surprise' : ''));
    const body = beat.surprise && isIns ? `<b>${beat.text}</b>` : beat.text;
    b.innerHTML = `<span class="icon">${beat.icon}</span><span class="b-body"><span class="when">${beat.when}</span>${body}</span>`;
    container.appendChild(b);
  }

  function updateMeters(pathEl, cost, stress) {
    const costPct = Math.min(100, (cost / COST_MAX) * 100);
    const stressPct = Math.min(100, (stress / STRESS_MAX) * 100);
    $('[data-fill-cost]', pathEl).style.width = costPct + '%';
    $('[data-fill-stress]', pathEl).style.width = stressPct + '%';
    $('[data-cost]', pathEl).textContent = '$' + Math.round(cost);
    $('[data-stress]', pathEl).textContent = Math.round(stress) + '%';
  }

  /* ---------- screen 3: personalized result ---------- */
  function renderResult() {
    const paths = root.querySelector('[data-screen="paths"]');
    const totalCost = paths._cost;
    const s = root.querySelector('[data-screen="result"]');
    s.innerHTML = `
      <div class="result">
        <div class="result-card">
          <div class="rc-top">
            <span class="eyebrow">Your result</span>
            <h2>${current.result.headline}</h2>
          </div>
          <div class="rc-body">
            <div class="compare">
              <div class="cmp bad">
                <div class="c-lab">The insurance day</div>
                <div class="c-num">$${Math.round(totalCost)}<span style="font-size:1rem"> + weeks</span></div>
              </div>
              <div class="cmp good">
                <div class="c-lab">The Parity day</div>
                <div class="c-num">$0<span style="font-size:1rem"> extra · today</span></div>
              </div>
            </div>
            <ul class="wins">
              ${current.result.wins.map(w => `<li><span class="w-ic">✓</span><span>${w}</span></li>`).join('')}
            </ul>
            <div class="result-cta">
              <a href="#join" class="btn btn-primary btn-lg" data-join>Become a founding member <span class="arrow">→</span></a>
              <br><button class="restart" data-restart>Try another situation</button>
            </div>
          </div>
        </div>
      </div>`;
    setStep(2);
    $('[data-join]', s).addEventListener('click', () => { close(); });
    $('[data-restart]', s).addEventListener('click', renderPick);
  }

  /* ---------- open / close ---------- */
  function open() {
    if (!root || !root.querySelector('.game-bar')) buildShell();
    else renderPick();
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    const first = root.querySelector('.scenario');
    if (first) first.focus();
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
