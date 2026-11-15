/* C23 Solar — quote form, savings calculator and small interactions. No dependencies. */
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ---------- Nav shadow & reveal on scroll ---------- */
  const nav = $('nav');
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });

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

  /* ---------- Three-step quote form ----------
   * No backend yet: the final step opens the visitor's email app with the
   * answers filled in, addressed to the form's data-email. */
  const form = $('quote');
  const steps = [...form.querySelectorAll('.quote__step')];
  const next = $('quote-next'), back = $('quote-back'), status = $('quote-status');
  let current = 0;

  function show(i) {
    current = i;
    steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    $('quote-step').textContent = `Step ${i + 1} of ${steps.length}`;
    $('quote-progress').style.width = `${((i + 1) / steps.length) * 100}%`;
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? 'Get my free quote' : 'Continue';
    status.textContent = '';
    status.classList.remove('ok');
  }

  function stepValid(step) {
    const groups = new Set([...step.querySelectorAll('input[type="radio"]')].map((r) => r.name));
    for (const name of groups) {
      if (!form.querySelector(`input[name="${name}"]:checked`)) {
        status.textContent = 'Please choose an option for each question.';
        return false;
      }
    }
    let firstBad = null;
    step.querySelectorAll('.inputs input').forEach((f) => {
      const v = f.value.trim();
      const bad = !v
        || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v))
        || (f.type === 'tel' && v.replace(/\D/g, '').length < 10);
      f.classList.toggle('invalid', bad);
      f.setAttribute('aria-invalid', bad);
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      status.textContent = 'Please check the highlighted details.';
      return false;
    }
    return true;
  }

  function advance() {
    if (!stepValid(steps[current])) return;
    if (current < steps.length - 1) { show(current + 1); return; }
    const v = Object.fromEntries(new FormData(form));
    const body = [
      `Name: ${v.name}`, `Phone: ${v.phone}`, `Email: ${v.email}`, `Postcode: ${v.postcode}`, '',
      `Property: ${v.property}`, `Owner: ${v.owner}`, `Interested in: ${v.interest}`, `Monthly bill: ${v.bill}`,
    ].join('\n');
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Free quote request — ${v.name}, ${v.postcode}`)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app — press send to reach us.';
    status.classList.add('ok');
  }
  next.addEventListener('click', advance);
  back.addEventListener('click', () => show(current - 1));
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  form.addEventListener('change', () => { if (!status.classList.contains('ok')) status.textContent = ''; });

  /* ---------- Savings calculator ----------
   * All assumptions live here and are printed under the calculator. */
  const PANEL_KWP = 0.435;        // kWp per panel
  const YIELD = 950;              // kWh per kWp per year, south-facing
  const IMPORT_PRICE = 0.25;      // £ per kWh bought
  const EXPORT_PRICE = 0.12;      // £ per kWh exported
  const SELF_USE = { solar: 0.4, battery: 0.75 };
  const YEARS = 25;

  const panels = $('panels'), battery = $('battery');
  const fmt = (n) => Math.round(n).toLocaleString('en-GB');
  const shown = {};

  function setNumber(id, value) {
    const el = $(id), from = shown[id] ?? 0;
    shown[id] = value;
    if (reduceMotion) { el.textContent = fmt(value); return; }
    const start = performance.now(), token = (el._t = (el._t || 0) + 1);
    const tick = (now) => {
      if (el._t !== token) return;
      const p = Math.min(1, (now - start) / 450);
      el.textContent = fmt(from + (value - from) * (1 - (1 - p) ** 3));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function calculate() {
    const n = +panels.value;
    const facing = +document.querySelector('input[name="facing"]:checked').value;
    const self = battery.checked ? SELF_USE.battery : SELF_USE.solar;
    const kwp = n * PANEL_KWP;
    const kwh = kwp * YIELD * facing;
    const yearly = kwh * self * IMPORT_PRICE + kwh * (1 - self) * EXPORT_PRICE;

    $('o-panels').textContent = `${n} panels · ${kwp.toFixed(2)} kWp`;
    panels.style.setProperty('--fill', `${((n - panels.min) / (panels.max - panels.min)) * 100}%`);
    setNumber('r-save', yearly);
    setNumber('r-kwh', kwh);
    setNumber('r-self', self * 100);
    setNumber('r-life', yearly * YEARS);
  }
  panels.addEventListener('input', calculate);
  battery.addEventListener('change', calculate);
  document.querySelectorAll('input[name="facing"]').forEach((r) => r.addEventListener('change', calculate));
  calculate();

  $('year').textContent = new Date().getFullYear();
})();
