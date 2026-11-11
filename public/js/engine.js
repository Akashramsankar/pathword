/* Pathword — rules. No DOM here, so scripts/test-engine.mjs can run it in Node.

   Six shelves of six tiles. The hidden word takes one tile per shelf, top to bottom,
   and never reuses a column. The player drops a marble onto a tile:
     - right tile: it's a trapdoor. It opens, the marble falls to the next shelf, and
       the rest of that column below crumbles (the column can't be used again);
     - wrong tile: the shelf tips toward the right tile. The marble rolls off, taking
       the picked tile and every tile on the uphill side with it. One marble lost.
   A shelf left with one tile drops the marble straight through (a freefall, free).
   Six marbles; losing the sixth ends the game. */
(function (root) {
  'use strict';

  const ROWS = 6;
  const COLS = 6;
  const MARBLES = 6;

  /** "ANSWER" + 36 grid letters + 6 path columns -> puzzle object. */
  function parse(entry) {
    return {
      answer: entry.slice(0, 6),
      grid: Array.from({ length: ROWS }, (_, r) => entry.slice(6 + r * COLS, 6 + (r + 1) * COLS).split('')),
      path: entry.slice(42, 48).split('').map(Number),
    };
  }

  function newGame() {
    // gone[r][c]: the tile has left the board (tipped off or crumbled)
    return {
      row: 0,
      lost: 0,
      gone: Array.from({ length: ROWS }, () => Array(COLS).fill(false)),
      locked: [], // column locked on each shelf so far
      // per shelf: miss directions, the wrong columns picked, freefall
      shelves: Array.from({ length: ROWS }, () => ({ misses: [], wrong: [], free: false })),
      picks: [], // every column the player tapped, in order (the save format)
      status: 'playing', // 'playing' | 'won' | 'lost'
    };
  }

  const alive = (g, r) => {
    const out = [];
    for (let c = 0; c < COLS; c++) if (!g.gone[r][c] && !g.locked.includes(c)) out.push(c);
    return out;
  };

  /** Lock shelf g.row at column c and crumble the rest of that column. Returns the crumbled cells. */
  function lock(g, c) {
    const r = g.row;
    g.locked.push(c);
    const crumbled = [];
    for (let rr = r + 1; rr < ROWS; rr++) {
      if (!g.gone[rr][c]) { g.gone[rr][c] = true; crumbled.push([rr, c]); }
    }
    g.row++;
    return crumbled;
  }

  /** Freefalls while the current shelf has one tile left. Returns the events. */
  function settle(g) {
    const events = [];
    while (g.row < ROWS) {
      const a = alive(g, g.row);
      if (a.length !== 1) break;
      const r = g.row;
      g.shelves[r].free = true;
      const crumbled = lock(g, a[0]);
      events.push({ type: 'freefall', row: r, col: a[0], crumbled, state: snapshot(g) });
    }
    if (g.row === ROWS) { g.status = 'won'; events.push({ type: 'won', state: snapshot(g) }); }
    return events;
  }

  const snapshot = (g) => ({
    row: g.row,
    lost: g.lost,
    gone: g.gone.map((r) => r.slice()),
    locked: g.locked.slice(),
    shelves: g.shelves.map((s) => ({ misses: s.misses.slice(), wrong: s.wrong.slice(), free: s.free })),
    picks: g.picks.slice(),
    status: g.status,
  });

  /**
   * Drop the marble on column c of the current shelf.
   * Returns a list of events for the UI to animate, or null if the tap is not allowed.
   * Each event carries `state`: the board right after that event, so a chain
   * (miss -> freefall -> freefall) can be shown one step at a time.
   */
  function pick(puzzle, g, c) {
    if (g.status !== 'playing' || !alive(g, g.row).includes(c)) return null;
    g.picks.push(c);
    const r = g.row;
    const target = puzzle.path[r];
    const events = [];
    if (c === target) {
      const crumbled = lock(g, c);
      events.push({ type: 'hit', row: r, col: c, crumbled, state: snapshot(g) });
      return events.concat(settle(g));
    }
    const dir = target > c ? 1 : -1; // the shelf tips toward the right tile
    const fell = [];
    for (const cc of alive(g, r)) {
      if (dir > 0 ? cc <= c : cc >= c) { g.gone[r][cc] = true; fell.push(cc); }
    }
    g.lost++;
    g.shelves[r].misses.push(dir);
    g.shelves[r].wrong.push(c);
    if (g.lost >= MARBLES) g.status = 'lost';
    events.push({ type: 'miss', row: r, col: c, dir, fell, left: MARBLES - g.lost, state: snapshot(g) });
    if (g.status === 'lost') {
      events.push({ type: 'lost', state: snapshot(g) });
      return events;
    }
    return events.concat(settle(g));
  }

  /** Rebuild a game from its saved taps. */
  function replay(puzzle, picks) {
    const g = newGame();
    for (const c of picks || []) if (!pick(puzzle, g, c)) break;
    return g;
  }

  const misses = (g) => g.shelves.reduce((n, s) => n + s.misses.length, 0);
  const freefalls = (g) => g.shelves.filter((s) => s.free).length;

  root.PathwordEngine = { ROWS, COLS, MARBLES, parse, newGame, alive, pick, replay, misses, freefalls };
})(typeof self !== 'undefined' ? self : globalThis);
