/* C23 Solar — quote dialog, savings calculator, tabs and small interactions. No dependencies. */
(() => {
  const ROOT = (document.currentScript && document.currentScript.dataset.root) || '';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ---------- Header, dropdown, reveal ---------- */
  const nav = $('nav');
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 20), { passive: true });

  document.querySelectorAll('.nav__group').forEach((g) => {
    const btn = g.querySelector('.nav__parent');
    btn.addEventListener('click', () => {
      const open = g.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });
    g.addEventListener('focusout', (e) => {
      if (!g.contains(e.relatedTarget)) { g.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('is-pending'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('is-pending'); io.observe(el); }
    });
  }

  /* ---------- Sub-nav: highlight the section in view ---------- */
  const subLinks = [...document.querySelectorAll('.subnav a')];
  if ('IntersectionObserver' in window) {
    const targets = subLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        subLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => spy.observe(t));
  }

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        $(t.getAttribute('aria-controls')).hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const n = tabs[(i + d + tabs.length) % tabs.length];
        n.focus(); select(n);
      });
    });
  });

  /* ---------- Quote dialog ----------
   * Every [data-quote] link opens it. No backend yet: the last step opens the
   * visitor's email app addressed to the form's data-email. Without JS the
   * links fall back to the contact section. */
  const dialog = $('quote'), form = $('quote-form');
  const steps = [...form.querySelectorAll('.quote__step')];
  const next = $('quote-next'), back = $('quote-back'), status = $('quote-status');
  let current = 0;

  function show(i) {
    current = i;
    steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
    $('quote-step').textContent = `Step ${i + 1} of ${steps.length}`;
    $('quote-progress').style.width = `${((i + 1) / steps.length) * 100}%`;
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? 'Get my free quote' : 'Next';
    status.textContent = '';
    status.classList.remove('ok');
    const first = steps[i].querySelector('input');
    if (first && dialog.open) first.focus({ preventScroll: true });
  }

  function openQuote(e) {
    if (typeof dialog.showModal !== 'function') return; // old browsers follow the link
    e.preventDefault();
    if (dialog.classList.contains('is-done')) resetQuote();
    if (!dialog.open) { show(0); dialog.showModal(); steps[0].querySelector('input').focus(); }
  }
  document.querySelectorAll('[data-quote]').forEach((a) => a.addEventListener('click', openQuote));
  $('quote-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  const POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/;
  function stepValid(step) {
    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length && !step.querySelector('input:checked')) {
      status.textContent = 'Please choose an option.';
      return false;
    }
    let firstBad = null;
    step.querySelectorAll('input:not([type="radio"])').forEach((f) => {
      const v = f.value.trim();
      const bad = !v
        || (f.name === 'postcode' && !POSTCODE.test(v))
        || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(v))
        || (f.type === 'tel' && v.replace(/\D/g, '').length < 10);
      f.classList.toggle('invalid', bad);
      f.setAttribute('aria-invalid', bad);
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      status.textContent = firstBad.name === 'postcode' ? 'Please enter a full UK postcode.' : 'Please check the highlighted details.';
      return false;
    }
    return true;
  }

  function resetQuote() {
    form.reset();
    dialog.classList.remove('is-done');
    $('quote-done').hidden = true;
    next.disabled = false;
  }

  function mailtoFallback(subject, body) {
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  let sending = false;
  async function advance() {
    if (sending || !stepValid(steps[current])) return;
    if (current < steps.length - 1) { show(current + 1); return; }
    const v = Object.fromEntries(new FormData(form));
    const name = `${v.first} ${v.last}`.trim();
    const subject = `Free quote request — ${name}, ${v.postcode.toUpperCase()}`;
    const fields = {
      'Name': name, 'Phone': v.phone, 'Email': v.email, 'Postcode': v.postcode.toUpperCase(),
      'Owns the property': v.owner, 'Property type': v.property, 'Sent from': location.pathname,
    };
    const body = Object.entries(fields).map(([k, x]) => `${k}: ${x}`).join('\n');

    // No form key yet: hand over to the visitor's email app, as before.
    if (!form.dataset.key) {
      mailtoFallback(subject, body);
      status.textContent = 'Opening your email app — press send to reach us.';
      status.classList.add('ok');
      return;
    }

    sending = true;
    next.disabled = true;
    next.textContent = 'Sending…';
    status.textContent = '';
    try {
      // One send per inbox: the main key (rob@c23solar.co.uk) and, when set, a copy key
      // (rob@oneenergyprojects.com, where C23 Leads imports from). Either getting through counts.
      const send = async (key) => {
        const res = await fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key,
            subject,
            from_name: 'C23 Solar website',
            replyto: v.email,
            botcheck: Boolean(v.botcheck),
            ...fields,
            'Enquiry': body,
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === false) throw new Error(out.message || `HTTP ${res.status}`);
      };
      const keys = [form.dataset.key, form.dataset.keyCopy].filter(Boolean);
      const results = await Promise.allSettled(keys.map(send));
      if (!results.some((r) => r.status === 'fulfilled')) throw results[0].reason;
      dialog.classList.add('is-done');
      $('quote-done').hidden = false;
      $('quote-done-close').focus();
    } catch (err) {
      status.innerHTML = 'Sorry, that didn’t send. Please call <a href="tel:+447525743786">07525 743786</a> or <a href="#" id="quote-mail">email your details</a> instead.';
      const link = $('quote-mail');
      if (link) link.addEventListener('click', (e) => { e.preventDefault(); mailtoFallback(subject, body); });
    } finally {
      sending = false;
      next.disabled = false;
      next.textContent = 'Get my free quote';
    }
  }
  $('quote-done-close').addEventListener('click', () => { dialog.close(); resetQuote(); });
  next.addEventListener('click', advance);
  back.addEventListener('click', () => show(current - 1));
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); advance(); } });
  // Picking an option on a single-question step moves on automatically.
  form.addEventListener('change', (e) => {
    if (e.target.type === 'radio' && !status.classList.contains('ok')) {
      status.textContent = '';
      setTimeout(advance, reduceMotion ? 0 : 220);
    }
  });

  /* ---------- Savings calculator ----------
   * All assumptions live here and are printed under the calculator. */
  const PANEL_KWP = 0.435;        // kWp per panel
  const YIELD = 950;              // kWh per kWp per year, south-facing
  const IMPORT_PRICE = 0.25;      // £ per kWh bought
  const EXPORT_PRICE = 0.12;      // £ per kWh exported
  const SELF_USE = { solar: 0.4, battery: 0.75 };

  const bill = $('bill'), panels = $('panels'), battery = $('battery');
  if (bill) {
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

  const fill = (r) => r.style.setProperty('--fill', `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

  function calculate() {
    const n = +panels.value, monthly = +bill.value;
    const facing = +document.querySelector('input[name="facing"]:checked').value;
    const kwh = n * PANEL_KWP * YIELD * facing;
    const before = monthly * 12;
    const usage = before / IMPORT_PRICE;
    const selfUsed = Math.min(kwh * (battery.checked ? SELF_USE.battery : SELF_USE.solar), usage);
    const exported = kwh - selfUsed;
    const saving = selfUsed * IMPORT_PRICE + exported * EXPORT_PRICE;
    const after = Math.max(0, before - saving);

    $('o-bill').textContent = `£${monthly} a month`;
    $('o-panels').textContent = `${n} panels · ${(n * PANEL_KWP).toFixed(2)} kWp`;
    [bill, panels].forEach(fill);
    setNumber('r-save', Math.min(saving, before));
    setNumber('r-before', before);
    setNumber('r-after', after);
    setNumber('r-kwh', kwh);
    setNumber('r-self', kwh ? (selfUsed / kwh) * 100 : 0);
    $('bar-after').style.width = `${Math.max(2, (after / before) * 100)}%`;
  }
  [bill, panels].forEach((r) => r.addEventListener('input', calculate));
  battery.addEventListener('change', calculate);
  document.querySelectorAll('input[name="facing"]').forEach((r) => r.addEventListener('change', calculate));
  calculate();
  }

  $('year').textContent = new Date().getFullYear();

  /* ---------- Installable app ----------
   * The service worker only runs from an http(s) address, not a local file. */
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register(ROOT + 'sw.js').catch(() => {}));
  }
})();
