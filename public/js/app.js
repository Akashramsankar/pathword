/* Pathword — UI: input, marble animation, persistence, archive, stats and sharing.
   Rules live in engine.js. Conventions (archive, stats, share, modals, theme) follow
   Cascade and Currents so the workshop's games behave alike. */
(() => {
  'use strict';

  const E = self.PathwordEngine;
  const BANK = self.PATHWORD_PUZZLES;
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pace = (ms) => (reduceMotion ? Math.min(ms, 60) : ms);

  /* ---------------- Puzzle selection (by date) ----------------
     Day 0 = Pathword #1 = 11 Nov 2026, the relaunch. Puzzles come from the bank in
     order; if the bank runs out it starts over (add more with scripts/build-puzzles.mjs). */
  const EPOCH = new Date(2026, 10, 11); // months are 0-based -> 10 = November
  const DAY = 86400000;
  const pad = (n) => String(n).padStart(2, '0');
  const dayNumber = () => Math.floor((new Date() - EPOCH) / DAY);
  const dateForDay = (day) => new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate() + day);
  const dayForKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return Math.round((new Date(y, m - 1, d) - EPOCH) / DAY);
  };
  const entryForDay = (day) => BANK[((day % BANK.length) + BANK.length) % BANK.length];

  /* ---------------- Storage ---------------- */
  const SAVE_KEY = 'pathword_progress_v1';
  const STATS_KEY = 'pathword_stats_v1';
  const SEEN_KEY = 'pathword_seen_v1';
  const readJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; }
  };
  const writeJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: progress just won't persist */ }
  };

  /* ---------------- State ---------------- */
  let activeDay = 0;
  let entry = '';
  let puzzle = null; // { answer, grid, path }
  let game = null; // see engine newGame()
  let busy = false;
  let shelfEls = [];
  let tileEls = [];
  const marble = $('marble');
  const core = marble.querySelector('.mb-core');
  const mShadow = $('mshadow');
  let mPos = { x: 0, y: 0 };
  let wellEls = [];

  function saveState() {
    const all = readJSON(SAVE_KEY, {});
    all[activeDay] = { entry, picks: game.picks, time: elapsedNow() };
    writeJSON(SAVE_KEY, all);
  }
  function loadSave(day) {
    const s = readJSON(SAVE_KEY, {})[day];
    return s && s.entry === entry ? s : { picks: [], time: 0 };
  }

  /* ---------------- Clock (as in Cascade) ----------------
     Runs while the board is on screen and unfinished; pauses while the tab is hidden. */
  let timeBase = 0;
  let runningSince = 0;
  const elapsedNow = () => timeBase + (runningSince ? Date.now() - runningSince : 0);
  function startClock() { if (game && game.status === 'playing' && !runningSince && !document.hidden) runningSince = Date.now(); }
  function pauseClock() { if (runningSince) { timeBase += Date.now() - runningSince; runningSince = 0; } }
  const fmtTime = (sec) => `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
  function renderClock() {
    const txt = fmtTime(Math.floor(elapsedNow() / 1000));
    if ($('clock').textContent !== txt) $('clock').textContent = txt;
  }
  setInterval(() => { if (runningSince) renderClock(); }, 250);
  let resumeOnReturn = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { resumeOnReturn = !!runningSince; if (runningSince) { pauseClock(); saveState(); } }
    else if (resumeOnReturn) { resumeOnReturn = false; startClock(); }
  });
  addEventListener('pagehide', () => { if (runningSince) { pauseClock(); saveState(); } });

  /* ---------------- Stats & streaks ---------------- */
  const DIST_KEYS = ['1', '2', '3', '4', '5', '6', 'x'];
  function loadStats() {
    const s = readJSON(STATS_KEY, {});
    for (const k of ['played', 'wins', 'currentStreak', 'maxStreak']) if (typeof s[k] !== 'number') s[k] = 0;
    if (typeof s.lastDay !== 'number') s.lastDay = -999;
    if (typeof s.lastWonDay !== 'number') s.lastWonDay = -999;
    if (!s.dist || typeof s.dist !== 'object') s.dist = {};
    DIST_KEYS.forEach((k) => { if (typeof s.dist[k] !== 'number') s.dist[k] = 0; });
    return s;
  }
  const used = () => game.lost + 1;
  const resultKey = () => (game.status === 'won' ? String(used()) : 'x');
  // Only today's puzzle feeds the stats; archive days are just for fun.
  function recordResult() {
    const day = dayNumber();
    if (activeDay !== day) return;
    const s = loadStats();
    if (s.lastDay === day) return;
    s.played++;
    s.lastDay = day;
    if (game.status === 'won') {
      s.wins++;
      s.currentStreak = s.lastWonDay === day - 1 ? s.currentStreak + 1 : 1;
      s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
      s.lastWonDay = day;
    } else {
      s.currentStreak = 0;
    }
    s.dist[resultKey()]++;
    writeJSON(STATS_KEY, s);
  }
  function renderStats(prefix, s, curKey) {
    $(prefix + 'Played').textContent = s.played;
    $(prefix + 'Win').textContent = s.played ? Math.round((100 * s.wins) / s.played) : 0;
    $(prefix + 'Streak').textContent = s.currentStreak;
    $(prefix + 'Max').textContent = s.maxStreak;
    const max = Math.max(1, ...DIST_KEYS.map((k) => s.dist[k] || 0));
    $(prefix + 'Dist').innerHTML = s.played === 0
      ? '<div class="sempty">Finish today\'s word to start your distribution.</div>'
      : DIST_KEYS.map((k) => {
        const n = s.dist[k] || 0;
        const w = Math.max(10, (n / max) * 100);
        const label = k === 'x' ? 'Lost' : `${k} ●`;
        return `<div class="gd${k === curKey ? ' cur' : ''}"><span class="gl">${label}</span><div class="gb" style="width:${w}%">${n}</div></div>`;
      }).join('');
  }

  /* ---------------- Board ---------------- */
  function buildBoard() {
    shelfEls.forEach((s) => s.remove());
    shelfEls = [];
    tileEls = [];
    wellEls = [];
    for (let r = 0; r < E.ROWS; r++) {
      const shelf = document.createElement('div');
      shelf.className = 'shelf';
      shelf.style.setProperty('--r', r);
      const row = [];
      const wells = [];
      for (let c = 0; c < E.COLS; c++) {
        const w = document.createElement('span');
        w.className = 'well';
        w.style.setProperty('--c', c);
        shelf.appendChild(w);
        wells.push(w);
      }
      wellEls.push(wells);
      for (let c = 0; c < E.COLS; c++) {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'tile enter';
        t.style.setProperty('--c', c);
        t.style.setProperty('--delay', `${r * 45 + c * 18}ms`);
        t.innerHTML = `<span class="face">${puzzle.grid[r][c]}</span>`;
        t.setAttribute('aria-label', `Shelf ${r + 1}, ${puzzle.grid[r][c]}`);
        t.addEventListener('click', () => onTap(r, c));
        t.addEventListener('animationend', () => t.classList.remove('enter'), { once: true });
        shelf.appendChild(t);
        row.push(t);
      }
      $('board').insertBefore(shelf, mShadow);
      shelfEls.push(shelf);
      tileEls.push(row);
    }
  }

  /** Bring every tile and shelf in line with the game state (no animation). */
  function renderBoard(st = game) {
    const playing = st.status === 'playing';
    for (let r = 0; r < E.ROWS; r++) {
      const shelf = shelfEls[r];
      shelf.classList.toggle('done', r < st.row);
      shelf.classList.toggle('live', playing && r === st.row);
      shelf.classList.toggle('later', r > st.row || (!playing && r >= st.row));
      shelf.classList.toggle('busy', busy);
      for (let c = 0; c < E.COLS; c++) {
        const t = tileEls[r][c];
        const isLock = r < st.row && st.locked[r] === c;
        const reveal = st.status === 'lost' && r >= st.row && puzzle.path[r] === c;
        t.classList.toggle('ok', isLock);
        t.classList.toggle('free', isLock && st.shelves[r].free);
        t.classList.toggle('reveal', reveal);
        // a tile mid-fall hides itself when its animation ends
        if (!t.dataset.falling) t.classList.toggle('gone', !reveal && !isLock && st.gone[r][c]);
        t.classList.remove('wrong');
        t.disabled = !(playing && r === st.row && E.alive(st, r).includes(c));
      }
    }
  }

  function renderHud(st = game) {
    const playing = st.status === 'playing';
    // word slots
    $('slots').innerHTML = puzzle.answer.split('').map((ch, i) => {
      if (i < st.row) return `<span class="slot ok${st.shelves[i].free ? ' free' : ''}">${ch}</span>`;
      if (st.status === 'lost') return `<span class="slot miss">${ch}</span>`;
      return `<span class="slot${playing && i === st.row ? ' now' : ''}"></span>`;
    }).join('');
    const left = E.MARBLES - st.lost;
    // marbles left: the one in play bobs, a newly lost one pops
    const meter = $('marbleMeter');
    const prevLost = Number(meter.dataset.lost || 0);
    meter.innerHTML = Array.from({ length: E.MARBLES }, (_, i) => {
      const cls = i < st.lost ? `spent${i >= prevLost && i < st.lost && st.lost > prevLost ? ' pop' : ''}` : i === st.lost && playing ? 'cur' : '';
      return `<i class="${cls}"></i>`;
    }).join('');
    meter.dataset.lost = st.lost;
    meter.setAttribute('aria-label', `${left} of ${E.MARBLES} marbles left`);
    $('marbleLabel').textContent = left === 1 && playing ? 'Last marble' : 'Marbles';
    meter.parentElement.classList.toggle('low', playing && left <= 2);
    $('shelfNo').textContent = `${Math.min(st.row + 1, E.ROWS)}/${E.ROWS}`;
    $('freeNo').textContent = E.freefalls(st);
    // a freefall through the last shelf is still "playing" for a moment with row = ROWS
    $('shelfLabel').textContent = playing && st.row < E.ROWS ? `Shelf ${st.row + 1} of ${E.ROWS}` : st.status === 'lost' ? 'Revealed' : 'Solved';
    $('cup').classList.toggle('full', st.status === 'won');
    $('cup').classList.toggle('empty', st.status === 'lost');
    $('shareBtn').disabled = playing;
    renderClock();
  }

  function renderHeader() {
    const d = dateForDay(activeDay).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const today = activeDay === dayNumber();
    $('dateLabel').textContent = `Puzzle #${activeDay + 1} · ${d} · ${today ? 'Today' : 'Archive'}`;
    $('cardLabel').textContent = today ? 'Today\'s word' : `Word #${activeDay + 1}`;
  }

  function say(text, kind = '') {
    const m = $('msg');
    m.className = `msg${kind ? ' ' + kind : ''}`;
    m.textContent = text;
  }
  function idleMessage() {
    if (game.status === 'won') return say(`Solved with ${used()} of ${E.MARBLES} marbles.`, 'ok');
    if (game.status === 'lost') return say(`Out of marbles. The word was ${puzzle.answer}.`, 'bad');
    if (game.picks.length === 0) return say('Tap a tile on the top shelf to drop the marble.');
    return say(`Shelf ${game.row + 1}: pick the next letter.`);
  }

  function toast(text, bad) {
    const t = $('toast');
    t.textContent = text;
    t.classList.toggle('bad', !!bad);
    t.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function floatLabel(r, c, text, kind = '') {
    const f = document.createElement('div');
    f.className = `float ${kind}`;
    const g = geo();
    f.style.left = `${g.cx(c)}px`;
    f.style.top = `${g.top(r) - g.m}px`;
    f.innerHTML = `<span>${text}</span>`;
    $('board').appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }

  /* ---------------- Marble motion ----------------
     All motion is scripted, so the same tap always looks the same. Positions are
     the marble's top-left corner in #board pixels. */
  function geo() {
    const t0 = tileEls[0][0];
    const cell = t0.offsetWidth;
    const step = tileEls[0][1].offsetLeft - t0.offsetLeft;
    const m = marble.offsetWidth;
    const top = (r) => shelfEls[r].offsetTop;
    const cx = (c) => c * step + cell / 2;
    const board = $('board');
    return {
      cell, step, m, top, cx,
      onTile: (r, c) => ({ x: cx(c) - m / 2, y: top(r) - m }),
      inGap: (r, c) => ({ x: cx(c) - m / 2, y: top(r) + cell - m }), // resting on the plank
      start: () => ({ x: board.offsetWidth / 2 - m / 2, y: top(0) - m }),
      above: (x) => ({ x, y: -m * 2.2 }),
      cup: (c) => ({ x: cx(c) - m / 2, y: $('cup').offsetTop - board.offsetTop + $('cup').offsetHeight - m - 3 }),
      width: board.offsetWidth,
    };
  }
  // The swirl turns with distance travelled, so the marble reads as rolling.
  const spinAt = (x) => (x / Math.max(1, marble.offsetWidth / 2)) * (180 / Math.PI);
  const mTransform = (p) => `translate(${p.x}px, ${p.y}px) scale(${p.sx || 1}, ${p.sy || 1})`;
  function placeShadow(p, on) {
    const m = marble.offsetWidth;
    const w = mShadow.offsetWidth;
    const h = mShadow.offsetHeight;
    mShadow.style.transform = `translate(${p.x + m / 2 - w / 2}px, ${p.y + m - h / 2}px)`;
    mShadow.classList.toggle('on', !!on);
  }
  function setMarble(p, on = true) {
    mPos = { x: p.x, y: p.y };
    marble.style.transform = mTransform({ x: p.x, y: p.y });
    core.style.transform = `rotate(${spinAt(p.x)}deg)`;
    marble.classList.toggle('on', on);
    placeShadow(p, on);
  }
  /** Animate through points: each { x, y, t (ms to get there), ease, o (opacity), sx/sy (squash) }. */
  async function moveMarble(points) {
    const from = { ...mPos, o: 1 };
    const all = [from, ...points];
    const total = points.reduce((s, p) => s + p.t, 0) || 1;
    let acc = 0;
    const offs = all.map((p, i) => { if (i > 0) acc += points[i - 1].t; return acc / total; });
    const ease = (i) => (i < points.length ? points[i].ease || 'ease-in-out' : undefined);
    const frames = all.map((p, i) => ({ transform: mTransform(p), opacity: p.o == null ? 1 : p.o, offset: offs[i], ...(ease(i) ? { easing: ease(i) } : {}) }));
    const spins = all.map((p, i) => ({ transform: `rotate(${spinAt(p.x)}deg)`, offset: offs[i], ...(ease(i) ? { easing: ease(i) } : {}) }));
    mShadow.classList.remove('on');
    const a = marble.animate(frames, { duration: pace(total), fill: 'forwards' });
    const b = core.animate(spins, { duration: pace(total), fill: 'forwards' });
    try { await a.finished; } catch (e) { /* cancelled */ }
    const last = all[all.length - 1];
    setMarble(last, (last.o == null ? 1 : last.o) > 0);
    a.cancel();
    b.cancel();
  }
  const FALL = 'cubic-bezier(.45,0,.9,.55)';
  const fallTime = (dy) => Math.round(55 * Math.sqrt(Math.max(8, Math.abs(dy)) / 8));
  // stretched as it drops
  const fallTo = (p) => ({ ...p, t: fallTime(p.y - mPos.y), ease: FALL, sx: 0.88, sy: 1.14 });
  // a quick hop: up and over to a tile top
  function hopTo(p, g) {
    const apex = { x: (mPos.x + p.x) / 2, y: Math.min(mPos.y, p.y) - g.cell * 0.32, t: 110 + Math.abs(p.x - mPos.x) * 0.5, ease: 'cubic-bezier(.2,.6,.4,1)' };
    return [apex, { ...p, t: 120, ease: 'cubic-bezier(.6,0,.9,.6)', sx: 0.94, sy: 1.06 }, { ...p, t: 60, ease: 'ease-out', sx: 1.12, sy: 0.88 }, { ...p, t: 80, ease: 'ease-in-out' }];
  }
  // squash on impact, a small rebound, settle
  const bounce = (p) => [
    { x: p.x, y: p.y, sx: 1.24, sy: 0.78, t: 60, ease: 'ease-out' },
    { x: p.x, y: p.y - 6, sx: 0.96, sy: 1.04, t: 100, ease: 'ease-out' },
    { x: p.x, y: p.y, t: 90, ease: 'ease-in' },
    { x: p.x, y: p.y, sx: 1.08, sy: 0.93, t: 50, ease: 'ease-out' },
    { x: p.x, y: p.y, t: 70, ease: 'ease-in-out' },
  ];

  /* ---------------- Effects ----------------
     Purely decorative particles in #board pixels. Skipped for reduced motion. */
  const rnd = (a, b) => a + Math.random() * (b - a);
  function fx(cls, x, y, size, color, frames, ms) {
    const el = document.createElement('i');
    el.className = `fx ${cls}`;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${x - size / 2}px`;
    el.style.top = `${y - size / 2}px`;
    if (color) { el.style.background = cls === 'ring' ? 'transparent' : color; el.style.color = color; }
    $('board').appendChild(el);
    const a = el.animate(frames, { duration: ms, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    a.finished.then(() => el.remove()).catch(() => el.remove());
  }
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  function sparks(x, y, color, n = 10, power = 1) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const ang = rnd(-Math.PI, 0) + rnd(-0.3, 0.3); // mostly upward
      const d = rnd(18, 42) * power;
      const dx = Math.cos(ang) * d;
      const dy = Math.sin(ang) * d;
      const size = rnd(3, 6);
      fx('spark', x, y, size, color, [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(.9)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx * 1.2}px, ${dy + 22}px) scale(.3)`, opacity: 0 },
      ], rnd(520, 760));
    }
  }
  function ring(x, y, color, size = 18) {
    if (reduceMotion) return;
    fx('ring', x, y, size, color, [
      { transform: 'scale(.3)', opacity: 0.9 },
      { transform: 'scale(2.4)', opacity: 0 },
    ], 560);
  }
  function dust(x, y, n = 4) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const size = rnd(10, 18);
      fx('dust', x + rnd(-10, 10), y, size, null, [
        { transform: 'translate(0,0) scale(.4)', opacity: 0.9 },
        { transform: `translate(${rnd(-16, 16)}px, ${rnd(-14, -4)}px) scale(1.3)`, opacity: 0 },
      ], rnd(480, 700));
    }
  }
  function confetti(x, y, w) {
    if (reduceMotion) return;
    const colors = [css('--good'), css('--gold'), css('--jump'), css('--accent'), css('--bad')];
    for (let i = 0; i < 46; i++) {
      const sx = x + rnd(-w / 2, w / 2);
      const dx = rnd(-60, 60);
      const up = rnd(70, 170);
      const size = rnd(5, 8);
      fx('bit', sx, y, size, colors[i % colors.length], [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${-up}px) rotate(${rnd(-200, 200)}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${-up + rnd(60, 120)}px) rotate(${rnd(-400, 400)}deg)`, opacity: 0 },
      ], rnd(1100, 1600));
    }
  }

  /** Where the marble rests between taps. */
  function restPos(g) {
    if (game.row === 0) return g.start();
    if (game.status === 'won') return g.cup(game.locked[E.ROWS - 1]);
    return g.inGap(game.row, game.locked[game.row - 1]);
  }
  function placeMarble() {
    if (!tileEls.length) return;
    const g = geo();
    if (game.status === 'lost') { setMarble(g.start(), false); return; }
    setMarble(restPos(g), true);
    marble.classList.remove('glow');
  }

  /** A fresh marble leaves the rack and falls through every trapdoor already open. */
  async function spawnMarble(st = game) {
    const g = geo();
    const firstX = st.row === 0 ? g.start().x : g.onTile(0, st.locked[0]).x;
    setMarble(g.above(firstX), true);
    const pts = [];
    if (st.row === 0) {
      pts.push({ ...g.start(), t: fallTime(g.start().y - mPos.y), ease: FALL }, ...bounce(g.start()));
    } else {
      let y = mPos.y;
      for (let r = 0; r < st.row; r++) {
        const c = st.locked[r];
        if (r > 0) {
          // land in the gap on shelf r, hop onto its open trapdoor and through
          const tp = g.onTile(r, c);
          pts.push({ x: tp.x, y: tp.y - g.cell * 0.2, t: 120, ease: 'ease-out' });
          y = tp.y - g.cell * 0.2;
        }
        const land = g.inGap(r + 1, c);
        pts.push({ ...land, t: Math.round(fallTime(land.y - y) * 0.8), ease: FALL });
        y = land.y;
      }
      pts.push(...bounce(pts[pts.length - 1]));
    }
    await moveMarble(pts);
  }

  async function dropTiles(cells, how) {
    const g = geo();
    cells.forEach(([r, c], i) => {
      const el = tileEls[r][c];
      if (!el || el.classList.contains('gone')) return;
      const face = el.firstElementChild;
      el.dataset.falling = '1';
      const spin = (how.dir || (i % 2 ? 1 : -1)) * (14 + ((r * 7 + c * 13) % 18));
      const dx = how.dir ? how.dir * g.cell * (1.1 + (i % 3) * 0.25) : 0;
      const from = getComputedStyle(face).opacity; // fall from how it looks now (later shelves are faded)
      const a = face.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: from },
        { transform: `translate(${dx}px, ${g.cell * 1.6}px) rotate(${spin}deg)`, opacity: 0 },
      ], { duration: pace(how.dir ? 520 : 460), delay: pace(how.delay ? i * how.delay : 0), easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
      a.finished.then(() => { delete el.dataset.falling; el.classList.add('gone'); a.cancel(); }).catch(() => { delete el.dataset.falling; });
      setTimeout(() => dust(g.cx(c), g.top(r) + g.cell, 3), pace((how.delay ? i * how.delay : 0) + 120));
    });
  }

  /* ---------------- Playing a tap ---------------- */
  async function onTap(r, c) {
    if (busy || game.status !== 'playing' || r !== game.row) return;
    const events = E.pick(puzzle, game, c);
    if (!events) return;
    busy = true;
    shelfEls[r].classList.add('busy');
    saveState();
    const g = geo();
    // hop onto the tapped tile
    const on = g.onTile(r, c);
    await moveMarble(hopTo(on, g));
    tileEls[r][c].classList.add('thud');
    setTimeout(() => tileEls[r][c].classList.remove('thud'), 240);
    for (const ev of events) await playEvent(ev);
    busy = false;
    finishTurn();
  }

  function finishTurn() {
    if (game.status !== 'playing') { pauseClock(); saveState(); }
    renderBoard();
    renderHud(); // the last event's message stays up until the next tap
    if (game.status !== 'playing') {
      recordResult();
      lbRecordFirstWin();
      track(game.status === 'won' ? 'puzzle_won' : 'puzzle_lost', game.status === 'won' ? used() : E.MARBLES);
      setTimeout(showEnd, pace(game.status === 'won' ? 1100 : 900));
    }
  }

  async function openTrapdoor(r, c, crumbled, free) {
    const g = geo();
    const t = tileEls[r][c];
    const w = wellEls[r][c];
    w.classList.add('hole');
    t.classList.add('open', 'ok');
    if (free) t.classList.add('free');
    setTimeout(() => { t.classList.remove('open'); w.classList.remove('hole'); }, 520);
    shelfEls[r].classList.remove('live');
    if (navigator.vibrate) navigator.vibrate(free ? [15, 30, 15] : 18);
    const color = css(free ? '--jump' : '--good');
    sparks(g.cx(c), g.top(r) + 4, color, free ? 18 : 10, free ? 1.3 : 1);
    ring(g.cx(c), g.top(r) + g.cell / 2, color, g.cell * 0.6);
    await wait(pace(120));
    dropTiles(crumbled, { delay: 55 });
    const land = r + 1 < E.ROWS ? g.inGap(r + 1, c) : g.cup(c);
    await moveMarble([fallTo(land), ...bounce(land)]);
    if (r + 1 < E.ROWS) dust(land.x + g.m / 2, land.y + g.m, 2);
  }

  async function playEvent(ev) {
    const g = geo();
    if (ev.type === 'hit') {
      say(ev.row + 1 < E.ROWS ? `Trapdoor! ${puzzle.answer[ev.row]} is right.` : 'Last trapdoor!', 'ok');
      renderHud(ev.state);
      await openTrapdoor(ev.row, ev.col, ev.crumbled, false);
      renderBoard(ev.state);
    } else if (ev.type === 'freefall') {
      marble.classList.add('glow');
      // hop onto the last tile standing, then straight through
      if (Math.abs(mPos.x - g.onTile(ev.row, ev.col).x) > 1) await moveMarble(hopTo(g.onTile(ev.row, ev.col), g));
      floatLabel(ev.row, ev.col, 'Freefall ⚡');
      say(`Freefall! Only ${puzzle.answer[ev.row]} was left on shelf ${ev.row + 1}.`, 'jp');
      renderHud(ev.state);
      await openTrapdoor(ev.row, ev.col, ev.crumbled, true);
      marble.classList.remove('glow');
      renderBoard(ev.state);
    } else if (ev.type === 'miss') {
      const shelf = shelfEls[ev.row];
      const t = tileEls[ev.row][ev.col];
      t.classList.add('wrong');
      if (navigator.vibrate) navigator.vibrate(40);
      say(ev.dir > 0 ? 'The shelf tips right. The letter is further right.' : 'The shelf tips left. The letter is further left.', 'bad');
      await wait(pace(140));
      shelf.classList.add(ev.dir > 0 ? 'tip-r' : 'tip-l');
      // the marble rolls downhill and off the end; the uphill tiles go with it
      const edgeX = ev.dir > 0 ? g.width + g.m * 0.4 : -g.m * 1.4;
      const run = Math.abs(edgeX - mPos.x);
      const edgeY = mPos.y + run * 0.087;
      const cells = ev.fell.slice().sort((a, b) => (ev.dir > 0 ? b - a : a - b)).map((c) => [ev.row, c]);
      dropTiles(cells, { dir: ev.dir, delay: 40 });
      setTimeout(() => dust(ev.dir > 0 ? g.width : 0, g.top(ev.row) + g.cell, 4), pace(180 + run * 1.1));
      await moveMarble([
        { x: edgeX, y: edgeY, t: 180 + run * 1.1, ease: 'cubic-bezier(.5,0,.75,1)' },
        { x: edgeX + ev.dir * g.m, y: edgeY + g.cell * 1.8, t: 260, ease: FALL, o: 0, sx: 0.9, sy: 1.1 },
      ]);
      renderHud(ev.state);
      await wait(pace(120));
      shelf.classList.remove('tip-r', 'tip-l');
      renderBoard(ev.state);
      if (ev.state.status === 'playing') {
        await wait(pace(180));
        await spawnMarble(ev.state);
      }
    } else if (ev.type === 'won') {
      $('cup').classList.add('full');
      const cupTop = $('cup').offsetTop - $('board').offsetTop;
      ring(mPos.x + g.m / 2, mPos.y + g.m / 2, css('--good'), g.m * 1.2);
      confetti(g.width / 2, cupTop, g.width * 0.8);
      renderBoard();
      renderHud();
      say(`Into the cup! ${puzzle.answer} with ${used()} of ${E.MARBLES} marbles.`, 'ok');
      game.locked.forEach((c, r) => {
        const t = tileEls[r][c];
        t.style.setProperty('--delay', `${r * 90}ms`);
        t.classList.add('won');
      });
    } else if (ev.type === 'lost') {
      setMarble(geo().start(), false);
      renderBoard();
      renderHud();
      idleMessage();
    }
  }

  /* ---------------- Result ---------------- */
  function gradeFor() {
    if (game.status !== 'won') return ['OUT OF MARBLES', 'var(--color-far)'];
    return [
      ['CLEAN DROP', 'var(--color-close)'],
      ['BRILLIANT', 'var(--color-correct)'],
      ['GREAT', 'var(--color-correct)'],
      ['SOLID', 'var(--accent)'],
      ['STEADY', 'var(--accent)'],
      ['PHEW', 'var(--ink-muted)'],
    ][used() - 1];
  }
  function shareText() {
    const s = loadStats();
    const marks = game.shelves.map((sh, r) => {
      const arrows = sh.misses.map((d) => (d > 0 ? '➡️' : '⬅️')).join('');
      if (r < game.row) return arrows + (sh.free ? '⚡' : '🟩');
      if (game.status === 'lost' && r === game.row) return arrows + '❌';
      return '⬛';
    }).join(' ');
    const score = game.status === 'won' ? `${used()}/${E.MARBLES}` : `X/${E.MARBLES}`;
    const streak = activeDay === dayNumber() && s.currentStreak > 0 ? ` · 🔥${s.currentStreak}` : '';
    const time = game.status === 'won' ? ` · ⏱${fmtTime(Math.floor(elapsedNow() / 1000))}` : '';
    return `Pathword #${activeDay + 1} · ${score}${time}${streak}\n${marks}\nakashramsankar.github.io/pathword`;
  }

  let countdownTimer;
  function nextWordIn() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const s = Math.max(0, Math.floor((next - now) / 1000));
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  function showEnd() {
    const won = game.status === 'won';
    const [g, colr] = gradeFor();
    const gr = $('grade');
    gr.textContent = g;
    gr.style.background = `color-mix(in srgb, ${colr} 12%, transparent)`;
    gr.style.color = colr;
    gr.style.border = `1px solid ${colr}`;
    $('endTitle').textContent = won ? 'Into the cup' : 'Out of marbles';
    $('endWord').textContent = puzzle.answer;
    const free = E.freefalls(game);
    const time = fmtTime(Math.floor(elapsedNow() / 1000));
    $('breakdown').textContent = won
      ? `${used()} of ${E.MARBLES} marbles · ${time}${free ? ` · ${free} freefall${free > 1 ? 's' : ''}` : ''}.` +
        (used() === 1 ? ' Not a single roll-off.' : '')
      : `You reached shelf ${game.row + 1}. A new word drops at midnight.`;
    renderDropMap();
    renderStats('st', loadStats(), activeDay === dayNumber() ? resultKey() : null);
    $('share').textContent = shareText();
    lbAfterWin();
    $('countdown').textContent = nextWordIn();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => { $('countdown').textContent = nextWordIn(); }, 1000);
    openModal($('endModal'));
  }

  // one square per tile: locked, freefall, wrong pick, knocked off, the answer if lost
  function renderDropMap() {
    const cells = [];
    for (let r = 0; r < E.ROWS; r++) {
      const sh = game.shelves[r];
      for (let c = 0; c < E.COLS; c++) {
        let k = '';
        if (r < game.row && game.locked[r] === c) k = sh.free ? 'f' : 'l';
        else if (sh.wrong.includes(c)) k = 'w';
        else if (game.status === 'lost' && r >= game.row && puzzle.path[r] === c) k = 'r';
        else if (game.gone[r][c] || r < game.row) k = 'o';
        cells.push(`<i class="${k}"></i>`);
      }
    }
    $('dropMap').innerHTML = cells.join('');
  }

  async function shareResult() {
    const text = $('share').textContent;
    if (navigator.share && navigator.canShare && navigator.canShare({ text })) {
      try { await navigator.share({ text }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
    }
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); toast('Result copied!'); return; } catch (e) { /* fall through */ }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('Result copied!');
    } catch (e) { toast('Copy failed', true); }
  }

  function track(action, value) {
    try { if (typeof gtag === 'function') gtag('event', action, { event_category: 'Game', event_label: `#${activeDay + 1}`, value }); } catch (e) { /* ignore */ }
  }

  /* ---------------- Daily leaderboard (as in Cascade and Typeset) ----------------
     One public board per day, stored in the workshop's Firebase under
     pathword/daily/{day}/{playerId}. Only the first win on today's word posts
     (archive games and losses never do). Score = marbles used, lower is better;
     ties go to the faster solve. */
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyD5C8uPGGb_jMuA0ceP5VlWChMV-Ggfles',
    authDomain: 'tumbler-51e42.firebaseapp.com',
    databaseURL: 'https://tumbler-51e42-default-rtdb.asia-southeast1.firebasedatabase.app/',
    projectId: 'tumbler-51e42',
    appId: '1:907072959576:web:641facf27c204c7bb8862d',
  };
  const LB_PID_KEY = 'pathword_pid';
  const LB_NAME_KEY = 'pathword_name';
  const LB_POSTED_KEY = 'pathword_lb_posted';
  const LB_ASKED_KEY = 'pathword_lb_asked';
  const LB_ENTRY_KEY = 'pathword_lb_entry'; // { day, entry }: today's first win, which is what posts
  const LB_SHOW = 50;
  const LB_TIMEOUT = 8000;
  const lbGet = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const lbSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } };
  const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  let lbName = cleanName(lbGet(LB_NAME_KEY));
  let lbPidCache = '';
  function lbPid() {
    if (lbPidCache) return lbPidCache;
    let id = lbGet(LB_PID_KEY);
    if (!/^[a-z0-9]{12,}$/.test(id)) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => (b % 36).toString(36)).join('');
      lbSet(LB_PID_KEY, id);
    }
    return (lbPidCache = id);
  }
  function lbSetName(n) { lbName = n; lbSet(LB_NAME_KEY, n); }
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  // Firebase reads never reject while offline — they just wait — so every call gets a deadline.
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
  let lbDbPromise = null;
  function lbDb() {
    if (!lbDbPromise) {
      const base = 'https://www.gstatic.com/firebasejs/10.7.1/';
      lbDbPromise = loadScript(`${base}firebase-app-compat.js`)
        .then(() => loadScript(`${base}firebase-database-compat.js`))
        .then(() => (firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG)).database())
        .catch((e) => { lbDbPromise = null; throw e; });
    }
    return withTimeout(lbDbPromise, LB_TIMEOUT);
  }
  async function markVisit() {
    try {
      const db = await lbDb();
      const profile = { lastUpdated: firebase.database.ServerValue.TIMESTAMP };
      if (lbName) profile.name = lbName;
      await withTimeout(db.ref(`pathword/userProfile/${lbPid()}`).update(profile), LB_TIMEOUT);
    } catch (e) { /* Visit tracking is best effort and must not block the game. */ }
  }
  async function lbPost(day, entry) {
    const db = await lbDb();
    const ref = db.ref(`pathword/daily/${day}/${lbPid()}`);
    const row = { ...entry, at: firebase.database.ServerValue.TIMESTAMP };
    await withTimeout(ref.transaction((cur) => (cur === null ? row : undefined)), LB_TIMEOUT); // first result stands
    lbSet(LB_POSTED_KEY, String(day));
    void markVisit(); // a posted score always comes with a profile
  }
  async function lbFetch(day) {
    const db = await lbDb();
    const snap = await withTimeout(db.ref(`pathword/daily/${day}`).once('value'), LB_TIMEOUT);
    const rows = [];
    snap.forEach((c) => {
      const v = c.val() || {};
      if (typeof v.s === 'number') rows.push({ pid: c.key, n: cleanName(v.n) || 'Anonymous', s: v.s | 0, t: v.t | 0, at: +v.at || 0 });
    });
    rows.sort((a, b) => a.s - b.s || a.t - b.t || a.at - b.at);
    return rows;
  }
  function lbRow(r, rank, me) {
    const el = document.createElement('div');
    el.className = `lb-row${r.pid === me ? ' you' : ''}`;
    el.innerHTML = `<span class="lr">${rank}</span><span class="ln"></span><span class="lm"></span>` +
      `<span class="ls">${r.s}</span><span class="lt">${fmtTime(r.t)}</span>`;
    el.querySelector('.ln').textContent = r.n;
    if (r.pid === me) el.querySelector('.ln').insertAdjacentHTML('beforeend', '<small>You</small>');
    return el;
  }
  function renderLbYou(day) {
    const you = $('lbYou');
    const isToday = day === dayNumber();
    if (!lbName) { you.textContent = isToday ? "Solve today's word to put your name on the leaderboard." : ''; return; }
    you.innerHTML = 'Playing as <b></b> · <button class="lnk" type="button" id="lbRename">Change name</button>' +
      (!isToday || lbGet(LB_POSTED_KEY) === String(day) ? '' : "<br>Solve today's word to post your score.");
    you.querySelector('b').textContent = lbName;
    $('lbRename').onclick = () => openNameCard('rename', dayNumber(), null); // a rename only touches today's entry
  }
  // ago: 0 = today's board, 1 = yesterday's (read-only — only today's live result ever posts).
  let lbReq = 0;
  let lbAgo = 0;
  async function openLeaderboard(ago = 0) {
    const today = Math.max(0, dayNumber());
    if (today < 1) ago = 0;
    lbAgo = ago;
    const day = today - ago;
    const list = $('lbList');
    const req = ++lbReq;
    document.querySelector('.lb-tabs').hidden = today < 1; // launch day: nothing to look back on
    document.querySelectorAll('.lb-tab').forEach((t) => {
      const on = Number(t.dataset.ago) === ago;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on);
    });
    const dstr = dateForDay(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    $('lbSub').innerHTML = `Word #${day + 1} · ${dstr}<br>Ranked by marbles used, then time`;
    list.innerHTML = '<div class="lb-empty">Loading…</div>';
    renderLbYou(day);
    openModal($('lbModal'));
    try {
      const rows = await lbFetch(day);
      const me = lbPid();
      if (req !== lbReq) return; // the player switched tabs while this was loading
      list.innerHTML = '';
      if (!rows.length) { list.innerHTML = `<div class="lb-empty">${ago ? "No one solved yesterday's word." : "No one's on the board yet. Solve today's word to be first."}</div>`; return; }
      rows.slice(0, LB_SHOW).forEach((r, i) => list.appendChild(lbRow(r, i + 1, me)));
      const mine = rows.findIndex((r) => r.pid === me);
      if (mine >= LB_SHOW) { const el = lbRow(rows[mine], mine + 1, me); el.classList.add('gap'); list.appendChild(el); }
    } catch (e) {
      if (req !== lbReq) return;
      list.innerHTML = '<div class="lb-empty">Couldn\'t reach the leaderboard. Check your connection and try again.</div>';
    }
  }
  // The first win on today's word is the one that counts.
  function lbRecordFirstWin() {
    const day = dayNumber();
    if (activeDay !== day || game.status !== 'won' || lbEntryFor(day)) return;
    writeJSON(LB_ENTRY_KEY, { day, entry: { s: used(), t: Math.round(elapsedNow() / 1000) } });
  }
  function lbEntryFor(day) {
    const e = readJSON(LB_ENTRY_KEY, null);
    return e && e.day === day && e.entry ? e.entry : null;
  }
  // Result card: today's first win posts itself once a name is known; archive games never post.
  // With no name yet, the name card opens over the result once per day.
  function lbAfterWin() {
    const day = dayNumber();
    const box = $('lbJoin');
    const entry = activeDay === day ? lbEntryFor(day) : null;
    box.hidden = !entry;
    if (!entry) return;
    if (lbGet(LB_POSTED_KEY) === String(day)) { lbShowRank(day); return; }
    if (lbName) { lbSubmit(day, entry); return; }
    lbShowJoinLink(day, entry);
    if (lbGet(LB_ASKED_KEY) === String(day)) return;
    lbSet(LB_ASKED_KEY, String(day));
    // let the result land first, then ask
    setTimeout(() => {
      if (activeDay === day && $('endModal').classList.contains('show')) openNameCard('join', day, entry);
    }, 700);
  }
  function lbShowJoinLink(day, entry) {
    $('lbJoinMsg').innerHTML = 'You\'re not on today\'s leaderboard yet. <button class="lnk" type="button" id="lbAdd">Add your name</button>';
    $('lbAdd').onclick = () => openNameCard('join', day, entry);
  }
  async function lbSubmit(day, entry) {
    const msg = $('lbJoinMsg');
    msg.textContent = "Posting to today's leaderboard…";
    try { await lbPost(day, { n: lbName, ...entry }); await lbShowRank(day); } catch (e) {
      msg.innerHTML = 'Couldn\'t reach the leaderboard. <button class="lnk" type="button" id="lbRetry">Try again</button>';
      $('lbRetry').onclick = () => lbSubmit(day, entry);
    }
  }
  async function lbShowRank(day) {
    const msg = $('lbJoinMsg');
    msg.textContent = "Checking today's leaderboard…";
    try {
      const rows = await lbFetch(day);
      const i = rows.findIndex((r) => r.pid === lbPid());
      msg.innerHTML = i < 0 ? "You're on today's leaderboard." : `You're <b>#${i + 1}</b> of ${rows.length} on today's leaderboard.`;
    } catch (e) { msg.textContent = "You're on today's leaderboard."; }
  }

  /* Name card: one dedicated step for joining the board (mode "join", with the
     result about to be posted shown as a preview row) and for renaming later. */
  let nameCtx = null;
  function renderNamePreview() {
    const n = cleanName($('nameInput').value);
    const ln = $('namePreview').querySelector('.ln');
    ln.textContent = n || 'Your name';
    ln.classList.toggle('ph', !n);
  }
  function openNameCard(mode, day, entry) {
    const join = mode === 'join';
    $('nameTitle').textContent = join ? 'Sign your word' : 'Change your name';
    $('nameText').textContent = join
      ? "Pick a name to post today's result. Everyone who solves today's word is ranked by marbles used, then time."
      : 'This is the name other players see next to your result.';
    $('nameSave').textContent = join ? 'Post to leaderboard' : 'Save name';
    $('nameSkip').textContent = join ? 'Not now' : 'Cancel';
    const pv = $('namePreview');
    pv.hidden = !entry;
    if (entry) {
      pv.querySelector('.ls').textContent = entry.s;
      pv.querySelector('.lt').textContent = fmtTime(entry.t);
    }
    $('nameInput').value = lbName;
    $('nameInput').classList.remove('shake');
    renderNamePreview();
    openModal($('nameModal'));
    nameCtx = { mode, day, entry };
    setTimeout(() => $('nameInput').focus(), 60);
  }
  $('nameInput').addEventListener('input', () => { $('nameInput').classList.remove('shake'); renderNamePreview(); });
  $('nameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('nameInput');
    const n = cleanName(input.value);
    if (!n) { input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake'); input.focus(); return; }
    const ctx = nameCtx;
    if (!ctx) return;
    lbSetName(n);
    closeModal($('nameModal'));
    if (ctx.mode === 'join') {
      if (ctx.day === dayNumber()) lbSubmit(ctx.day, ctx.entry);
      return;
    }
    if (lbGet(LB_POSTED_KEY) === String(ctx.day)) {
      try { const db = await lbDb(); await withTimeout(db.ref(`pathword/daily/${ctx.day}/${lbPid()}/n`).set(n), LB_TIMEOUT); } catch (err) { toast("Couldn't update your name", true); }
    }
    openLeaderboard(lbAgo);
  });
  $('lbBtn').addEventListener('click', () => openLeaderboard());
  $('lbJoinOpen').addEventListener('click', () => openLeaderboard());
  document.querySelectorAll('.lb-tab').forEach((t) => t.addEventListener('click', () => openLeaderboard(Number(t.dataset.ago))));

  /* ---------------- Modals ---------------- */
  function openModal(m) { m.classList.add('show'); }
  function closeModal(m) {
    m.classList.remove('show');
    if (m.id === 'endModal') clearInterval(countdownTimer);
    if (m.id === 'nameModal') nameCtx = null;
    if (m.id === 'rulesModal') {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
      if (readyPending) showReady();
    }
  }
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (m.id === 'readyModal') return;
      if (e.target === m || e.target.closest('.x-close') || e.target.closest('[data-close]')) closeModal(m);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.show:not(#readyModal)').forEach(closeModal);
  });
  // A card that scrolls grows a scrollbar under the pinned x; --sbw shifts the x left of it.
  const sbObs = new ResizeObserver((es) => es.forEach(({ target: w }) =>
    w.parentElement.style.setProperty('--sbw', `${w.offsetWidth - w.clientWidth}px`)));
  document.querySelectorAll('.win-wrap > .win').forEach((w) => sbObs.observe(w));

  // How to play deck
  const slides = [...document.querySelectorAll('#rulesModal .slide')];
  let slideAt = 0;
  function showSlide(n) {
    slideAt = n;
    slides.forEach((s, k) => s.classList.toggle('on', k === n));
    $('deckDots').innerHTML = slides.map((_, k) => `<button type="button" class="${k === n ? 'on' : ''}" aria-label="Slide ${k + 1}"></button>`).join('');
    $('deckDots').querySelectorAll('button').forEach((b, k) => b.addEventListener('click', () => showSlide(k)));
    $('deckNext').textContent = n === slides.length - 1 ? 'Got it — let’s play' : 'Next';
  }
  $('deckNext').addEventListener('click', () => {
    if (slideAt < slides.length - 1) showSlide(slideAt + 1);
    else closeModal($('rulesModal'));
  });
  $('helpBtn').addEventListener('click', () => { showSlide(0); openModal($('rulesModal')); });
  $('statsBtn').addEventListener('click', () => { renderStats('sm', loadStats(), null); openModal($('statsModal')); });
  $('gamesBtn').addEventListener('click', () => openModal($('gamesModal')));
  $('copyBtn').addEventListener('click', shareResult);
  $('shareBtn').addEventListener('click', () => { if (game.status !== 'playing') showEnd(); });

  function buildArchive() {
    const today = Math.max(0, dayNumber());
    const saves = readJSON(SAVE_KEY, {});
    const list = $('archList');
    list.innerHTML = '';
    for (let day = today; day >= 0; day--) {
      const s = saves[day];
      let status = '<span class="as"></span>';
      if (s && s.entry === entryForDay(day) && s.picks.length) {
        const g = E.replay(E.parse(s.entry), s.picks);
        status = g.status === 'won' ? '<span class="as done">✓</span>' : g.status === 'lost' ? '<span class="as">✕</span>' : '<span class="as">▶</span>';
      }
      const row = document.createElement('button');
      row.className = `arch-row${day === activeDay ? ' current' : ''}`;
      const dstr = dateForDay(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const badge = day === today ? '<span class="atoday">Today</span>' : '';
      row.innerHTML = `<span class="an">#${day + 1}</span><span class="ad">${dstr}</span>${badge}${status}`;
      row.addEventListener('click', () => { closeModal($('archiveModal')); loadDay(day); });
      list.appendChild(row);
    }
  }
  $('calBtn').addEventListener('click', () => { buildArchive(); openModal($('archiveModal')); });

  /* ---------------- Boot ---------------- */
  function loadDay(day) {
    if (game) { pauseClock(); saveState(); }
    activeDay = day;
    entry = entryForDay(day);
    puzzle = E.parse(entry);
    if (new URLSearchParams(location.search).has('debug')) console.info(`Pathword #${day + 1}: ${puzzle.answer}, path columns ${puzzle.path.join(' ')}`);
    const save = loadSave(day);
    game = E.replay(puzzle, save.picks);
    timeBase = save.time || 0;
    runningSince = 0;
    busy = false;
    $('marbleMeter').dataset.lost = game.lost;
    renderHeader();
    buildBoard();
    renderBoard();
    renderHud();
    idleMessage();
    requestAnimationFrame(() => {
      // a fresh board keeps its marble up top until Start
      if (game.status === 'playing' && game.picks.length === 0) setMarble(geo().above(geo().start().x), false);
      else placeMarble();
    });
    if (game.status !== 'playing') setTimeout(showEnd, 700);
    else if ($('rulesModal').classList.contains('show')) readyPending = true;
    else showReady();
  }

  // Ready card (as in Cascade): the board waits, blurred, until the player says go.
  let readyPending = false;
  function showReady() {
    readyPending = false;
    const today = activeDay === dayNumber();
    const s = loadStats();
    const resuming = game.picks.length > 0 || timeBase > 0;
    $('readyTitle').textContent = today ? 'Today\'s word' : `Word #${activeDay + 1}`;
    $('readySub').textContent = `Puzzle #${activeDay + 1} · ${E.MARBLES} marbles · ${E.ROWS} shelves`;
    $('rdPlayed').textContent = s.played;
    $('rdStreak').textContent = s.currentStreak;
    $('rdMax').textContent = s.maxStreak;
    $('readyText').textContent = resuming
      ? `You're on shelf ${game.row + 1} with ${E.MARBLES - game.lost} marble${E.MARBLES - game.lost === 1 ? '' : 's'} left. The clock picks up where you left off.`
      : 'Drop the marble through all six shelves. Use as few marbles as you can; the clock starts when you begin.';
    $('readyStart').textContent = resuming ? 'Resume' : 'Start';
    openModal($('readyModal'));
  }
  $('readyStart').addEventListener('click', () => {
    $('readyModal').classList.remove('show');
    startClock();
    if (game.status === 'playing' && game.picks.length === 0 && !marble.classList.contains('on')) {
      setTimeout(() => { void spawnMarble(); }, pace(250));
    }
  });

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!busy) placeMarble(); }, 120);
  });

  function boot() {
    const asked = new URLSearchParams(location.search).get('date');
    const day = asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) ? Math.max(0, dayForKey(asked)) : Math.max(0, dayNumber());
    let seen = false;
    try { seen = !!localStorage.getItem(SEEN_KEY); } catch (e) { /* ignore */ }
    showSlide(0);
    if (!seen) openModal($('rulesModal')); // first visit: rules, then the ready card
    loadDay(day);
    void markVisit();
    $('loading').classList.add('gone');
    setTimeout(() => $('loading').remove(), 300);
  }

  requestAnimationFrame(() => setTimeout(boot, 30));
})();
