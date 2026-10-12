/* ASCII Rogue Inc - GameAudio: self-contained Web Audio synth (no files, no deps).
 * Exposed as window.GameAudio (NOT window.Audio, which stays the built-in constructor).
 * API: GameAudio.start(), .stop(), .toggleMute() -> bool muted (persisted), .sfx(name), .isMuted()
 * SFX: disruptor_shot robot_die paywall_place build_done intern_trained base_hit wave_start victory defeat
 */
(function (w) {
  'use strict';
  var KEY = 'asciirogue_muted', BPM = 156, STEP = 60 / BPM / 4, LOOKAHEAD = 0.12, TICK = 25;
  var ctx = null, master, comp, music, duck, sfxBus, noiseBuf, timer = null, wantPlay = false, playing = false;
  var step = 0, nextT = 0, lastSfx = {}, muted = false;
  try { muted = w.localStorage.getItem(KEY) === '1'; } catch (e) {}
  // A minor: Am F G Em, one bar each (16 steps)
  var CH = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], ROOT = [33, 29, 31, 28];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function init() {
    if (ctx) return true;
    var AC = w.AudioContext || w.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.35;
    music = ctx.createGain(); music.gain.value = 0.55;
    duck = ctx.createGain(); sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
    duck.connect(music); music.connect(comp); sfxBus.connect(comp); comp.connect(master); master.connect(ctx.destination);
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
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(dest, type, f, t, dur, vol, f2, a) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, a || 0.003, vol, dur); o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function noise(dest, t, dur, vol, ftype, ff, q) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = ftype || 'highpass'; f.frequency.value = ff || 6000; f.Q.value = q || 0.7;
    env(g, t, 0.002, vol, dur); s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  function kick(t) {
    tone(music, 'sine', 150, t, 0.22, 1.0, 40);
    tone(music, 'square', 900, t, 0.012, 0.25, 200);
    // sidechain-style duck of everything on the duck bus
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(0.15, t);
    duck.gain.linearRampToValueAtTime(1, t + STEP * 3);
  }
  function scheduleStep(s, t) {
    var bar = Math.floor(s / 16) % 4, i = s % 16, ch = CH[bar];
    if (i % 4 === 0) kick(t);
    if (i % 4 === 2) noise(duck, t, 0.05, 0.25, 'highpass', 7000);
    else if (i % 2 === 1) noise(duck, t, 0.02, 0.1, 'highpass', 9000);
    if (i === 4 || i === 12) { noise(duck, t, 0.14, 0.35, 'bandpass', 1800, 0.8); tone(duck, 'triangle', 220, t, 0.08, 0.3, 120); }
    // pulse bass: offbeat 16ths, octave bounce
    if (i % 4 !== 0) tone(duck, 'square', hz(ROOT[bar] + (i % 4 === 2 ? 12 : 0)), t, STEP * 0.8, 0.22);
    // arpeggio: up-down over chord + octave
    var arp = [0, 1, 2, 3, 2, 1][s % 6], n = arp === 3 ? ch[0] + 12 : ch[arp];
    tone(duck, 'square', hz(n + 12), t, STEP * 0.7, 0.07);
    // lead stab every 2 bars
    if (bar % 2 === 1 && (i === 0 || i === 3 || i === 6)) tone(duck, 'sawtooth', hz(ch[2] + 12), t, STEP * 1.5, 0.08);
  }
  function tick() {
    while (nextT < ctx.currentTime + LOOKAHEAD) { scheduleStep(step, nextT); step = (step + 1) % 64; nextT += STEP; }
  }
  function begin() {
    playing = true; step = 0; nextT = ctx.currentTime + 0.06;
    timer = setInterval(tick, TICK); tick();
  }

  var SFX = {
    disruptor_shot: function (t) { tone(sfxBus, 'square', 1800, t, 0.09, 0.3, 300); noise(sfxBus, t, 0.03, 0.15, 'highpass', 5000); },
    robot_die: function (t) { noise(sfxBus, t, 0.25, 0.5, 'lowpass', 1500); tone(sfxBus, 'sawtooth', 400, t, 0.25, 0.3, 40); tone(sfxBus, 'square', 1200, t + 0.02, 0.06, 0.15, 2400); },
    paywall_place: function (t) { tone(sfxBus, 'square', 330, t, 0.06, 0.3); tone(sfxBus, 'square', 660, t + 0.06, 0.1, 0.3); noise(sfxBus, t, 0.04, 0.2, 'bandpass', 2500, 2); },
    build_done: function (t) { [523, 659, 784, 1047].forEach(function (f, k) { tone(sfxBus, 'square', f, t + k * 0.06, 0.12, 0.22); }); },
    intern_trained: function (t) { tone(sfxBus, 'triangle', 880, t, 0.08, 0.35); tone(sfxBus, 'triangle', 1319, t + 0.08, 0.15, 0.35); },
    base_hit: function (t) { tone(sfxBus, 'sine', 120, t, 0.3, 0.8, 35); noise(sfxBus, t, 0.2, 0.5, 'lowpass', 800); tone(sfxBus, 'sawtooth', 90, t, 0.2, 0.25, 60); },
    wave_start: function (t) { for (var k = 0; k < 3; k++) { tone(sfxBus, 'sawtooth', 600, t + k * 0.18, 0.15, 0.28, 1000); tone(sfxBus, 'square', 450, t + k * 0.18, 0.15, 0.12, 750); } },
    victory: function (t) { [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .54], [1047, .66]].forEach(function (p, k) { tone(sfxBus, 'square', p[0], t + p[1], k === 5 ? 0.6 : 0.14, 0.25); tone(sfxBus, 'triangle', p[0] / 2, t + p[1], 0.15, 0.25); }); },
    defeat: function (t) { [[440, 0], [415, .25], [392, .5], [370, .75]].forEach(function (p, k) { tone(sfxBus, 'sawtooth', p[0], t + p[1], k === 3 ? 0.9 : 0.24, 0.22, k === 3 ? 110 : 0); }); noise(sfxBus, t + 0.75, 0.6, 0.25, 'lowpass', 600); }
  };

  var GameAudio = {
    start: function () { wantPlay = true; if (ctx && ctx.state === 'running' && !playing) begin(); },
    stop: function () { wantPlay = false; playing = false; if (timer) clearInterval(timer); timer = null; },
    toggleMute: function () {
      muted = !muted; try { w.localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
      if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(muted ? 0 : 0.35, ctx.currentTime, 0.02); }
      return muted;
    },
    isMuted: function () { return muted; },
    sfx: function (name) {
      try {
        var fn = SFX[name]; if (!fn || muted || !ctx || ctx.state !== 'running') return;
        var now = ctx.currentTime;
        if (lastSfx[name] !== undefined && now - lastSfx[name] < 0.04) return;
        lastSfx[name] = now; fn(now + 0.005);
      } catch (e) {}
    },
    names: Object.keys(SFX)
  };
  w.GameAudio = GameAudio;
})(window);
