// main.ts — Emberfall's entry point for the make.fun grader.
//
// The game itself is a static site under game/ (open game/index.html in a
// browser and play). This program's whole job is to package that site,
// plus the maker's screenshots, into the output directory and stamp the
// package with the kit's dossier builder, so the judges receive exactly
// the files that were played and photographed here.
//
// Two care points, both learned from the kit's rules:
//  - the output directory itself is never deleted — it may be a mount
//    the grader owns; only stale files inside it are cleared away.
//  - every copy is a plain byte copy, so running this twice produces a
//    byte-identical dossier.

import {
  cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const here = import.meta.dirname;
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
for (const name of readdirSync(out)) {
  rmSync(join(out, name), { recursive: true, force: true });
}

for (const folder of ['game', 'screenshots']) {
  const from = join(here, folder);
  if (existsSync(from)) cpSync(from, join(out, folder), { recursive: true });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
