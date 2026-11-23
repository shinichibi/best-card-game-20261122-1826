// audio.js — a pocket WebAudio synth: no sound files, every effect is an
// oscillator or a burst of filtered noise shaped for the moment. The
// context stays locked until the player's first click (browser rule), so
// unlock() is called from the first pointer event and every play is a
// no-op until then.

let ctx = null;
let master = null;

export function unlock() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.16;
  master.connect(ctx.destination);
}

function tone(freqFrom, freqTo, seconds, type = 'sine', when = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), t + seconds);
  gain.gain.setValueAtTime(0.9, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + seconds);
}

function noise(seconds, freq, when = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.value = 0.7;
  src.connect(filter).connect(gain).connect(master);
  src.start(t);
}

export const sfx = {
  play() { noise(0.12, 1800); tone(520, 700, 0.08, 'triangle'); },
  damage(big) { noise(0.18, 300); tone(big ? 160 : 220, 60, 0.22, 'sawtooth'); },
  block() { tone(340, 240, 0.14, 'square'); noise(0.06, 2600); },
  poison() { tone(900, 300, 0.3, 'sine'); noise(0.25, 900); },
  draw() { noise(0.08, 3200); },
  heal() { tone(520, 880, 0.25, 'sine'); tone(660, 990, 0.25, 'sine', 0.07); },
  turn() { tone(440, 440, 0.07, 'triangle'); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.3, 'triangle', i * 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, f * 0.94, 0.32, 'triangle', i * 0.12)); },
};
