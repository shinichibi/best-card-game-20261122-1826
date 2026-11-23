// main.js — Emberfall's conductor: screens, turns, animation timing.
//
// The duel itself lives in duel.js, Vesk's mind in ai.js, the pictures in
// render.js; this file owns the flow between them — title screen to table
// to victory or defeat — and the pacing: every play is rendered, sounded
// and floated before the next one begins, so a turn reads like a story.

import { buildPlayerDeck, buildEnemyDeck, CARDS } from './cards.js';
import { createDuel, beginTurn, playCard, headline } from './duel.js';
import { planIntent, takeTurn } from './ai.js';
import { renderTable, floatText, shake, showStageCard, setLog, startEmbers, cardElement } from './render.js';
import { sfx, unlock } from './audio.js';
import { stageBattle, stageVictory, stageDefeat } from './shots.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A small seeded RNG so staged screenshot scenes deal the same hands
// every time; real duels seed it from the clock.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || (Date.now() % 100000));

const tableRoot = document.querySelector('#table');
const titleScreen = document.querySelector('#title-screen');
const endScreen = document.querySelector('#end-screen');

let state = null;
let busy = false;

function renderAll() {
  renderTable(tableRoot, state, { onCard: playFromHand, onEndTurn: endTurn, busy });
}

// Speak an event list: floaters over the stage, a sound per kind, a shake
// when a hit lands hard. This is the only place events become theatre.
function animateEvents(events, actorName) {
  for (const ev of events) {
    if (ev.type === 'damage') {
      floatText(tableRoot, null, ev.blocked > 0 ? `-${ev.amount} (${ev.blocked} blocked)` : `-${ev.amount}`, 'dmg');
      if (ev.amount >= 8) shake(tableRoot, ev.amount >= 14);
      sfx.damage(ev.amount >= 10);
    } else if (ev.type === 'block') {
      floatText(tableRoot, null, `+${ev.amount} block`, 'blk');
      sfx.block();
    } else if (ev.type === 'poison') {
      floatText(tableRoot, null, `+${ev.amount} poison`, 'psn');
      sfx.poison();
    } else if (ev.type === 'poisonTick') {
      floatText(tableRoot, null, `-${ev.amount} poison`, 'psn');
      sfx.poison();
    } else if (ev.type === 'heal') {
      if (ev.amount > 0) floatText(tableRoot, null, `+${ev.amount}`, 'hel');
      sfx.heal();
    } else if (ev.type === 'draw') {
      sfx.draw();
    } else if (ev.type === 'play') {
      showStageCard(tableRoot, ev.card);
      if (ev.resonant) floatText(tableRoot, null, 'Resonance +1', 'res');
      sfx.play();
      setLog(tableRoot, state, `${actorName} plays ${headline(ev.card)}${ev.resonant ? ' — resonant!' : ''}`);
    }
  }
}

async function playFromHand(index) {
  if (busy || !state || state.phase !== 'player') return;
  const events = playCard(state, 'player', index);
  if (!events) return;
  busy = true;
  animateEvents(events, 'You');
  renderAll();
  busy = false;
  if (state.phase === 'won' || state.phase === 'lost') return finish();
  renderAll();
}

async function endTurn() {
  if (busy || !state || state.phase !== 'player') return;
  busy = true;
  sfx.turn();
  state.phase = 'enemy';
  setLog(tableRoot, state, 'Vesk takes his turn…');
  renderAll();
  await sleep(520);

  const tick = beginTurn(state, 'enemy');
  animateEvents(tick, 'Vesk');
  renderAll();
  if (state.phase === 'won' || state.phase === 'lost') return finish();
  await sleep(560);

  await takeTurn(state, async (events, card) => {
    animateEvents(events, 'Vesk');
    renderAll();
    await sleep(680);
  });
  if (state.phase === 'won' || state.phase === 'lost') return finish();

  state.turn += 1;
  state.phase = 'player';
  const opening = beginTurn(state, 'player');
  state.intent = planIntent(state);
  animateEvents(opening, 'You');
  setLog(tableRoot, state, opening.length && opening[0].type === 'poisonTick'
    ? `Poison bites you for ${opening[0].amount}. Your turn.`
    : 'Your turn. Vesk shows his intent.');
  busy = false;
  renderAll();
  if (state.phase === 'won' || state.phase === 'lost') return finish();
}

function finish() {
  busy = false;
  renderAll();
  const won = state.phase === 'won';
  setTimeout(() => showEnd(won), 650);
}

function showEnd(won) {
  if (won) sfx.win(); else sfx.lose();
  endScreen.hidden = false;
  endScreen.innerHTML = `
    <div class="end-card ${won ? 'won' : 'lost'}">
      <div class="end-kicker">${won ? 'The court is yours' : 'The court endures'}</div>
      <h2 class="end-title">${won ? 'VICTORY' : 'DEFEAT'}</h2>
      <p class="end-line">${won
        ? `Vesk's ashes scatter on the marble. You stand at ${state.player.hp} life after ${state.turn} turns.`
        : `The Ember Knight falls in turn ${state.turn}. Vesk keeps the court — this time.`}</p>
      <button class="big-button" id="again">Duel Again</button>
    </div>`;
  endScreen.querySelector('#again').addEventListener('click', () => {
    endScreen.hidden = true;
    startDuel(Date.now() % 100000);
  });
}

function startDuel(duelSeed) {
  const rng = mulberry32(duelSeed);
  state = createDuel(rng, buildPlayerDeck(), buildEnemyDeck());
  state.intent = planIntent(state);
  state.log.push('The duel begins. Vesk shows his intent.');
  busy = false;
  titleScreen.hidden = true;
  endScreen.hidden = true;
  tableRoot.hidden = false;
  renderAll();
}

// ---- title screen dressing: a fan of real cards ---------------------------

function dressTitle() {
  const fan = document.querySelector('#fan');
  const picks = ['infernoBrand', 'dawnMantle', 'briarHex'];
  picks.forEach((id, i) => {
    const el = cardElement({ id, ...CARDS[id] }, {});
    el.classList.add('fan-card');
    el.style.setProperty('--tilt', `${(i - 1) * 11}deg`);
    fan.appendChild(el);
  });
  document.querySelector('#begin').addEventListener('click', () => {
    unlock();
    startDuel(Date.now() % 100000);
  });
  const how = document.querySelector('#how');
  document.querySelector('#how-toggle').addEventListener('click', () => {
    how.hidden = !how.hidden;
  });
}

// ---- boot ------------------------------------------------------------------

startEmbers(document.querySelector('#embers'));
dressTitle();
window.addEventListener('pointerdown', unlock, { once: true });
window.addEventListener('keydown', (ev) => {
  if (!state || busy || state.phase !== 'player') return;
  if (ev.key >= '1' && ev.key <= '8') playFromHand(Number(ev.key) - 1);
  if (ev.key === ' ' || ev.key === 'Enter') {
    ev.preventDefault();
    endTurn();
  }
});

// Screenshot staging: ?shot=battle|victory|defeat deals a seeded duel and
// arranges the scene; ?shot=title (or nothing) is the ordinary game.
if (shot === 'battle' || shot === 'victory' || shot === 'defeat') {
  startDuel(seed);
  if (shot === 'battle') stageBattle(state);
  if (shot === 'victory') { stageVictory(state); showEnd(true); }
  if (shot === 'defeat') { stageDefeat(state); showEnd(false); }
  renderAll();
}
