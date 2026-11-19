/* ======================= EASY SETTINGS ======================= */

// 7:00 PM London time, Thursday 19 November 2026.
// London is on GMT (UTC+0) in November, so 19:00 London = 19:00Z.
const TARGET_ISO = '2026-11-19T19:00:00Z';
// When the progress bar, wanted level and sunset start (9 AM London).
const START_ISO = '2026-11-19T09:00:00Z';
// Back to work: Monday 23 November, 9 AM London. Drives the "freedom remaining" clock.
const END_ISO = '2026-11-23T09:00:00Z';

// Live stream (optional). Fill in ONE of these and a stream panel appears.
//   twitch: just the channel name, e.g. 'sherif'  -> embeds his stream after 7 PM
//   url:    any full link (YouTube, Kick, ...)    -> shows a "watch live" button
// To try it without editing, add ?twitch=channelname to the page address.
const STREAM = { twitch: '', url: '' };

// Messages on the radio ticker at the bottom. Edit freely.
const TICKER = [
  'BREAKING: LOCAL MAN HAS WAITED 13 YEARS FOR TONIGHT',
  'WEATHER: 100% CHANCE OF NOT LEAVING THE HOUSE',
  'TRAFFIC: ALL ROADS LEAD TO THE COUCH',
  'REMINDER: HYDRATE BETWEEN HEISTS',
  'TONIGHT\'S FORECAST: CHAOS, WITH A CHANCE OF SNACKS',
  'THIS ONE GOES OUT TO SHERIF, FROM NADZ, WHO LOVES HIM',
  'DEEPBLUE SPOTTED HEADING TO VICE CITY. APPROACH WITH SNACKS',
  'AUTO-REPLY: OUT OF OFFICE UNTIL MONDAY. DO NOT DISTURB',
  'FOUR DAYS. NO WORK. ONE CITY.',
  'PHONE ON SILENT. WORLD ON HOLD.',
  "RUMOUR HAS IT THIS SITE HAS CHEAT CODES. TRY TYPING YOUR WIFE'S NAME",
  "PUBLIC SERVICE ANNOUNCEMENT: DON'T FORGET YOUR WIFE NADZ",
  "OFFICIAL: NADA HAS APPROVED ALL-WEEKEND GAMING. NO TAKEBACKS*",
  "*TERMS AND CONDITIONS APPLY. SEE PERMISSION SLIP",
  "REMINDER: CALL NADZ BETWEEN MISSIONS",
  "LONG DISTANCE, SHORT MISSIONS: TEXT YOUR WIFE",
  "EXPERTS AGREE: DEEPBLUE HAS THE BEST WIFE IN THE WORLD",
];

// Little "text messages from your wife" that pop up now and then. Edit freely.
const WIFE_TEXTS = [
  "Don't forget you have a wife 👀💍",
  "Proud of you 🥹 Now go be a menace in Vice City 😈🌴",
  "Don't forget to eat and have hydration breaks! 🍕💧",
  "Reminder: your wife is the real main character 💅✨",
  "Miss you 🥺 Wish I was on the couch next to you 🛋️❤️",
  "Stream for me whenever you want to. I'll be watching 👀📺",
  "Don't forget to say goodnight before you sleep 🌙😘",
  "Who's your favourite person in Vice City? 🤔 Wrong. It's me 😌💖",
  "Have the best weekend habiby 🎮🔥 I mean it ❤️",
];

// The text from Nadz that pops up when he unlocks each cheat code. Edit freely.
const CHEAT_TEXTS = {
  NADZ: "You found the secret code. Hi, I love you ♡",
  DEEPBLUE: "That's right. DEEPBLUE. Best gamer out there 🎮👑",
  MONEY: "Rich man now? Great, you're paying for our next dinner 💸",
  WANTED: "Five stars?! What did you do. Actually, don't tell me 🚨",
  BOOM: "Fireworks for my favourite gamer. Not long to go now 🎆",
  ALEXANDRIA: "Greetings from Alexandria! Wish you were here, or me there ♡",
  ALL: "ALL 6 cheats found 🏆 Officially the best player I know. Now call me ♡",
};

/* ============================================================= */

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Preview mode: add ?test=15 to the address to run the finale 15 seconds from now.
let TARGET = Date.parse(TARGET_ISO);
let START = Date.parse(START_ISO);
let END = Date.parse(END_ISO);
const testSecs = parseInt(params.get('test'), 10);
if (testSecs > 0) { const shift = Date.now() + testSecs * 1000 - TARGET; START = Date.now(); TARGET += shift; END += shift; }

const twitch = (params.get('twitch') || STREAM.twitch || '').trim();
const streamUrl = STREAM.url || (twitch ? 'https://www.twitch.tv/' + encodeURIComponent(twitch) : '');

/* ---------- sound: a little synthwave radio station (browsers only allow it after a click) ---------- */
let audio = null, soundOn = false, master, sfxBus, musicBus, musicFilter, noiseBuf, schedTimer = null;
const BPM = 98, S16 = 60 / BPM / 4;
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am  F  C  G
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let nextTime = 0, step = 0;

function initAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  audio = new AC();
  master = audio.createDynamicsCompressor();
  const out = audio.createGain(); out.gain.value = .9;
  master.connect(out).connect(audio.destination);
  sfxBus = audio.createGain(); sfxBus.connect(master);
  musicBus = audio.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
  musicFilter = audio.createBiquadFilter(); musicFilter.type = 'lowpass'; musicFilter.frequency.value = 2200; musicFilter.connect(musicBus);
  noiseBuf = audio.createBuffer(1, audio.sampleRate * .5, audio.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return true;
}
function voice(freq, t, dur, type, vol, dest) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + .05);
}
function noise(t, dur, vol, hp) {
  const s = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
  s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f).connect(g).connect(musicBus); s.start(t); s.stop(t + dur + .02);
}
function kick(t) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
  g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
  o.connect(g).connect(musicBus); o.start(t); o.stop(t + .32);
}
function playStep(s, t) {
  const i = s % 16, ch = CHORDS[Math.floor(s / 16) % 4];
  if (i === 0) ch.forEach((n) => voice(mtof(n), t, S16 * 16, 'triangle', .07, musicFilter));   // pad
  if (i % 2 === 0) voice(mtof(ch[0] - 24), t, S16 * 1.8, 'sawtooth', .22, musicFilter);        // bass
  voice(mtof(ch[[0, 1, 2, 1][i % 4]] + 12), t, S16 * 1.4, 'square', .045, musicFilter);        // arpeggio
  if (i % 4 === 0) kick(t);
  if (i === 4 || i === 12) noise(t, .18, .32, 1200);                                           // snare
  if (i % 4 === 2) noise(t, .05, .12, 7000);                                                   // hi-hat
}
function scheduler() {
  while (nextTime < audio.currentTime + .15) { playStep(step, nextTime); nextTime += S16; step++; }
}
function startMusic() {
  nextTime = audio.currentTime + .08; step = 0;
  musicBus.gain.cancelScheduledValues(audio.currentTime);
  musicBus.gain.setTargetAtTime(revealed || lastFinal === null ? .75 : .2, audio.currentTime, .4);
  clearInterval(schedTimer); schedTimer = setInterval(scheduler, 30); scheduler();
}
function stopMusic() {
  if (!audio) return;
  musicBus.gain.setTargetAtTime(0, audio.currentTime, .15);
  clearInterval(schedTimer); schedTimer = null;
}
function duckMusic(level) { if (audio && schedTimer) musicBus.gain.setTargetAtTime(level, audio.currentTime, .3); }

async function setSound(on) {
  soundOn = on;
  if (soundOn && !audio && !initAudio()) soundOn = false;
  if (soundOn) {
    if (audio.state !== 'running') await audio.resume();
    startMusic();
    tone(1318.5, .25, 'triangle', .12); tone(1760, .35, 'triangle', .1, .09);
  } else stopMusic();
  $('sound-label').textContent = soundOn ? 'VICE FM: ON AIR' : 'TAP FOR RADIO';
  $('sound').setAttribute('aria-pressed', String(soundOn));
  document.body.classList.toggle('radio-on', soundOn);
}
$('sound').addEventListener('click', () => setSound(!soundOn));

function tone(freq, dur = .15, type = 'square', vol = .12, when = 0) {
  if (!soundOn || !audio) return;
  voice(freq, audio.currentTime + when, dur, type, vol, sfxBus);
}
function fanfare() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, .35, 'sawtooth', .1, i * .11));
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, 1.8, 'triangle', .09, .5));
}

/* ---------- countdown ---------- */
const pad = (n) => String(n).padStart(2, '0');
function setNum(id, val) {
  const el = $(id);
  if (el.textContent === val) return;
  el.textContent = val;
  if (reduceMotion) return;
  el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
}
function statusFor(ms) {
  const m = ms / 60000;
  if (m > 360) return 'WORK MODE: STILL ON (UGH)';
  if (m > 180) return 'WORK MODE: DISENGAGING';
  if (m > 60) return 'SNACK SUPPLY: SECURED';
  if (m > 30) return 'CONTROLLER: FULLY CHARGED';
  if (m > 10) return 'PHONE: ON SILENT';
  if (m > 1) return 'LIGHTS: DIMMED';
  return 'THIS IS IT';
}
function restart(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function shake() { if (!reduceMotion) restart(document.body, 'shake'); }

let revealed = false, lastFinal = null;
function update() {
  const now = Date.now();
  const remaining = Math.max(0, TARGET - now);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  setNum('hours', pad(h)); setNum('minutes', pad(m)); setNum('seconds', pad(s));

  const p = Math.max(0, Math.min(1, (now - START) / (TARGET - START)));
  document.documentElement.style.setProperty('--p', p.toFixed(4));
  $('progress').style.width = (p * 100).toFixed(1) + '%';
  $('percent').textContent = Math.floor(p * 100) + '% TO FREEDOM';
  $('status').textContent = statusFor(remaining);

  const lit = p <= 0 ? 0 : Math.min(5, Math.floor(p * 5) + 1);
  [...$('wanted').children].forEach((star, i) => star.classList.toggle('on', i < lit));
  $('wanted').classList.toggle('hot', remaining > 0 && remaining <= 60000);
  $('wanted').setAttribute('aria-label', 'Wanted level ' + lit + ' of 5');

  document.title = remaining ? `${pad(h)}:${pad(m)}:${pad(s)} · SHERIF // VICE CITY` : 'WELCOME TO VICE CITY, DEEPBLUE';

  updateWeekend(now, remaining);

  if (remaining > 0 && remaining <= 10000) {
    const n = Math.ceil(remaining / 1000);
    if (n !== lastFinal) {
      lastFinal = n;
      $('final').classList.remove('hidden');
      $('final-num').textContent = n;
      if (!reduceMotion) restart($('final-num'), 'pop');
      if (n === 10) duckMusic(.2);
      tone(n <= 3 ? 1046.5 : 784, .2, 'square', .14);
      if (n <= 3) shake();
    }
  }
  if (remaining === 0 && !revealed) {
    revealed = true;
    reveal(lastFinal !== null);
  }
}

function reveal(dramatic) {
  $('final').classList.add('hidden');
  $('countdown').classList.add('hidden');
  $('welcome').classList.remove('hidden');
  document.body.classList.add('unlocked-state');
  $('arcade').classList.add('hidden'); if (window.stopGame) stopGame();
  $('subtitle').textContent = 'THE ADVENTURE HAS BEGUN';
  if (dramatic) { restart($('flash'), 'go'); shake(); fanfare(); setTimeout(() => duckMusic(.75), 2200); }
  updateStream(true);
  celebrate();
}

/* ---------- the weekend: freedom clock + itinerary ---------- */
function updateWeekend(now, remaining) {
  const left = Math.max(0, END - now);
  if (remaining === 0) {
    $('fd').textContent = Math.floor(left / 86400000);
    setNum('fh', pad(Math.floor((left % 86400000) / 3600000)));
    setNum('fm', pad(Math.floor((left % 3600000) / 60000)));
    setNum('fs', pad(Math.floor((left % 60000) / 1000)));
    const f = left / (END - TARGET);
    $('fprogress').style.width = (f * 100).toFixed(2) + '%';
    $('fpercent').textContent = Math.ceil(f * 100) + '% FREEDOM LEFT';
    $('fstatus').textContent = left === 0 ? 'BACK TO REALITY. GG, DEEPBLUE' : 'OUT OF OFFICE · DO NOT DISTURB';
    $('player-state').innerHTML = left === 0 ? '<i></i> OFFLINE · GG' : '<i></i> IN VICE CITY';
    $('player-state').classList.toggle('online', left > 0);
  }
  // Which weekend day is it? (Shifted along with ?test= so previews look right.)
  const shift = TARGET - Date.parse(TARGET_ISO);
  const today = new Date(now - shift).toISOString().slice(0, 10); // London is on UTC in November
  for (const li of $('days').children) {
    const d = li.dataset.day;
    const done = d < today || left === 0;
    const current = !done && d === today && remaining === 0;
    li.classList.toggle('done', done);
    li.classList.toggle('now', current);
    li.querySelector('em').textContent = done ? '✓ COMPLETE' : current ? '● NOW PLAYING' : (d === today ? 'TONIGHT' : 'LOCKED');
  }
}

/* ---------- stream panel ---------- */
function updateStream(live) {
  if (!streamUrl) return;
  $('stream-card').classList.remove('hidden');
  $('stream-pill').classList.remove('hidden');
  $('stream-link').href = streamUrl;
  if (!live) { $('stream-label').textContent = 'DEEPBLUE GOES LIVE AT 7 PM. TUNE IN'; return; }
  $('stream-card').classList.add('is-live');
  $('stream-label').textContent = 'LIVE NOW FROM VICE CITY';
  // Twitch embeds only work on a real website (e.g. GitHub Pages), not a file opened locally.
  if (twitch && location.hostname && !$('stream-embed').firstChild) {
    const f = document.createElement('iframe');
    f.src = `https://player.twitch.tv/?channel=${encodeURIComponent(twitch)}&parent=${location.hostname}&muted=true`;
    f.allowFullscreen = true;
    f.title = 'Sherif live stream';
    $('stream-embed').appendChild(f);
  }
}

/* ---------- confetti + fireworks ---------- */
const fx = $('confetti'), fxc = fx.getContext('2d');
let parts = [], running = false, W = 0, H = 0;
const COLORS = ['#ff75af', '#ffd18d', '#ffffff', '#a88aff', '#ff9a78', '#5ff3ff'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function sizeFx() { W = fx.width = innerWidth; H = fx.height = innerHeight; }
function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
function celebrate() {
  if (reduceMotion) return;
  sizeFx();
  for (let i = 0; i < 170; i++) {
    parts.push({ c: 1, x: Math.random() * W, y: -Math.random() * H * .7, vx: (Math.random() - .5) * 2,
      vy: 1.5 + Math.random() * 3, r: 2 + Math.random() * 5, rot: Math.random() * 6, color: pick(COLORS), life: 420 });
  }
  for (let b = 0; b < 8; b++) setTimeout(() => burst(W * (.12 + Math.random() * .76), H * (.12 + Math.random() * .35)), b * 420);
  kick();
}
function burst(x, y) {
  const color = pick(COLORS);
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 5.5;
    parts.push({ c: 0, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 60 + Math.random() * 35, max: 95, color });
  }
  tone(140 + Math.random() * 120, .35, 'triangle', .18);
  kick();
}
function loop() {
  fxc.clearRect(0, 0, W, H);
  parts = parts.filter((p) => p.life > 0 && p.y < H + 30);
  for (const p of parts) {
    p.life--;
    if (p.ch) {
      p.x += p.vx + Math.sin((p.life + p.rot * 40) / 18) * .8; p.y += p.vy;
      fxc.font = p.r + 'px "DM Sans", sans-serif'; fxc.fillStyle = p.color; fxc.fillText(p.ch, p.x, p.y);
    } else if (p.c) {
      p.x += p.vx; p.y += p.vy; p.rot += .05;
      fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.rot);
      fxc.fillStyle = p.color; fxc.fillRect(-p.r / 2, -p.r / 2, p.r * 2, p.r); fxc.restore();
    } else {
      p.vx *= .97; p.vy = p.vy * .97 + .05; p.x += p.vx; p.y += p.vy;
      fxc.globalAlpha = Math.max(0, p.life / p.max);
      fxc.fillStyle = p.color; fxc.beginPath(); fxc.arc(p.x, p.y, 2.2, 0, 7); fxc.fill();
      fxc.globalAlpha = 1;
    }
  }
  if (parts.length) requestAnimationFrame(loop);
  else { running = false; fxc.clearRect(0, 0, W, H); }
}
$('celebrate').addEventListener('click', () => { fanfare(); celebrate(); });

/* ---------- twinkling stars + shooting stars ---------- */
(function stars() {
  const c = $('stars'), x = c.getContext('2d');
  let w, h, list, shoot = null;
  function size() {
    w = c.width = innerWidth; h = c.height = innerHeight;
    list = Array.from({ length: Math.round(w * h / 8000) }, () => ({
      x: Math.random() * w, y: Math.random() * h * .62, r: Math.random() * 1.4 + .3, t: Math.random() * 6, s: .4 + Math.random() * 1.6 }));
    if (reduceMotion) draw(0);
  }
  function draw(time) {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#fff';
    for (const st of list) {
      x.globalAlpha = reduceMotion ? .7 : .25 + .75 * Math.abs(Math.sin(st.t + time / 1000 * st.s));
      x.fillRect(st.x, st.y, st.r, st.r);
    }
    x.globalAlpha = 1;
    if (reduceMotion) return;
    if (!shoot && Math.random() < .005) shoot = { x: Math.random() * w * .7, y: Math.random() * h * .3, l: 0 };
    if (shoot) {
      shoot.l++;
      const sx = shoot.x + shoot.l * 10, sy = shoot.y + shoot.l * 4, len = 110;
      const g = x.createLinearGradient(sx, sy, sx - len, sy - len * .4);
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.strokeStyle = g; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx - len, sy - len * .4); x.stroke();
      if (shoot.l > 45) shoot = null;
    }
    requestAnimationFrame(draw);
  }
  size();
  addEventListener('resize', size);
  if (!reduceMotion) requestAnimationFrame(draw);
})();

/* ---------- parallax ---------- */
if (!reduceMotion) {
  addEventListener('pointermove', (e) => {
    const r = document.documentElement.style;
    r.setProperty('--mx', (e.clientX / innerWidth - .5).toFixed(3));
    r.setProperty('--my', (e.clientY / innerHeight - .5).toFixed(3));
  });
}

/* ---------- radio ticker ---------- */
(function ticker() {
  const t = $('ticker');
  for (let k = 0; k < 2; k++) {
    for (const msg of TICKER) {
      const s = document.createElement('span'); s.textContent = msg;
      const b = document.createElement('b'); b.textContent = '✦';
      t.append(s, b);
    }
  }
  t.style.animationDuration = Math.max(20, t.scrollWidth / 2 / 70) + 's';
})();

/* ---------- texts from the wife ---------- */
(function wifeTexts() {
  let order = [];
  window.showText = (text) => show(text);
  function show(text) {
    $('text-msg').textContent = text;
    $('text-time').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
    $('text').classList.remove('hidden');
    restart($('text'), 'in');
    tone(1567.98, .12, 'sine', .14); tone(2093, .18, 'sine', .12, .13);
    clearTimeout(show.hide);
    show.hide = setTimeout(() => $('text').classList.add('hidden'), 9000);
  }
  function next() {
    if (!order.length) order = WIFE_TEXTS.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    show(order.pop());
    setTimeout(next, 60000 + Math.random() * 60000);
  }
  $('text').addEventListener('click', () => $('text').classList.add('hidden'));
  setTimeout(next, 12000);
})();

/* ---------- London ♡ Alexandria clocks (Alexandria uses Cairo's time zone) ---------- */
function clocks() {
  const f = (tz) => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
  $('clock-lon').textContent = f('Europe/London');
  $('clock-cai').textContent = f('Africa/Cairo');
}
clocks(); setInterval(clocks, 5000);

/* ---------- cheat codes: type them anywhere on the page ---------- */
function rain(chars, colors, n, size = 28) {
  if (reduceMotion) return;
  sizeFx();
  for (let i = 0; i < n; i++) {
    parts.push({ ch: pick(chars), x: Math.random() * W, y: -Math.random() * H * .8, vx: (Math.random() - .5) * .6,
      vy: 2 + Math.random() * 3, r: size * (.6 + Math.random() * .8), rot: Math.random() * 6, color: pick(colors), life: 500 });
  }
  kick();
}
function cheatBanner(text) {
  $('cheat').textContent = 'CHEAT ACTIVATED · ' + text;
  $('cheat').classList.remove('hidden'); restart($('cheat'), 'in');
  clearTimeout(cheatBanner.t); cheatBanner.t = setTimeout(() => $('cheat').classList.add('hidden'), 3200);
  tone(523.25, .1, 'square', .1); tone(783.99, .1, 'square', .1, .1); tone(1046.5, .25, 'square', .1, .2);
}
const CHEATS = {
  NADZ() { cheatBanner('NADZ MODE ♡'); rain(['♡', '♥', '💗'], ['#ff75af', '#ff4eab', '#ffd1e6'], 90); },
  DEEPBLUE() { const on = document.body.classList.toggle('deepblue'); cheatBanner(on ? 'DEEP BLUE MODE' : 'SUNSET MODE'); },
  MONEY() { cheatBanner('$$$ MAKE IT RAIN'); rain(['💵', '💸', '$'], ['#7dff9b', '#c6ffd0'], 90); [0, .08, .16].forEach((w) => tone(1975, .12, 'square', .08, w)); },
  WANTED() { cheatBanner('★★★★★ WANTED LEVEL MAXED'); restart($('police'), 'go'); shake(); [0, .5, 1, 1.5].forEach((w, i) => tone(i % 2 ? 660 : 880, .45, 'sawtooth', .07, w)); },
  BOOM() { cheatBanner('FIREWORKS'); sizeFx(); for (let b = 0; b < 6; b++) setTimeout(() => burst(W * (.15 + Math.random() * .7), H * (.15 + Math.random() * .4)), b * 300); },
  ALEXANDRIA() { cheatBanner('GREETINGS FROM ALEXANDRIA'); rain(['🌊', '⛵', '☀️', '🐚', '♡'], ['#fff'], 55, 34); },
};
const isTyping = (e) => e.target && e.target.tagName === 'INPUT';
function runCheat(code) {
  CHEATS[code]();
  if (window.showText && CHEAT_TEXTS[code]) setTimeout(() => showText(CHEAT_TEXTS[code]), 900);
  const li = document.querySelector(`#cheat-list li[data-code="${code}"]`);
  if (li && !li.classList.contains('found')) {
    li.classList.add('found');
    li.querySelector('b').textContent = code;
    li.querySelector('span').textContent = '✓ UNLOCKED';
    const n = document.querySelectorAll('#cheat-list li.found').length;
    $('cheat-found').textContent = n;
    if (n === Object.keys(CHEATS).length) setTimeout(() => { showText(CHEAT_TEXTS.ALL); CHEATS.BOOM(); }, 5000);
  }
}
// Cheat drawer on the left edge.
function setDrawer(open) {
  $('cheat-panel').classList.toggle('open', open);
  $('cheat-tab').setAttribute('aria-expanded', String(open));
  if (open && matchMedia('(hover:hover)').matches) $('cheat-input').focus();
}
$('cheat-tab').addEventListener('click', () => setDrawer(!$('cheat-panel').classList.contains('open')));
$('cheat-close').addEventListener('click', () => setDrawer(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
// 1) Type a code anywhere on the page...
let typed = '';
addEventListener('keydown', (e) => {
  if (isTyping(e) || !e.key || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
  typed = (typed + e.key.toUpperCase()).slice(-12);
  for (const code in CHEATS) if (typed.endsWith(code)) { typed = ''; runCheat(code); break; }
});
// 2) ...or in the cheat console box (works on phones too).
$('cheat-input').addEventListener('input', (e) => {
  const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
  for (const code in CHEATS) if (v.endsWith(code)) { e.target.value = ''; runCheat(code); return; }
});
$('cheat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const v = e.target.value.trim();
    if (v) { e.target.value = ''; restart($('cheat-input').parentNode, 'nope'); tone(140, .25, 'sawtooth', .1); }
  }
});
// 3) Tapping a hint shakes it (the codes have to be guessed!). Tapping an unlocked one replays it.
document.querySelectorAll('#cheat-list li').forEach((li) => li.addEventListener('click', () => {
  if (li.classList.contains('found')) runCheat(li.dataset.code); else { restart(li, 'nope'); $('cheat-input').focus(); }
}));

/* ---------- arcade game: ESCAPE THE OFFICE ---------- */
(function arcade() {
  const cv = $('game'), g = cv.getContext('2d');
  const GW = 360, GH = 540, ROAD_L = 30, LANE = 100, PY = GH - 110;
  const scale = Math.min(2, window.devicePixelRatio || 1);
  cv.width = GW * scale; cv.height = GH * scale; g.scale(scale, scale);
  const WORK = ['EMAIL', 'MEETING', 'DEADLINE', 'REPLY ALL', 'URGENT!!', 'TEAMS CALL', 'OVERTIME', 'QUICK SYNC', 'MONDAY'];
  const BUSTED = ['Your boss saw you online.', 'Caught by a 4:59 PM meeting invite.', "Reply-all'd into oblivion.",
    'Someone said "quick question".', 'The office pulled you back in.'];
  let state = 'ready', lane = 1, px = laneX(1), obs = [], pops = [], speed = 260, score = 0, dist = 0, spawnIn = .6, last = 0, raf = 0, msg = '', shakeT = 0;
  let best = 0; try { best = +localStorage.getItem('dbBest') || 0; } catch (e) {}
  $('game-best').textContent = 'BEST ' + best;
  function laneX(l) { return ROAD_L + LANE * l + LANE / 2; }
  function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function reset() { lane = 1; px = laneX(1); obs = []; pops = []; speed = 260; score = 0; dist = 0; spawnIn = .6; }
  function start() { reset(); state = 'play'; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); tone(660, .08); tone(990, .12, 'square', .1, .08); }
  function move(d) { if (state !== 'play') { start(); return; } lane = Math.max(0, Math.min(2, lane + d)); tone(440 + lane * 110, .05, 'square', .05); }
  window.stopGame = () => { state = 'ready'; cancelAnimationFrame(raf); };

  addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    const r = cv.getBoundingClientRect();
    if (!(r.bottom > 0 && r.top < innerHeight)) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (state === 'play') { e.preventDefault(); move(-1); } }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (state === 'play') { e.preventDefault(); move(1); } }
    else if ((e.key === ' ' || e.key === 'Enter') && state !== 'play' && (document.activeElement === document.body || document.activeElement === cv)) { e.preventDefault(); start(); }
  });
  cv.addEventListener('pointerdown', (e) => {
    if (state !== 'play') { start(); return; }
    const r = cv.getBoundingClientRect(); move(e.clientX - r.left < r.width / 2 ? -1 : 1);
  });
  $('g-left').addEventListener('click', () => move(-1));
  $('g-right').addEventListener('click', () => move(1));
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') { state = 'paused'; draw(); } });

  function spawn() {
    const lanes = [0, 1, 2].sort(() => Math.random() - .5);
    const heart = Math.random() < .22;
    obs.push({ lane: lanes[0], y: -60, heart, label: heart ? '♥' : pick(WORK), w: heart ? 44 : 84, h: heart ? 44 : 50 });
    if (!heart && score > 400 && Math.random() < .35) obs.push({ lane: lanes[1], y: -60 - Math.random() * 40, heart: false, label: pick(WORK), w: 84, h: 50 });
  }
  function frame(now) {
    if (state !== 'play') return;
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
    speed = Math.min(720, speed + 9 * dt);
    dist += speed * dt; score += speed * dt / 10;
    px += (laneX(lane) - px) * Math.min(1, dt * 18);
    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = Math.max(.38, 1.05 - speed / 1100) * (.8 + Math.random() * .5); }
    for (const o of obs) o.y += speed * dt;
    for (const o of obs) {
      const ox = laneX(o.lane);
      if (Math.abs(ox - px) < (o.w / 2 + 18) && o.y + o.h > PY + 8 && o.y < PY + 68) {
        if (o.heart) { o.hit = true; score += 100; pops.push({ x: ox, y: PY - 10, t: 1, text: '+100 ♡ NADZ' }); tone(1318, .1, 'triangle', .1); tone(1760, .15, 'triangle', .1, .08); }
        else { gameOver(); return; }
      }
    }
    obs = obs.filter((o) => o.y < GH + 60 && !o.hit);
    for (const p of pops) { p.t -= dt; p.y -= 40 * dt; }
    pops = pops.filter((p) => p.t > 0);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function gameOver() {
    state = 'over'; msg = pick(BUSTED);
    const s = Math.floor(score);
    if (s > best) { best = s; try { localStorage.setItem('dbBest', best); } catch (e) {} }
    $('game-best').textContent = 'BEST ' + best;
    tone(220, .3, 'sawtooth', .12); tone(110, .5, 'sawtooth', .12, .15);
    const t0 = performance.now();
    (function shakeLoop(n) { shakeT = Math.max(0, .4 - (n - t0) / 1000); draw(); if (shakeT > 0 && state === 'over') requestAnimationFrame(shakeLoop); })(t0);
  }
  function draw() {
    g.save();
    if (shakeT > 0) g.translate((Math.random() - .5) * 14 * shakeT, (Math.random() - .5) * 14 * shakeT);
    const bg = g.createLinearGradient(0, 0, 0, GH); bg.addColorStop(0, '#1a0b2e'); bg.addColorStop(1, '#2a0f3a');
    g.fillStyle = bg; g.fillRect(-10, -10, GW + 20, GH + 20);
    g.shadowColor = '#ff4eab'; g.shadowBlur = 14; g.fillStyle = '#ff4eab';
    g.fillRect(ROAD_L - 4, 0, 3, GH); g.fillRect(ROAD_L + LANE * 3 + 1, 0, 3, GH);
    g.shadowBlur = 0;
    g.fillStyle = '#ffffff55';
    const off = dist % 60;
    for (let l = 1; l < 3; l++) for (let y = -60 + off; y < GH; y += 60) g.fillRect(ROAD_L + LANE * l - 1.5, y, 3, 30);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const o of obs) {
      const x = laneX(o.lane);
      if (o.heart) {
        g.shadowColor = '#ff75af'; g.shadowBlur = 18; g.fillStyle = '#ff75af';
        g.font = '900 40px "DM Sans", sans-serif'; g.fillText('♥', x, o.y + o.h / 2);
      } else {
        g.shadowColor = '#ff3b5c'; g.shadowBlur = 16; g.fillStyle = '#2a0a1a'; g.strokeStyle = '#ff3b5c'; g.lineWidth = 2.5;
        rr(x - o.w / 2, o.y, o.w, o.h, 8); g.fill(); g.stroke();
        g.shadowBlur = 0; g.fillStyle = '#ffd7de'; g.font = '800 13px "DM Sans", sans-serif'; g.fillText(o.label, x, o.y + o.h / 2 + 1);
      }
      g.shadowBlur = 0;
    }
    if (state !== 'ready') car(px, PY);
    for (const p of pops) { g.globalAlpha = Math.max(0, p.t); g.fillStyle = '#ffd1e6'; g.font = '800 15px "DM Sans", sans-serif'; g.fillText(p.text, p.x, p.y); g.globalAlpha = 1; }
    g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '800 14px "DM Sans", sans-serif';
    if (state === 'play' || state === 'over') g.fillText('SCORE ' + Math.floor(score), 12, 20);
    if (state !== 'play') {
      g.fillStyle = '#0b0614cc'; g.fillRect(-10, -10, GW + 20, GH + 20);
      g.textAlign = 'center';
      if (state === 'ready') {
        car(GW / 2, 280);
        title('ESCAPE', 140); title('THE OFFICE', 195);
        sub('Dodge the work. Grab the ♥ from Nadz.', 400); prompt('TAP OR PRESS SPACE TO DRIVE', 440);
      } else if (state === 'paused') {
        title('PAUSED', 240); prompt('TAP TO START AGAIN', 300);
      } else {
        title('BUSTED', 190);
        sub(msg, 240);
        g.fillStyle = '#ffd18d'; g.font = '800 30px "Barlow Condensed", sans-serif'; g.fillText('SCORE ' + Math.floor(score), GW / 2, 300);
        g.fillStyle = '#ffffffaa'; g.font = '700 13px "DM Sans", sans-serif'; g.fillText('BEST ' + best, GW / 2, 332);
        prompt('TAP TO TRY AGAIN', 390);
      }
    }
    g.restore();
  }
  function title(t, y) { g.shadowColor = '#ff4eab'; g.shadowBlur = 20; g.fillStyle = '#fff'; g.font = '900 54px "Barlow Condensed", Impact, sans-serif'; g.fillText(t, GW / 2, y); g.shadowBlur = 0; }
  function sub(t, y) { g.fillStyle = '#ffdccc'; g.font = '600 14px "DM Sans", sans-serif'; g.fillText(t, GW / 2, y); }
  function prompt(t, y) { g.fillStyle = '#5ff3ff'; g.font = '800 13px "DM Sans", sans-serif'; g.fillText(t, GW / 2, y); }
  function car(x, y) {
    g.save(); g.translate(x, y);
    g.shadowColor = '#5ff3ff'; g.shadowBlur = 20;
    g.fillStyle = '#5ff3ff'; rr(-22, 0, 44, 74, 12); g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#10223a'; rr(-16, 14, 32, 18, 5); g.fill(); rr(-16, 46, 32, 12, 4); g.fill();
    g.fillStyle = '#ff2e4d'; g.fillRect(-20, 68, 10, 4); g.fillRect(10, 68, 10, 4);
    g.fillStyle = '#fff6c8'; g.fillRect(-19, 1, 9, 4); g.fillRect(10, 1, 9, 4);
    g.restore();
  }
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (state !== 'play') draw(); });
})();

/* ---------- start ---------- */
addEventListener('resize', () => { if (running) sizeFx(); });
updateStream(Date.now() >= TARGET);
update();
setInterval(update, 200);
