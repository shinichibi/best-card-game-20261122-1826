// shots.js — screenshot staging. The maker's screenshots are real renders
// of this game's own screens; the ?shot= scenes below simply arrange a
// duel into the moment worth photographing (a rich mid-duel table, the
// victory, the defeat) using the game's own state and renderer, the same
// way the kit's starter stages its scenes. Normal play never passes a
// ?shot= parameter and never sees this file's setups.

import { planIntent } from './ai.js';

// A mid-duel tableau: two turns in, poison ticking on Vesk, a wall up on
// the knight, both hands full, energy left to spend.
export function stageBattle(state) {
  const p = state.player;
  const e = state.enemy;
  e.hp = 19;
  e.poison = 3;
  p.hp = 24;
  p.block = 6;
  p.energy = 2;
  state.turn = 3;
  state.log.push('Vesk reels — poison bites for 3.');
  state.log.push('You play Thorn Kiss — 3 poison. The court holds its breath.');
  state.intent = planIntent(state);
}

// The moment after the killing blow: Vesk at nothing, the knight bloodied
// but standing. Phase 'won' is all the victory overlay reads.
export function stageVictory(state) {
  state.player.hp = 11;
  state.enemy.hp = 0;
  state.enemy.poison = 0;
  state.turn = 6;
  state.phase = 'won';
  state.log.push('Inferno Brand — hits for 17. Vesk falls.');
}

// The moment after the knight falls: Vesk hurt, but the one left standing.
export function stageDefeat(state) {
  state.player.hp = 0;
  state.enemy.hp = 14;
  state.turn = 5;
  state.phase = 'lost';
  state.log.push('Flame Lance — hits for 11. The knight falls.');
}
