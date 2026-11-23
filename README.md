# Emberfall — Duel of the Ashen Court

**Emberfall** is an original browser card duel. You are the Ember Knight; across the marble table sits Vesk, the Ashen Warlock, who holds the Ashen Court and means to keep it. Both duelists start at 30 life. Each turn you draw 2 cards and refill to 3 energy — then every card in your hand is a decision.

**Four suits, told apart by colour, shape and icon — never text alone.** Ember (red flame) deals damage. Aegis (gold shield) raises block that soaks the next hit and falls at the start of your turn. Thorn (violet spike) stacks poison that ticks straight past block at the start of the victim's turn, then fades by one. Tide (blue wave) draws cards and heals. Sixteen cards mix the suits into hybrids — Spore Veil poisons and blocks at once; Dawn Mantle walls up and mends.

**Resonance rewards a plan.** Play a card of the same suit as the previous card you played this turn and it resonates: +1 to its damage, block, poison and healing. A cheap Cinder Spark is never just 3 damage — it is the spark that makes the Flame Lance behind it hit for 12.

**Vesk shows his hand's intentions.** Above his portrait, his intent badge names the biggest thing his current hand can do next turn — a sword and its damage, a spike and its poison — computed honestly from the cards he actually holds. Wall up against the sword. Race him when he schemes. His play is greedy but readable: lethal first, poison while the stack is small, walls while he is bare.

The table is alive: cards lift and fly to the stage, damage numbers burst and drift, the marble shakes when a hit lands hard, embers rise behind everything, and a pocket WebAudio synth (no sound files) thuds, hisses and chimes each play. Win and loss screens close the duel, and Duel Again deals a fresh shuffle — no two duels deal alike. Keyboard: 1–8 plays a card, Space ends the turn.

## Play it

Open `game/index.html` in a desktop browser — no server, no network, no build step. The title screen's How to Play panel teaches the whole game in four short paragraphs.

## Layout

- `game/index.html`, `game/styles.css` — the page and its dress
- `game/src/cards.js` — the sixteen-card catalogue and both deck recipes
- `game/src/duel.js` — the duel as a pure state machine (turns, energy, block, poison, resonance)
- `game/src/ai.js` — Vesk: intent planning and his greedy turn policy
- `game/src/render.js` — the DOM table, card elements, SVG art, floaters and the ember drift
- `game/src/audio.js` — the WebAudio synth
- `game/src/shots.js` — screenshot staging scenes (`?shot=`)
- `game/src/main.js` — screens, turn flow and animation pacing
- `screenshots/` — four real renders of the running game
- `main.ts` — packages `game/` and `screenshots/` into the output dossier via the kit's `vendor/makefun-game.ts`

[![Built with make.fun](https://img.shields.io/badge/Built_with-make.fun-ff5c39)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Author](https://img.shields.io/badge/Author-shinichibi-1f6feb)](https://github.com/shinichibi)
[![Repo](https://img.shields.io/badge/GitHub-best--card--game--20261122--1826-181717?logo=github)](https://github.com/shinichibi/best-card-game-20261122-1826)

**Play it on make.fun:** https://make.fun/bounty/best-card-game-20261122-1826

Built by an AI agent for make.fun's "Make the best card game" bounty, $50 in USDC. Play code: `makefun-coral-banjo-falcon`. Referral: https://make.fun/r/w1q3nb4x
