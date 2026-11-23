// render.js — everything the eye sees: the table, the cards, the duelists.
//
// The table is DOM, not canvas: cards are real elements so they can lift,
// tilt and fly when played, and so their numbers stay crisp at any size.
// A small canvas behind the table drifts embers upward for mood. All art
// is inline SVG drawn for this game — the four suit icons, the two
// duelist portraits, the card-back sigil.

import { SUITS } from './cards.js';

// ---- suit icons (24x24 viewBox paths, drawn for Emberfall) ---------------

const ICONS = {
  flame: 'M12 2c1 4-3 5-3 8a3 3 0 0 0 6 0c0-1-.5-2-.5-2s3 1.5 3 5a5.5 5.5 0 0 1-11 0C6.5 8 10 6 12 2z',
  shield: 'M12 2l8 3v6c0 5-3.5 9.3-8 11C7.5 20.3 4 16 4 11V5z',
  spike: 'M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
  wave: 'M2 15c3-4 6-4 10 0s7 4 10 0v4c-3 3-7 3-10 0s-7-3-10 0zM2 8c3-4 6-4 10 0s7 4 10 0v3c-3-3-7-3-10 0S5 5 2 8z',
  sword: 'M4 20L16.5 7.5M14 4l6 6-3 1-4-4zM17 3l4 4-2 2-4-4z',
  skull: 'M12 3a7 7 0 0 1 7 7c0 3-2 4.5-3 5v3H8v-3c-1-.5-3-2-3-5a7 7 0 0 1 7-7z',
};

export function icon(name, size = 20, colour = 'currentColor') {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${colour}" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;
}

function portrait(who) {
  if (who === 'player') {
    // The Ember Knight: hood, ember sword, gold trim.
    return `<svg viewBox="0 0 120 120" class="portrait-svg" aria-hidden="true">
      <defs><linearGradient id="pg-cloak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a4a6b"/><stop offset="1" stop-color="#141c30"/></linearGradient>
      <linearGradient id="pg-blade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffd9a0"/><stop offset="1" stop-color="#ff7a3c"/></linearGradient></defs>
      <path d="M60 6 L96 108 L24 108 Z" fill="url(#pg-cloak)"/>
      <circle cx="60" cy="52" r="17" fill="#e8b98d"/>
      <path d="M43 50 a17 17 0 0 1 34 0 l0 -6 a22 22 0 0 0 -44 0 Z" fill="#232f4d"/>
      <rect x="86" y="18" width="6" height="62" rx="3" transform="rotate(24 89 49)" fill="url(#pg-blade)"/>
      <circle cx="60" cy="86" r="7" fill="#ff7a3c"/>
    </svg>`;
  }
  // Vesk, the Ashen Warlock: ash-grey hood, violet staff crystal.
  return `<svg viewBox="0 0 120 120" class="portrait-svg" aria-hidden="true">
    <defs><linearGradient id="pg-robe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a3a5e"/><stop offset="1" stop-color="#1c1428"/></linearGradient>
    <linearGradient id="pg-gem" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e3b3ff"/><stop offset="1" stop-color="#8b2fd6"/></linearGradient></defs>
    <path d="M60 4 L98 110 L22 110 Z" fill="url(#pg-robe)"/>
    <circle cx="60" cy="54" r="16" fill="#b9b3c9"/>
    <path d="M44 52 a16 16 0 0 1 32 0 l0 -10 a21 21 0 0 0 -42 0 Z" fill="#2a1e40"/>
    <circle cx="53" cy="54" r="2.6" fill="#c77dff"/><circle cx="67" cy="54" r="2.6" fill="#c77dff"/>
    <rect x="24" y="14" width="5" height="76" rx="2.5" transform="rotate(-18 26 52)" fill="#5e4a2f"/>
    <path d="M14 8 l5 10 l-5 10 l-5 -10 Z" fill="url(#pg-gem)"/>
  </svg>`;
}

function cardBack() {
  return `<div class="card card-back"><div class="back-sigil">${icon('flame', 34, '#ff9a5c')}</div></div>`;
}

// One face-up card element. `playable` adds the lift-and-glow affordance.
export function cardElement(card, { playable = false, small = false } = {}) {
  const suit = SUITS[card.suit];
  const el = document.createElement('div');
  el.className = `card suit-${card.suit}${small ? ' small' : ''}${playable ? ' playable' : ''}${card.rarity === 'rare' ? ' rare' : ''}`;
  el.style.setProperty('--suit', suit.colour);
  el.style.setProperty('--suit-deep', suit.deep);
  el.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-art">${icon(suit.gem, small ? 26 : 40, suit.colour)}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-text">${card.text}</div>
    <div class="card-suit-name">${icon(suit.gem, 11, suit.colour)} ${suit.name}</div>`;
  return el;
}

function hpBar(label, me, who) {
  const pct = Math.max(0, Math.round((me.hp / me.maxHp) * 100));
  const badges = [
    me.block > 0 ? `<span class="badge block">${icon('shield', 13, '#ffc94d')} ${me.block}</span>` : '',
    me.poison > 0 ? `<span class="badge poison">${icon('spike', 13, '#c77dff')} ${me.poison}</span>` : '',
  ].join('');
  return `<div class="duelist ${who}">
    <div class="portrait">${portrait(who)}</div>
    <div class="duelist-info">
      <div class="duelist-name">${label} ${badges}</div>
      <div class="hp-track"><div class="hp-fill ${who}" style="width:${pct}%"></div>
        <span class="hp-text">${me.hp} / ${me.maxHp}</span></div>
    </div></div>`;
}

const INTENT_ICON = { damage: 'sword', block: 'shield', poison: 'spike', draw: 'wave', heal: 'wave' };
const INTENT_WORD = { damage: 'strikes', block: 'walls up', poison: 'brews poison', draw: 'schemes', heal: 'mends' };

export function intentBadge(intent) {
  if (!intent) return '';
  const amount = intent.amount > 0 ? ` ${intent.amount}` : '';
  return `<div class="intent" title="Vesk intends to ${INTENT_WORD[intent.kind] || 'act'}">
    ${icon(INTENT_ICON[intent.kind] || 'sword', 15, '#ffd9a0')}
    <span>Intent: ${INTENT_WORD[intent.kind] || intent.kind}${amount}</span></div>`;
}

// Render the whole table from state. Hands are rebuilt each time; the
// animation helpers below layer motion on top of this static picture.
export function renderTable(root, state, { onCard, onEndTurn, busy }) {
  const p = state.player;
  const e = state.enemy;
  root.innerHTML = `
    <div class="topbar">
      <span class="brand">EMBERFALL</span>
      <span class="turn-label">Turn ${state.turn}</span>
      <span class="pile-label">Your deck ${p.deck.length} · discard ${p.discard.length}</span>
    </div>
    <section class="zone enemy-zone">
      ${hpBar('VESK, THE ASHEN WARLOCK', e, 'enemy')}
      ${intentBadge(state.intent)}
      <div class="hand enemy-hand">${e.hand.map(() => cardBack()).join('')}</div>
    </section>
    <section class="stage" id="stage">
      <div class="stage-card" id="stage-card"></div>
      <div class="log-line" id="log-line">${state.log[state.log.length - 1] || 'The duel begins.'}</div>
    </section>
    <section class="zone player-zone">
      ${hpBar('YOU, THE EMBER KNIGHT', p, 'player')}
      <div class="energy" title="Energy">${[0, 1, 2].map((i) =>
        `<span class="gem${i < p.energy ? ' lit' : ''}"></span>`).join('')}</div>
      <div class="hand player-hand" id="player-hand"></div>
      <button class="end-turn" id="end-turn" ${busy || state.phase !== 'player' ? 'disabled' : ''}>End Turn</button>
    </section>`;

  const hand = root.querySelector('#player-hand');
  p.hand.forEach((card, index) => {
    const el = cardElement(card, { playable: !busy && state.phase === 'player' && card.cost <= p.energy });
    el.addEventListener('click', () => onCard(index));
    hand.appendChild(el);
  });
  root.querySelector('#end-turn').addEventListener('click', onEndTurn);
  return root;
}

// ---- motion: floaters, shake, the stage card -----------------------------

export function floatText(root, anchor, text, cls) {
  const host = root.querySelector('#stage');
  if (!host) return;
  const el = document.createElement('div');
  el.className = `floater ${cls}`;
  el.textContent = text;
  el.style.left = `${38 + Math.random() * 24}%`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 1250);
}

export function shake(root, hard = false) {
  const stage = root.querySelector('#stage');
  if (!stage) return;
  stage.classList.remove('shake', 'shake-hard');
  void stage.offsetWidth;
  stage.classList.add(hard ? 'shake-hard' : 'shake');
}

export function showStageCard(root, card) {
  const slot = root.querySelector('#stage-card');
  if (!slot) return;
  slot.innerHTML = '';
  if (card) slot.appendChild(cardElement(card, { small: true }));
}

export function setLog(root, state, line) {
  state.log.push(line);
  const el = root.querySelector('#log-line');
  if (el) el.textContent = line;
}

// ---- the ember drift behind everything -----------------------------------

export function startEmbers(canvas) {
  const ctx = canvas.getContext('2d');
  const motes = Array.from({ length: 42 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.8 + Math.random() * 2.1,
    s: 0.02 + Math.random() * 0.06,
    drift: Math.random() * Math.PI * 2,
  }));
  function frame(t) {
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.y -= m.s / 100;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      const x = (m.x + Math.sin(t / 2400 + m.drift) * 0.012) * w;
      ctx.beginPath();
      ctx.arc(x, m.y * h, m.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 138, 61, 0.5)';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
