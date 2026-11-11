// Checks the rules engine against every puzzle in the bank and prints how hard the
// game plays for three kinds of player.
//
//   node scripts/test-engine.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { self: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'public/js/engine.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'public/js/puzzles.js'), 'utf8'), ctx);
const E = ctx.self.PathwordEngine;
const puzzles = ctx.self.PATHWORD_PUZZLES.map((e) => JSON.parse(JSON.stringify(E.parse(e))));

// --- rules ---
for (const p of puzzles) {
  // walking the path straight wins with no misses
  const g = E.newGame();
  for (let r = 0; r < 6 && g.status === 'playing'; r++) {
    if (g.row !== r) continue; // a freefall already took this shelf
    assert.ok(E.pick(p, g, p.path[r]), `${p.answer}: path tap refused on shelf ${r}`);
  }
  assert.equal(g.status, 'won', p.answer);
  assert.equal(E.misses(g), 0);
  // exactly one tile per shelf spells the answer, and it's on the path
  p.grid.forEach((row, r) => assert.deepEqual(row.map((ch, c) => ch === p.answer[r] ? c : -1).filter((c) => c >= 0), [p.path[r]], `${p.answer} shelf ${r}`));
  // replay restores the same state
  const h = E.replay(p, g.picks);
  assert.equal(h.status, 'won');
}
// a miss tips toward the target and removes the uphill side
{
  const p = puzzles[0];
  const g = E.newGame();
  const t = p.path[0];
  const wrong = t === 0 ? 5 : 0;
  const ev = E.pick(p, g, wrong);
  assert.equal(ev[0].type, 'miss');
  assert.equal(ev[0].dir, t > wrong ? 1 : -1);
  assert.ok(!E.alive(g, 0).includes(wrong));
  assert.ok(E.alive(g, 0).includes(t));
  assert.equal(E.pick(p, g, wrong), null, 'a fallen tile cannot be picked');
}
// six misses lose
{
  const p = puzzles[1];
  let g = E.newGame(), guard = 0;
  while (g.status === 'playing' && guard++ < 50) {
    const a = E.alive(g, g.row);
    const wrong = a.find((c) => c !== p.path[g.row]);
    E.pick(p, g, wrong);
  }
  assert.equal(g.status, 'lost');
  assert.equal(g.lost, 6);
}
console.log(`rules ok on ${puzzles.length} puzzles`);

// --- balance ---
const words = fs.existsSync('/usr/share/dict/words')
  ? fs.readFileSync('/usr/share/dict/words', 'utf8').split('\n').filter((w) => /^[a-z]{6}$/.test(w)).map((w) => w.toUpperCase())
  : [];
function play(p, strat, R) {
  const g = E.newGame();
  while (g.status === 'playing') {
    const a = E.alive(g, g.row);
    let c;
    if (strat === 'random') c = a[Math.floor(R() * a.length)];
    else if (strat === 'halve') c = a[(a.length - 1) >> 1];
    else {
      // reader: knows the letters locked so far and guesses words that fit the board
      const r = g.row;
      const prefix = p.answer.slice(0, r);
      const votes = new Map();
      for (const w of words) {
        if (!w.startsWith(prefix)) continue;
        const cc = a.find((x) => p.grid[r][x] === w[r]);
        if (cc === undefined) continue;
        let ok = true;
        for (let k = r + 1; k < 6 && ok; k++) ok = p.grid[k].includes(w[k]);
        if (ok) votes.set(cc, (votes.get(cc) || 0) + 1);
      }
      const best = [...votes].sort((x, y) => y[1] - x[1])[0];
      c = best ? best[0] : a[(a.length - 1) >> 1];
    }
    E.pick(p, g, c);
  }
  return g;
}
let seed = 7;
const R = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
for (const strat of ['random', 'halve', ...(words.length ? ['reader'] : [])]) {
  let wins = 0, free = 0, miss = 0;
  for (const p of puzzles) {
    const g = play(p, strat, R);
    if (g.status === 'won') wins++;
    free += E.freefalls(g);
    miss += E.misses(g);
  }
  const n = puzzles.length;
  console.log(`${strat.padEnd(7)} wins ${(100 * wins / n).toFixed(0)}%  misses/game ${(miss / n).toFixed(1)}  freefalls/game ${(free / n).toFixed(1)}`);
}
