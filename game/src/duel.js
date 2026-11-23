// duel.js — the Emberfall duel as a pure state machine.
//
// No DOM lives here: every change returns a list of events describing what
// happened ({type:'damage', who, amount, blocked}, {type:'poisonTick', ...})
// so render.js can animate exactly what the rules did, and ai.js can plan
// against the same state the player sees.
//
// Rules in one breath: both duelists start at 30 life. On your turn you get
// 3 energy, draw 2 cards, and your block from last turn falls away. Poison
// ticks at the start of the poisoned duelist's turn, straight past block,
// then fades by 1. Playing a card of the same suit as your previous card
// this turn resonates: +1 to each damage, block, poison and heal effect.

export const MAX_HP = 30;
export const TURN_ENERGY = 3;
export const OPENING_HAND = 5;
export const TURN_DRAW = 2;

function freshDuelist(deck) {
  return {
    hp: MAX_HP, maxHp: MAX_HP,
    block: 0, poison: 0,
    energy: 0, deck, hand: [], discard: [],
  };
}

export function createDuel(rng, playerDeck, enemyDeck) {
  const state = {
    rng,
    turn: 1,
    phase: 'player', // 'player' | 'enemy' | 'won' | 'lost'
    player: freshDuelist(shuffled(playerDeck, rng)),
    enemy: freshDuelist(shuffled(enemyDeck, rng)),
    lastSuit: { player: null, enemy: null },
    intent: null, // set by ai.js before each player turn
    log: [],
  };
  drawCards(state, 'player', OPENING_HAND);
  drawCards(state, 'enemy', OPENING_HAND);
  beginTurn(state, 'player', true);
  return state;
}

function shuffled(cards, rng) {
  const pile = [...cards];
  for (let i = pile.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pile[i], pile[j]] = [pile[j], pile[i]];
  }
  return pile;
}

export function other(who) {
  return who === 'player' ? 'enemy' : 'player';
}

export function drawCards(state, who, count) {
  const me = state[who];
  const events = [];
  for (let n = 0; n < count; n++) {
    if (me.deck.length === 0 && me.discard.length > 0) {
      me.deck = shuffled(me.discard, state.rng);
      me.discard = [];
      events.push({ type: 'reshuffle', who });
    }
    if (me.deck.length === 0) break;
    me.hand.push(me.deck.pop());
    events.push({ type: 'draw', who });
  }
  return events;
}

// Poison first (it ignores block), then the old block falls, energy refills.
// Returns the events of the poison tick; a duelist killed by poison ends
// the duel before they can act.
export function beginTurn(state, who, first = false) {
  const me = state[who];
  const events = [];
  state.lastSuit[who] = null;
  if (me.poison > 0) {
    const amount = me.poison;
    me.hp -= amount;
    me.poison -= 1;
    events.push({ type: 'poisonTick', who, amount });
    if (me.hp <= 0) {
      me.hp = 0;
      state.phase = who === 'player' ? 'lost' : 'won';
      events.push({ type: 'death', who });
      return events;
    }
  }
  me.block = 0;
  me.energy = TURN_ENERGY;
  if (!first) events.push(...drawCards(state, who, TURN_DRAW));
  return events;
}

// Play hand[index] for `who`. Returns null when the play is illegal (not
// your phase, not enough energy, bad index) or the list of events it made.
export function playCard(state, who, index) {
  if (state.phase !== who) return null;
  const me = state[who];
  const foe = state[other(who)];
  const card = me.hand[index];
  if (!card || card.cost > me.energy) return null;

  me.energy -= card.cost;
  me.hand.splice(index, 1);
  me.discard.push(card);

  const resonant = state.lastSuit[who] !== null && state.lastSuit[who] === card.suit;
  state.lastSuit[who] = card.suit;

  const events = [{ type: 'play', who, card, resonant }];
  for (const effect of card.effects) {
    const amount = effect.amount + (resonant && effect.kind !== 'draw' ? 1 : 0);
    if (effect.kind === 'damage') {
      const blocked = Math.min(foe.block, amount);
      foe.block -= blocked;
      foe.hp -= amount - blocked;
      events.push({ type: 'damage', who: other(who), amount: amount - blocked, blocked });
      if (foe.hp <= 0) {
        foe.hp = 0;
        state.phase = who === 'player' ? 'won' : 'lost';
        events.push({ type: 'death', who: other(who) });
        break;
      }
    } else if (effect.kind === 'block') {
      me.block += amount;
      events.push({ type: 'block', who, amount });
    } else if (effect.kind === 'poison') {
      foe.poison += amount;
      events.push({ type: 'poison', who: other(who), amount });
    } else if (effect.kind === 'heal') {
      const healed = Math.min(amount, me.maxHp - me.hp);
      me.hp += healed;
      events.push({ type: 'heal', who, amount: healed });
    } else if (effect.kind === 'draw') {
      events.push(...drawCards(state, who, amount));
    }
  }
  return events;
}

// A readable one-line summary of a card's strongest effect, for the log.
export function headline(card) {
  const main = card.effects[0];
  const label = {
    damage: `hits for ${main.amount}`,
    block: `blocks ${main.amount}`,
    poison: `${main.amount} poison`,
    draw: `draws ${main.amount}`,
    heal: `heals ${main.amount}`,
  }[main.kind];
  return `${card.name} — ${label}`;
}
