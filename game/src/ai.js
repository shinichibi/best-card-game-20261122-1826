// ai.js — Vesk, the Ashen Warlock: how he plans, and what he shows you.
//
// Before each of your turns Vesk commits to an intent, shown above his
// portrait: the biggest thing his current hand lets him do next turn —
// a sword with the damage, a spike with the poison, a shield with the
// block, or a wave when he means to dig for cards. The intent is honest:
// it is computed from the hand he actually holds and every card in it is
// affordable on a fresh 3 energy, so you can counter what you see — wall
// up against a big sword, race him when he plans to dig.
//
// On his turn he plays greedily by score: lethal first, then whatever
// buys the most — damage at face value (less when your wall would eat
// it), poison worth more while the stack is small, block while he is
// bare, draws while his hand is thin, healing only when it lands.

import { playCard, TURN_ENERGY } from './duel.js';

// What Vesk will lead with next turn, from the hand he holds right now.
export function planIntent(state) {
  const byKind = { damage: null, poison: null, block: null, heal: null };
  for (const card of state.enemy.hand) {
    if (card.cost > TURN_ENERGY) continue;
    for (const effect of card.effects) {
      if (effect.kind === 'draw') continue;
      if (!byKind[effect.kind] || effect.amount > byKind[effect.kind].amount) {
        byKind[effect.kind] = { kind: effect.kind, amount: effect.amount, card };
      }
    }
  }
  return byKind.damage || byKind.poison || byKind.block || byKind.heal
    || { kind: 'draw', amount: 0, card: null };
}

function scoreCard(state, card) {
  const me = state.enemy;
  const foe = state.player;
  let score = 0;
  for (const effect of card.effects) {
    if (effect.kind === 'damage') {
      score += effect.amount;
      if (effect.amount - foe.block >= foe.hp) score += 50; // lethal
      else if (foe.block >= effect.amount) score -= effect.amount * 0.6; // wasted on a wall
    } else if (effect.kind === 'poison') {
      score += foe.poison < 5 ? effect.amount * 1.7 : effect.amount * 0.5;
    } else if (effect.kind === 'block') {
      score += me.block < 7 ? effect.amount * 0.85 : effect.amount * 0.25;
    } else if (effect.kind === 'draw') {
      score += me.hand.length <= 3 ? 4.5 : 2;
    } else if (effect.kind === 'heal') {
      score += me.hp <= me.maxHp - effect.amount ? effect.amount * 0.9 : 0.4;
    }
  }
  // Free cards are almost always worth playing; expensive ones must earn it.
  return score - card.cost * 0.4;
}

// Play Vesk's whole turn, one card at a time, awaiting onPlay(events, card)
// after each so the renderer can animate the plays in sequence. Stops when
// nothing in hand scores above zero or nothing is affordable.
export async function takeTurn(state, onPlay) {
  for (let guard = 0; guard < 20; guard++) {
    if (state.phase !== 'enemy') break;
    const me = state.enemy;
    let bestIndex = -1;
    let bestScore = 0;
    me.hand.forEach((card, index) => {
      if (card.cost > me.energy) return;
      const score = scoreCard(state, card);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    if (bestIndex < 0) break;
    const card = me.hand[bestIndex];
    const events = playCard(state, 'enemy', bestIndex);
    if (!events) break;
    if (onPlay) await onPlay(events, card);
    if (state.phase !== 'enemy') break;
  }
}
