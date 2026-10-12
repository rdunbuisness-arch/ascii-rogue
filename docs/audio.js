/* ASCII Rogue Inc - GameAudio v2: self-contained Web Audio synth (no files, no deps).
 * Exposed as window.GameAudio (NOT window.Audio, which stays the built-in constructor).
 * API (v1-compatible): start(), stop(), toggleMute() -> bool, isMuted(), names, sfx(name)
 * v3 adds: setVolume(0-1) (persisted), getVolume(); 3 rotating loops per state. v2 adds: setState('build'|'wave'|'boss') (bar-quantized, short crossfade), getState(), duck(amount, seconds)
 * victory/defeat are jingles: they stop the loop; call start() again to resume music.
 */
(function (w) {
  'use strict';
  var KEY = 'asciirogue_muted', VKEY = 'asciirogue_volume', LOOKAHEAD = 0.12, TICK = 25, MASTER = 0.5, MUSIC = 1.0, vol = 0.8;
  var vi = 0, rotLen = 16, limiter;
  var ctx = null, master, comp, music, evt, xf, duckBus, sfxBus, noiseBuf, timer = null;
  var wantPlay = false, playing = false, step = 0, bar = 0, nextT = 0, lastSfx = {}, muted = false;
  var state = 'build', pending = null, V = null, P = 1, S = null;
  try { muted = w.localStorage.getItem(KEY) === '1'; var sv = parseFloat(w.localStorage.getItem(VKEY)); if (sv >= 0 && sv <= 1) vol = sv; } catch (e) {}
  function mgain() { return muted ? 0 : MASTER * vol; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12) * P; }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function chance(p) { return Math.random() < p; }
  function tri(r, maj) { return [r, r + (maj ? 4 : 3), r + 7]; }

  // chord roots (MIDI, around A3) per bar; m=minor M=major. A = 4 bars, B = 4 bars.
  // Per state: 3 alternate loops (same tempo per state), rotating every 8 or 16 bars.
  // chord roots (MIDI, around A3) per bar; m=minor M=major. A/B = 4-bar progressions.
  // bass: off|roll|gallop|oct8 ; hat: off|8|16 ; lp = lead rhythm sets ; mel = lead chord-tone contour
  var LP0 = [[0, 3, 6, 10], [0, 2, 4, 8, 11, 14], [0, 6, 8, 12]], LP1 = [[0, 4, 6, 7, 12], [2, 5, 8, 10, 14], [0, 3, 8, 11]], LP2 = [[0, 2, 3, 6, 8, 10, 12, 14], [0, 1, 4, 6, 9, 12], [0, 3, 6, 9, 12, 14]];
  var M0 = [2, 1, 3, 2, 1, 0], M1 = [0, 1, 2, 3, 4, 3], M2 = [3, 2, 0, 2, 4, 1];
  function T(o) { return o; }
  var TRACKS = {
    build: [
      T({ bpm: 138, A: ['57m', '53M', '55M', '52m'], B: ['50m', '53M', '57m', '55M'], kick: [0, 4, 8, 12], snare: [4, 12], hat: 'off', bass: 'off', arpVol: 0.055, lead: 0.045, leadIn: 'B', clap: 0.18, sat: 0, lp: LP0, mel: M0 }),
      T({ bpm: 138, A: ['50m', '46M', '48M', '45m'], B: ['53M', '48M', '50m', '52M'], kick: [0, 4, 8, 12, 14], snare: [4, 12], hat: '8', bass: 'gallop', arpVol: 0.05, lead: 0.05, leadIn: 'AB', clap: 0.16, sat: 0, lp: LP1, mel: M1 }),
      T({ bpm: 138, A: ['57m', '57m', '53M', '55M'], B: ['52m', '53M', '55M', '57m'], kick: [0, 6, 8, 12], snare: [4, 12], hat: 'off', bass: 'oct8', arpVol: 0.06, lead: 0.04, leadIn: 'A', clap: 0.2, sat: 0, lp: LP0, mel: M2 })
    ],
    wave: [
      T({ bpm: 156, A: ['57m', '53M', '55M', '52m'], B: ['57m', '55M', '53M', '52M'], kick: [0, 4, 8, 12], snare: [4, 12], hat: '16', bass: 'roll', arpVol: 0.07, lead: 0.07, leadIn: 'AB', clap: 0.32, sat: 1, lp: LP0, mel: M0 }),
      T({ bpm: 156, A: ['52m', '48M', '50M', '47M'], B: ['45m', '48M', '52m', '50M'], kick: [0, 4, 8, 11, 12], snare: [4, 12], hat: '16', bass: 'gallop', arpVol: 0.065, lead: 0.075, leadIn: 'AB', clap: 0.3, sat: 1, lp: LP1, mel: M1 }),
      T({ bpm: 156, A: ['57m', '55M', '57m', '60M'], B: ['53M', '55M', '52M', '57m'], kick: [0, 4, 8, 12], snare: [4, 10, 12], hat: '8', bass: 'oct8', arpVol: 0.07, lead: 0.07, leadIn: 'B', clap: 0.34, sat: 1, lp: LP2, mel: M2 })
    ],
    boss: [
      T({ bpm: 172, A: ['50m', '51M', '50m', '48M'], B: ['46M', '48M', '50m', '51M'], kick: [0, 4, 8, 10, 12], snare: [4, 12], hat: '16', bass: 'roll', arpVol: 0.075, lead: 0.09, leadIn: 'AB', clap: 0.4, sat: 2, lp: LP0, mel: M0 }),
      T({ bpm: 172, A: ['50m', '50m', '51M', '49M'], B: ['46M', '45M', '51M', '50m'], kick: [0, 3, 4, 8, 11, 12], snare: [4, 12], hat: '16', bass: 'gallop', arpVol: 0.07, lead: 0.09, leadIn: 'AB', clap: 0.42, sat: 2, lp: LP2, mel: M1 }),
      T({ bpm: 172, A: ['55m', '56M', '55m', '53m'], B: ['51M', '53m', '55m', '56M'], kick: [0, 2, 4, 8, 10, 12], snare: [4, 12], hat: '16', bass: 'oct8', arpVol: 0.075, lead: 0.085, leadIn: 'AB', clap: 0.4, sat: 2, lp: LP1, mel: M2 })
    ]
  };
  function cur() { return TRACKS[state][vi % TRACKS[state].length]; }
  var ARPS = [[0, 1, 2, 3, 2, 1], [0, 2, 1, 3], [0, 1, 2, 1, 3, 2, 3, 1], [3, 2, 1, 0]];

  function init() {
    if (ctx) return true;
    var AC = w.AudioContext || w.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 3; comp.knee.value = 12; comp.attack.value = 0.004; comp.release.value = 0.2;
    limiter = ctx.createDynamicsCompressor();   // brickwall-ish safety limiter
    limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.08;
    master = ctx.createGain(); master.gain.value = mgain();
    music = ctx.createGain(); music.gain.value = MUSIC;   // music level
    evt = ctx.createGain();                                // event ducking / jingle stop
    xf = ctx.createGain();                                 // state crossfade
    duckBus = ctx.createGain();                            // sidechain from kick
    sfxBus = S = ctx.createGain(); sfxBus.gain.value = 1.1;
    duckBus.connect(xf); xf.connect(evt); evt.connect(music); music.connect(comp);
    sfxBus.connect(comp); comp.connect(master); master.connect(limiter); limiter.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  function unlock() {
    if (!init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (wantPlay && !playing) begin();
  }
  w.addEventListener('pointerdown', unlock, true);
  w.addEventListener('keydown', unlock, true);
  w.addEventListener('touchstart', unlock, true);

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(dest, type, f, t, dur, vol, f2, a, det) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f * P, t);
    if (det) o.detune.value = det;
    if (f2) o.frequency.exponentialRampToValueAtTime(f2 * P, t + dur);
    env(g, t, a || 0.003, vol, dur); o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function note(dest, type, m, t, dur, vol, det) { return tone(dest, type, 440 * Math.pow(2, (m - 69) / 12), t, dur, vol, 0, 0.003, det); }
  function noise(dest, t, dur, vol, ftype, ff, q) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = ftype || 'highpass'; f.frequency.value = ff * P || 6000; f.Q.value = q || 0.7;
    env(g, t, 0.002, vol, dur); s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  // ---------- music ----------
  function kick(t, sd, hard) {
    tone(music, 'sine', hard ? 170 : 150, t, 0.22, 0.95, 40);
    tone(music, 'square', 900, t, 0.012, 0.22, 200);
    duckBus.gain.cancelScheduledValues(t);
    duckBus.gain.setValueAtTime(0.18, t);
    duckBus.gain.linearRampToValueAtTime(1, t + sd * 3);
  }
  function snare(t, v) { noise(duckBus, t, 0.13, v, 'bandpass', 1900, 0.8); tone(duckBus, 'triangle', 230, t, 0.07, v * 0.8, 120); }
  function newBarVariation(trk, sec) {
    return { arp: ARPS[rnd(ARPS.length)], oct: chance(0.25) ? 12 : 0, ghost: chance(0.5), bassAlt: chance(0.35),
      lead: trk.leadIn.indexOf(sec) >= 0 && chance(0.85), leadPat: rnd(trk.lp.length), kickExtra: chance(0.3) ? 14 : -1 };
  }
  function scheduleStep(i, t, sd) {
    var trk = cur(), sec = bar < rotLen / 2 ? 'A' : 'B', prog = trk[sec], c = prog[bar % 4];
    var root = parseInt(c, 10), ch = tri(root, c.slice(-1) === 'M');
    var fill4 = bar % 4 === 3 && i >= 12, fill8 = bar % 8 === 7 && i >= 8;
    if (i === 0) V = newBarVariation(trk, sec);
    // drums
    if (fill8 && trk.sat > 0) { snare(t, 0.12 + (i - 8) * 0.04); if (i % 2 === 0) kick(t, sd, true); }
    else if (fill4) { if (i % 2 === 0 || trk.sat) snare(t, 0.2 + (i - 12) * 0.05); if (i === 12) kick(t, sd); }
    else {
      if (trk.kick.indexOf(i) >= 0 || i === V.kickExtra) kick(t, sd, trk.sat === 2);
      if (trk.snare.indexOf(i) >= 0) snare(t, trk.clap);
      if (trk.hat === '16') noise(duckBus, t, i % 4 === 2 ? 0.05 : 0.02, i % 4 === 2 ? 0.22 : 0.09, 'highpass', 8000);
      else if (trk.hat === '8' && i % 2 === 0) noise(duckBus, t, i % 4 === 2 ? 0.05 : 0.02, i % 4 === 2 ? 0.2 : 0.08, 'highpass', 8000);
      else if (i % 4 === 2) noise(duckBus, t, 0.04, 0.18, 'highpass', 8000);
      else if (V.ghost && i % 2 === 1) noise(duckBus, t, 0.015, 0.05, 'highpass', 9500);
    }
    if (bar % 8 === 0 && i === 0) noise(duckBus, t, 0.9, 0.12, 'highpass', 4000); // crash on phrase start
    // bass
    var b = root - 24;
    if (trk.bass === 'roll') { if (i % 4 !== 0) note(duckBus, 'square', b + (i % 4 === 2 ? 12 : 0) + (V.bassAlt && i === 14 ? 7 : 0), t, sd * 0.8, 0.2); }
    else if (trk.bass === 'gallop') { if (i % 4 !== 1) note(duckBus, 'square', b + (i % 4 === 3 ? 12 : 0) + (V.bassAlt && i >= 12 ? 5 : 0), t, sd * 0.7, 0.2); }
    else if (trk.bass === 'oct8') { if (i % 2 === 0) note(duckBus, 'square', b + (i % 4 === 2 ? 12 : 0) + (V.bassAlt && i === 14 ? 3 : 0), t, sd * 1.2, 0.2); }
    else if (i % 4 === 2 || (V.bassAlt && i % 4 === 3)) note(duckBus, 'square', b + (i === 10 ? 12 : 0), t, sd * 1.4, 0.2);
    if (trk.sat === 2 && i % 2 === 1) note(duckBus, 'sawtooth', b, t, sd * 0.6, 0.06, 8);
    // arp
    var a = V.arp[(bar * 16 + i) % V.arp.length], n = a === 3 ? ch[0] + 12 : ch[a];
    if (!(trk.sat === 0 && sec === 'A' && i % 2 === 1)) note(duckBus, 'square', n + 12 + V.oct, t, sd * 0.7, trk.arpVol);
    // lead
    if (V.lead) {
      var pats = trk.lp, tones = [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12], ln = trk.mel.map(function (d) { return tones[d]; });
      var k = pats[V.leadPat].indexOf(i);
      if (k >= 0) { note(duckBus, trk.sat ? 'sawtooth' : 'square', ln[(k + bar) % ln.length] + 12, t, sd * (trk.sat === 2 ? 2.2 : 1.6), trk.lead, trk.sat ? 7 : 0);
        if (trk.sat === 2) note(duckBus, 'sawtooth', ln[(k + bar) % ln.length] + 12, t, sd * 2.2, trk.lead * 0.6, -9); }
    }
  }
  function tick() {
    while (nextT < ctx.currentTime + LOOKAHEAD) {
      if (step === 0 && !pending && bar >= rotLen) rotate();
      var sd = 60 / cur().bpm / 4;
      if (step === 0 && pending) {               // bar-quantized switch + crossfade dip
        state = pending; pending = null; vi = rnd(TRACKS[state].length); rotLen = chance(0.5) ? 8 : 16; sd = 60 / cur().bpm / 4;
        xf.gain.cancelScheduledValues(nextT); xf.gain.setValueAtTime(0.35, nextT); xf.gain.linearRampToValueAtTime(1, nextT + 0.3);
        bar = 0;
      }
      if (step === 15 && pending) { xf.gain.setValueAtTime(1, nextT); xf.gain.linearRampToValueAtTime(0.35, nextT + sd); }
      scheduleStep(step, nextT, sd);
      nextT += sd; step++; if (step >= 16) { step = 0; bar++; }
    }
  }
  function rotate() { var n = TRACKS[state].length; vi = (vi + 1 + rnd(n - 1)) % n; rotLen = chance(0.5) ? 8 : 16; bar = 0; }
  function begin() {
    playing = true; step = 0; bar = 0; rotLen = 8; nextT = ctx.currentTime + 0.06;
    evt.gain.cancelScheduledValues(ctx.currentTime); evt.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
    xf.gain.value = 1; if (timer) clearInterval(timer);
    timer = setInterval(tick, TICK); tick();
  }
  function halt() { playing = false; if (timer) clearInterval(timer); timer = null; }
  function duck(amount, secs) {
    if (!ctx) return; var t = ctx.currentTime, g = evt.gain;
    if (!playing) return;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(1 - amount, t + 0.03);
    g.setValueAtTime(1 - amount, t + secs); g.linearRampToValueAtTime(1, t + secs + 0.4);
  }
  function jingleStop() {   // fade loop out quickly and stop scheduling
    wantPlay = false; if (!ctx) return; var t = ctx.currentTime;
    evt.gain.cancelScheduledValues(t); evt.gain.setValueAtTime(evt.gain.value, t); evt.gain.linearRampToValueAtTime(0.0001, t + 0.25);
    halt();
  }

  // ---------- sfx: fn(t, variant) ; P = pitch jitter ----------
  // S = sfx bus (assigned in init)
  var SFX = {
    disruptor_shot: [3, function (t, v) { tone(S, v === 2 ? 'sawtooth' : 'square', [1800, 2200, 1500][v], t, 0.08, 0.22, [300, 500, 250][v]); noise(S, t, 0.03, 0.12, 'highpass', 5000); }],
    robot_die: [3, function (t, v) { noise(S, t, 0.22, 0.42, 'lowpass', [1500, 1100, 2000][v]); tone(S, 'sawtooth', [400, 320, 500][v], t, 0.24, 0.26, 40); tone(S, 'square', 1200, t + 0.02, 0.05, 0.12, v === 1 ? 600 : 2400); }],
    paywall_place: [2, function (t, v) { tone(S, 'square', 330, t, 0.06, 0.26); tone(S, 'square', v ? 495 : 660, t + 0.06, 0.1, 0.26); noise(S, t, 0.04, 0.18, 'bandpass', 2500, 2); }],
    paywall_blocked: [2, function (t, v) { tone(S, 'square', v ? 990 : 880, t, 0.03, 0.2); noise(S, t, 0.06, 0.25, 'bandpass', 3200, 3); tone(S, 'triangle', 200, t, 0.08, 0.25, 120); }],
    build_done: [2, function (t, v) { (v ? [523, 784, 659, 1047] : [523, 659, 784, 1047]).forEach(function (f, k) { tone(S, 'square', f, t + k * 0.06, 0.12, 0.2); }); }],
    upgrade_done: [2, function (t, v) { [587, 740, 880, 1175, 1480].forEach(function (f, k) { tone(S, v ? 'triangle' : 'square', f, t + k * 0.045, 0.1, 0.18); }); tone(S, 'sine', 1760, t + 0.25, 0.3, 0.12); }],
    intern_trained: [3, function (t, v) { tone(S, 'triangle', [880, 784, 988][v], t, 0.08, 0.32); tone(S, 'triangle', [1319, 1175, 1480][v], t + 0.08, 0.15, 0.32); }],
    human_strike: [3, function (t, v) { noise(S, t, 0.05, 0.35, 'bandpass', [1200, 900, 1600][v], 1.5); tone(S, 'triangle', [260, 220, 300][v], t, 0.06, 0.3, 90); }],
    unicorn_hit: [3, function (t, v) { [1568, 1976, 2349].forEach(function (f, k) { tone(S, 'sine', f * [1, 1.12, 0.94][v], t + k * 0.03, 0.12, 0.13); }); noise(S, t, 0.05, 0.12, 'highpass', 7000); }],
    robot_spawn: [3, function (t, v) { tone(S, 'square', [200, 240, 180][v], t, 0.05, 0.05, [400, 480, 360][v]); }],
    base_hit: [2, function (t, v) { duck(0.6, 0.3); tone(S, 'sine', v ? 100 : 120, t, 0.3, 0.75, 35); noise(S, t, 0.2, 0.45, 'lowpass', 800); tone(S, 'sawtooth', 90, t, 0.2, 0.22, 60); }],
    supply_blocked: [2, function (t, v) { tone(S, 'square', v ? 300 : 330, t, 0.08, 0.18); tone(S, 'square', v ? 225 : 247, t + 0.1, 0.14, 0.18); }],
    not_enough_compute: [2, function (t, v) { [0, 0.09].forEach(function (d) { tone(S, 'sawtooth', v ? 180 : 165, t + d, 0.07, 0.16, 140); }); }],
    button_click: [3, function (t, v) { tone(S, 'square', [1400, 1600, 1250][v], t, 0.015, 0.1); }],
    wave_warning: [2, function (t, v) { duck(0.5, 0.8); for (var k = 0; k < 2; k++) tone(S, 'triangle', v ? 740 : 660, t + k * 0.3, 0.22, 0.25, v ? 520 : 440); }],
    wave_start: [2, function (t, v) { duck(0.65, 0.6); for (var k = 0; k < 3; k++) { tone(S, 'sawtooth', 600, t + k * 0.18, 0.15, 0.26, v ? 1200 : 1000); tone(S, 'square', 450, t + k * 0.18, 0.15, 0.11, 750); } }],
    boss: [1, function (t) { duck(0.8, 1.2); tone(S, 'sawtooth', 110, t, 1.2, 0.35, 55, 0.02, 10); tone(S, 'sawtooth', 165, t, 1.2, 0.2, 82, 0.02, -10); noise(S, t, 1.0, 0.2, 'lowpass', 500); }],
    victory: [2, function (t, v) { jingleStop();
      var mel = v ? [[523, 0], [659, .12], [784, .24], [1047, .36], [988, .48], [1047, .6], [1319, .72]] : [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .54], [1047, .66], [1319, .9]];
      mel.forEach(function (p, k) { var last = k === mel.length - 1; tone(S, 'square', p[0], t + p[1], last ? 0.8 : 0.14, 0.22); tone(S, 'triangle', p[0] / 2, t + p[1], last ? 0.8 : 0.15, 0.22); });
      [0, .36, .72].forEach(function (d) { tone(S, 'sine', 150, t + d, 0.2, 0.6, 45); }); }],
    defeat: [2, function (t, v) { jingleStop();
      [[440, 0], [415, .25], [392, .5], [370, .75]].forEach(function (p, k) { var f = p[0] * (v ? 0.89 : 1); tone(S, 'sawtooth', f, t + p[1], k === 3 ? 1.1 : 0.24, 0.2, k === 3 ? f / 4 : 0); tone(S, 'triangle', f / 2, t + p[1], 0.24, 0.2); });
      tone(S, 'sine', 80, t + 0.75, 1.0, 0.5, 30); noise(S, t + 0.75, 0.7, 0.22, 'lowpass', 600); }]
  };
  var RL = { robot_spawn: 0.08, button_click: 0.03 };

  var GameAudio = {
    start: function () { wantPlay = true; if (ctx && ctx.state === 'running' && !playing) begin(); },
    stop: function () { wantPlay = false; halt(); },
    toggleMute: function () {
      muted = !muted; try { w.localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(mgain(), ctx.currentTime, 0.02); }
      return muted;
    },
    isMuted: function () { return muted; },
    setVolume: function (v) {
      v = Math.max(0, Math.min(1, +v)); if (isNaN(v)) return vol; vol = v;
      try { w.localStorage.setItem(VKEY, String(vol)); } catch (e) {}
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(mgain(), ctx.currentTime, 0.02); }
      return vol;
    },
    getVolume: function () { return vol; },
    setState: function (s) {
      if (!TRACKS.hasOwnProperty(s)) return state;
      if (!playing) { if (s !== state) vi = rnd(TRACKS[s].length); state = s; pending = null; }        // not running: takes effect on start()
      else if (s !== state) pending = s; else pending = null;
      if (s === 'boss') GameAudio.sfx('boss');
      return s;
    },
    getState: function () { return pending || state; },
    duck: function (a, s) { try { duck(a == null ? 0.6 : a, s == null ? 0.5 : s); } catch (e) {} },
    sfx: function (name) {
      try {
        var d = SFX[name]; if (!d || muted || !ctx || ctx.state !== 'running') return;
        var now = ctx.currentTime;
        if (lastSfx[name] !== undefined && now - lastSfx[name] < (RL[name] || 0.04)) return;
        lastSfx[name] = now;
        P = (name === 'victory' || name === 'defeat') ? 1 : 1 + (Math.random() * 2 - 1) * 0.04;
        d[1](now + 0.005, rnd(d[0]));
      } catch (e) {} finally { P = 1; }
    },
    names: Object.keys(SFX)
  };
  w.GameAudio = GameAudio;
})(window);
