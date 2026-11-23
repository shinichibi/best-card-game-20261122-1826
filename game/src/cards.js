// cards.js — the Emberfall card catalogue.
//
// Every card belongs to one of four suits. A suit is told apart by colour,
// by the shape of its gem and by its icon, never by text alone:
//   ember — red-orange, a flame,   the suit of damage
//   aegis — gold,       a shield,  the suit of block
//   thorn — violet,     a spike,   the suit of poison
//   tide  — blue,       a wave,    the suit of drawing and healing
//
// A card's effects are a list, so a card can do two things at once
// (Spore Veil poisons and blocks). Resonance: playing a card of the same
// suit as the previous card you played this turn adds +1 to each of its
// damage, block, poison and heal effects.

export const SUITS = {
  ember: { name: 'Ember', colour: '#ff7a3c', deep: '#8f1d04', gem: 'flame' },
  aegis: { name: 'Aegis', colour: '#ffc94d', deep: '#7a4d00', gem: 'shield' },
  thorn: { name: 'Thorn', colour: '#c77dff', deep: '#3d1160', gem: 'spike' },
  tide: { name: 'Tide', colour: '#4dc3ff', deep: '#0b3d66', gem: 'wave' },
};

// kind: 'damage' hits the other duelist, 'block' shields the player of the
// card, 'poison' stacks on the other duelist, 'draw' draws cards, 'heal'
// restores the player of the card.
export const CARDS = {
  emberSlash: {
    name: 'Ember Slash', suit: 'ember', cost: 1, rarity: 'common',
    effects: [{ kind: 'damage', amount: 6 }],
    text: 'Deal 6 damage.',
  },
  flameLance: {
    name: 'Flame Lance', suit: 'ember', cost: 2, rarity: 'common',
    effects: [{ kind: 'damage', amount: 11 }],
    text: 'Deal 11 damage.',
  },
  cinderSpark: {
    name: 'Cinder Spark', suit: 'ember', cost: 0, rarity: 'common',
    effects: [{ kind: 'damage', amount: 3 }],
    text: 'Deal 3 damage. Free to play.',
  },
  infernoBrand: {
    name: 'Inferno Brand', suit: 'ember', cost: 3, rarity: 'rare',
    effects: [{ kind: 'damage', amount: 17 }],
    text: 'Deal 17 damage.',
  },
  aegisWall: {
    name: 'Aegis Wall', suit: 'aegis', cost: 1, rarity: 'common',
    effects: [{ kind: 'block', amount: 7 }],
    text: 'Gain 7 block.',
  },
  bulwark: {
    name: 'Bulwark', suit: 'aegis', cost: 2, rarity: 'common',
    effects: [{ kind: 'block', amount: 13 }],
    text: 'Gain 13 block.',
  },
  wardSigil: {
    name: 'Ward Sigil', suit: 'aegis', cost: 0, rarity: 'common',
    effects: [{ kind: 'block', amount: 3 }],
    text: 'Gain 3 block. Free to play.',
  },
  dawnMantle: {
    name: 'Dawn Mantle', suit: 'aegis', cost: 2, rarity: 'rare',
    effects: [{ kind: 'block', amount: 9 }, { kind: 'heal', amount: 2 }],
    text: 'Gain 9 block and heal 2.',
  },
  thornKiss: {
    name: 'Thorn Kiss', suit: 'thorn', cost: 1, rarity: 'common',
    effects: [{ kind: 'poison', amount: 3 }],
    text: 'Apply 3 poison.',
  },
  briarHex: {
    name: 'Briar Hex', suit: 'thorn', cost: 2, rarity: 'common',
    effects: [{ kind: 'poison', amount: 5 }],
    text: 'Apply 5 poison.',
  },
  sporeVeil: {
    name: 'Spore Veil', suit: 'thorn', cost: 1, rarity: 'rare',
    effects: [{ kind: 'poison', amount: 2 }, { kind: 'block', amount: 4 }],
    text: 'Apply 2 poison and gain 4 block.',
  },
  tideCall: {
    name: 'Tide Call', suit: 'tide', cost: 1, rarity: 'common',
    effects: [{ kind: 'draw', amount: 2 }],
    text: 'Draw 2 cards.',
  },
  moonwell: {
    name: 'Moonwell', suit: 'tide', cost: 2, rarity: 'common',
    effects: [{ kind: 'heal', amount: 8 }],
    text: 'Heal 8.',
  },
  swiftCurrent: {
    name: 'Swift Current', suit: 'tide', cost: 0, rarity: 'common',
    effects: [{ kind: 'draw', amount: 1 }],
    text: 'Draw 1 card. Free to play.',
  },
  secondWind: {
    name: 'Second Wind', suit: 'tide', cost: 2, rarity: 'rare',
    effects: [{ kind: 'draw', amount: 2 }, { kind: 'heal', amount: 3 }],
    text: 'Draw 2 cards and heal 3.',
  },
};

// The player's 24-card deck: a spread of all four suits so most hands hold
// a real choice — hit now, wall up, start a poison clock, or dig for more.
export function buildPlayerDeck() {
  return [
    'emberSlash', 'emberSlash', 'emberSlash',
    'flameLance', 'flameLance',
    'cinderSpark', 'cinderSpark',
    'infernoBrand',
    'aegisWall', 'aegisWall', 'aegisWall',
    'bulwark',
    'wardSigil', 'wardSigil',
    'thornKiss', 'thornKiss',
    'briarHex',
    'sporeVeil',
    'tideCall', 'tideCall',
    'moonwell',
    'swiftCurrent', 'swiftCurrent',
    'secondWind',
  ].map((id) => ({ id, ...CARDS[id] }));
}

// Vesk's 24-card deck: the same court cards, a little less top-end — his
// Inferno Brand is an Ember Slash instead, and he leans harder on poison.
export function buildEnemyDeck() {
  return [
    'emberSlash', 'emberSlash', 'emberSlash', 'emberSlash',
    'flameLance', 'flameLance',
    'cinderSpark', 'cinderSpark',
    'aegisWall', 'aegisWall', 'aegisWall',
    'bulwark',
    'wardSigil',
    'thornKiss', 'thornKiss', 'thornKiss',
    'briarHex',
    'sporeVeil',
    'tideCall', 'tideCall',
    'moonwell',
    'swiftCurrent', 'swiftCurrent',
    'dawnMantle',
  ].map((id) => ({ id, ...CARDS[id] }));
}
