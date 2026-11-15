/* C23 Solar — scroll-driven sky, estimator, and small interactions. No dependencies. */
(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ------------------------------------------------------------------ *
   * The sky. Each section declares a time of day via data-sky; as you
   * scroll we blend between neighbouring palettes and move the sun.
   * ------------------------------------------------------------------ */
  const SKIES = {
    dawn:      { hour: 6.35, top: [122, 140, 208], bot: [255, 214, 178], ink: 'dark',  night: 0.12 },
    morning:   { hour: 9.5,  top: [108, 178, 242], bot: [226, 242, 255], ink: 'dark',  night: 0 },
    noon:      { hour: 12.75, top: [64, 152, 238], bot: [208, 234, 255], ink: 'dark',  night: 0 },
    afternoon: { hour: 16.5, top: [98, 160, 224],  bot: [255, 226, 170], ink: 'dark',  night: 0 },
    dusk:      { hour: 19.7, top: [44, 38, 110],   bot: [214, 92, 104],  ink: 'light', night: 0.3 },
    night:     { hour: 21.6, top: [6, 10, 30],     bot: [22, 28, 66],    ink: 'light', night: 1 },
    late:      { hour: 23.2, top: [3, 5, 16],      bot: [12, 16, 40],    ink: 'light', night: 1 },
  };
  const SUNRISE = 6, SUNSET = 20;

  const sun = $('sun'), hills = $('hills'), clock = $('clock'), nav = $('nav');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const sections = [...document.querySelectorAll('[data-sky]')];
  let stops = [];

  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  const rgb = (c) => `rgb(${c[0]} ${c[1]} ${c[2]})`;
  const smooth = (t, lo = 0.25, hi = 0.75) => {
    const x = Math.min(1, Math.max(0, (t - lo) / (hi - lo)));
    return x * x * (3 - 2 * x);
  };

  function measure() {
    stops = sections.map((el) => ({
      y: el.offsetTop + el.offsetHeight / 2,
      sky: SKIES[el.dataset.sky],
    }));
  }

  function paint() {
    const vh = innerHeight, vw = innerWidth;
    const y = scrollY + vh / 2;

    // Find the pair of section centres we sit between.
    let i = 0;
    while (i < stops.length - 2 && y > stops[i + 1].y) i++;
    const a = stops[i], b = stops[i + 1] || a;
    const raw = b === a ? 0 : Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y)));
    const t = smooth(raw);

    const top = mix(a.sky.top, b.sky.top, t);
    const bot = mix(a.sky.bot, b.sky.bot, t);
    const mid = mix(top, bot, 0.5);
    const hour = lerp(a.sky.hour, b.sky.hour, raw);
    const night = lerp(a.sky.night, b.sky.night, t);

    root.style.setProperty('--sky-top', rgb(top));
    root.style.setProperty('--sky-bot', rgb(bot));
    root.style.setProperty('--bg-mid', rgb(mid));
    root.style.setProperty('--night', night.toFixed(3));
    root.dataset.ink = (t < 0.5 ? a : b).sky.ink;
    

    // Sun: left to right across the viewport, on a sine arc above the horizon.
    const day = (hour - SUNRISE) / (SUNSET - SUNRISE);
    const elevation = Math.sin(Math.PI * day);
    const size = sun.offsetWidth;
    const sx = lerp(0.1, 0.9, day) * vw - size / 2;
    const sy = vh * 0.9 - elevation * vh * 0.82 - size / 2;
    sun.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
    // Warm and large near the horizon, white-hot overhead.
    const warm = 1 - Math.max(0, Math.min(1, elevation));
    sun.style.setProperty('--sun', rgb(mix([255, 226, 120], [255, 138, 60], warm)));
    sun.style.opacity = day > 1.02 || day < -0.02 ? 0 : 1;

    // The hills belong to dawn: they sink away as the camera tilts up into the sky.
    hills.style.transform = `translate3d(0, ${Math.min(scrollY * 0.55, vh)}px, 0)`;
    hills.style.visibility = scrollY > vh * 1.2 ? 'hidden' : 'visible';

    const h = Math.floor(hour), m = Math.floor((hour - h) * 60);
    clock.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    nav.classList.toggle('is-scrolled', scrollY > 40);
  }

  let queued = false;
  const requestPaint = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; paint(); });
  };

  /* Stars — drawn once per resize; their opacity follows --night. */
  function drawStars() {
    const c = $('stars');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext('2d');
    let seed = 23;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const count = Math.round((innerWidth * innerHeight) / 5200);
    for (let n = 0; n < count; n++) {
      const r = (rand() ** 3 * 1.5 + 0.35) * dpr;
      ctx.globalAlpha = 0.35 + rand() * 0.65;
      ctx.fillStyle = rand() > 0.85 ? '#ffe2a8' : '#ffffff';
      ctx.beginPath();
      ctx.arc(rand() * c.width, rand() * c.height, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const relayout = () => { measure(); drawStars(); paint(); };
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  relayout();

  /* ------------------------------------------------------------------ *
   * Reveal on scroll
   * ------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ------------------------------------------------------------------ *
   * Estimator
   * ------------------------------------------------------------------ */
  const PANEL_KW = 0.435, PANEL_M2 = 1.95, PERFORMANCE = 0.8, EV_MILES_PER_KWH = 3.6;
  const size = $('size'), sunh = $('sunh');
  const fmt = (n) => Math.round(n).toLocaleString('en');
  const shown = {};

  function setNumber(id, value) {
    const el = $(id);
    const from = shown[id] ?? 0;
    shown[id] = value;
    if (reduceMotion) { el.textContent = fmt(value); return; }
    const start = performance.now(), dur = 450;
    const token = (el._token = (el._token || 0) + 1);
    const step = (now) => {
      if (el._token !== token) return;
      const p = Math.min(1, (now - start) / dur);
      el.textContent = fmt(lerp(from, value, 1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function drawCurve(kwp, psh) {
    const W = 600, BASE = 180;
    const sigma = 1.5 + psh * 0.38;                       // sunnier places: longer, fuller days
    const frac = (kwp - size.min) / (size.max - size.min);
    const amp = 60 + 105 * Math.sqrt(frac);               // visual scale only
    let d = '';
    for (let x = 0; x <= W; x += 6) {
      const hr = (x / W) * 24;
      const yv = BASE - amp * Math.exp(-((hr - 12.5) ** 2) / (2 * sigma * sigma));
      d += `${x === 0 ? 'M' : 'L'}${x} ${yv.toFixed(1)}`;
    }
    $('curve-line').setAttribute('d', d);
    $('curve-area').setAttribute('d', `${d}L${W} ${BASE}L0 ${BASE}Z`);
  }

  function estimate() {
    const kwp = +size.value, psh = +sunh.value;
    const kwh = kwp * psh * 365 * PERFORMANCE;
    const panels = Math.ceil(kwp / PANEL_KW);
    const area = panels * PANEL_M2;
    const miles = kwh * EV_MILES_PER_KWH;

    $('o-size').textContent = `${kwp.toFixed(1)} kWp`;
    $('o-sun').textContent = `${psh.toFixed(1)} sun-hours / day`;
    $('o-peak').textContent = `≈ ${(kwp * PERFORMANCE).toFixed(1)} kW`;
    setNumber('r-kwh', kwh);
    setNumber('r-panels', panels);
    setNumber('r-area', area);
    setNumber('r-mi', miles);
    $('r-area-ft').textContent = `${fmt(area * 10.764)} sq ft`;

    [size, sunh].forEach((r) => r.style.setProperty('--fill', `${((r.value - r.min) / (r.max - r.min)) * 100}%`));
    drawCurve(kwp, psh);
  }
  size.addEventListener('input', estimate);
  sunh.addEventListener('input', estimate);
  estimate();

  // Carry the estimate into the enquiry form.
  $('use-estimate').addEventListener('click', () => {
    const msg = document.querySelector('#quote-form [name="message"]');
    if (!msg.value.trim()) {
      msg.value = `I used the estimator: about ${(+size.value).toFixed(1)} kWp at ${(+sunh.value).toFixed(1)} peak sun hours (${fmt(shown['r-kwh'])} kWh a year).`;
    }
  });

  /* ------------------------------------------------------------------ *
   * Enquiry form — opens the visitor's mail app, addressed to data-email.
   * Swap for a form backend when one exists.
   * ------------------------------------------------------------------ */
  const form = $('quote-form'), status = $('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach((f) => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      f.setAttribute('aria-invalid', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) { status.textContent = 'Please add your name and a valid email.'; return; }
    const v = Object.fromEntries(new FormData(form));
    const body = [`Name: ${v.name}`, `Email: ${v.email}`, `Property: ${v.type}`, `Location: ${v.location || '—'}`, '', v.message || ''].join('\n');
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Solar enquiry — ${v.name}`)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app to send this…';
  });

  $('year').textContent = new Date().getFullYear();
})();
