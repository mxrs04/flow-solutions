// Gemeinsames Skript für alle Seiten. Jeder Teil prüft, ob seine Elemente auf der Seite existieren.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const euro = (v, digits = 0) =>
    v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits });
  const num = (v, digits = 0) => v.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Menü ----------
  const menu = $('#siteMenu');
  const menuBtn = $('#menuBtn');
  const backdrop = $('#menuBackdrop');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('-translate-x-full', !open);
    menu.inert = !open;
    backdrop.classList.toggle('opacity-0', !open);
    backdrop.classList.toggle('pointer-events-none', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) $('a', menu)?.focus();
    else menuBtn.focus({ preventScroll: true });
  }
  menuBtn?.addEventListener('click', () => setMenu(true));
  $('#menuClose')?.addEventListener('click', () => setMenu(false));
  backdrop?.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  const path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  $$('.menu-link').forEach((a) => {
    if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page');
  });

  // ---------- Eigener Mauszeiger (nur Desktop mit Maus) ----------
  const cursor = $('#customCursor');
  if (cursor && matchMedia('(min-width: 768px) and (pointer: fine)').matches) {
    cursor.classList.remove('hidden');
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }, { passive: true });
    document.addEventListener('mouseover', (e) => {
      cursor.classList.toggle('active', !!e.target.closest('a, button, input, textarea, label, select, .hover-scale'));
    });
  }

  // ---------- Einblenden beim Scrollen ----------
  const revealTargets = [
    ...$$('[data-reveal]'),
    ...$$('[data-reveal-stagger]').flatMap((group) =>
      [...group.children].map((child, i) => {
        child.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
        return child;
      })
    ),
  ];
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        io.unobserve(el);
        // aufräumen, damit Hover-Effekte wieder normal greifen
        setTimeout(() => {
          el.classList.remove('reveal', 'is-visible');
          el.style.transitionDelay = '';
        }, 1500);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // ---------- Aufklapp-Elemente (FAQ, Bausteine) ----------
  $$('.acc-item').forEach((item) => {
    const btn = $('.acc-btn', item);
    btn?.setAttribute('aria-expanded', 'false');
    btn?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      const group = item.closest('[data-acc-single]');
      if (group) $$('.acc-item.is-open', group).forEach((o) => {
        o.classList.remove('is-open');
        $('.acc-btn', o)?.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // ---------- Reiter ----------
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const select = (tab) => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        select(tab);
        // Auf schmalen Bildschirmen stehen die Details unter der Liste – dorthin scrollen
        if (list.hasAttribute('data-scroll-panel') && innerWidth < 1024) {
          document.getElementById(tab.getAttribute('aria-controls')).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        }
      });
      tab.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  // ---------- App-Ansicht: Aufgaben abhaken & Fragevorschläge ----------
  $$('.task-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const done = btn.closest('.task').classList.toggle('task-done');
      btn.setAttribute('aria-pressed', String(done));
    });
  });
  const mockAnswer = $('#mockAnswer');
  $$('[data-answer]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const tpl = document.getElementById(chip.dataset.answer);
      mockAnswer.innerHTML = '';
      mockAnswer.appendChild(tpl.content.cloneNode(true));
      mockAnswer.hidden = false;
      $$('[data-answer]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    });
  });

  // ---------- Zahlen hochzählen ----------
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    if (reducedMotion) { el.textContent = num(target); return; }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1400, 1);
      el.textContent = num(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counters = $$('[data-count]');
  if (counters.length) {
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { countUp(entry.target); io.unobserve(entry.target); }
    }), { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  }

  // ---------- Startseite: Slogan-Animation beim Scrollen ----------
  const hero = $('#hero-section');
  const heroLines = [$('#hero-line1'), $('#hero-line2')];
  const heroBottom = [$('#hero-h1'), $('#hero-cta-container')].filter(Boolean);
  if (hero && heroLines.every(Boolean) && !reducedMotion) {
    const update = () => {
      if (innerWidth < 768) {
        [...heroLines, ...heroBottom].forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
        return;
      }
      // Animation läuft auf den ersten 40 % der Hero-Höhe; der Slogan wird dabei mitgeführt
      const range = (hero.offsetHeight || 600) * 0.4;
      const p = Math.min(Math.max(scrollY / range, 0), 1);
      const eased = p * p * (3 - 2 * p);
      const pinY = Math.min(Math.max(scrollY, 0), range);
      const opacity = Math.max(1 - p * 1.1, 0);
      heroLines.forEach((el, i) => {
        el.style.transform = `translate3d(${(i ? 1 : -1) * eased * 100}%, ${pinY}px, 0)`;
        el.style.opacity = opacity;
      });
      heroBottom.forEach((el) => {
        el.style.transform = `translate3d(0, ${p * 120}px, 0)`;
        el.style.opacity = opacity;
      });
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  // ---------- Startseite: Wörter leuchten beim Scrollen auf ----------
  const revealSec = $('#text-reveal-section');
  const revealText = $('#reveal-text');
  if (revealSec && revealText) {
    const words = revealText.textContent.trim().split(/\s+/);
    revealText.innerHTML = words.map((w) => `<span class="inline-block mx-1.5 sm:mx-2 transition-colors duration-200 text-slate-600">${w}</span>`).join(' ');
    const spans = $$('span', revealText);
    const update = () => {
      const rect = revealSec.getBoundingClientRect();
      const pivot = innerHeight * 0.55;
      const startY = pivot + 160;
      const endY = pivot - rect.height + 160;
      const progress = Math.min(Math.max((startY - rect.top) / (startY - endY), 0), 1);
      const active = reducedMotion ? spans.length : Math.floor(progress * spans.length);
      spans.forEach((s, i) => {
        s.classList.toggle('text-white', i < active);
        s.classList.toggle('text-slate-600', i >= active);
      });
    };
    addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------- Startseite: „Der Unterschied“ ----------
  const roi = $('#roi-cards-container');
  if (roi) {
    if (reducedMotion) roi.classList.add('animated');
    else {
      const update = () => {
        if (innerWidth < 768) return;
        const rect = roi.getBoundingClientRect();
        roi.classList.toggle('animated', rect.top + rect.height / 2 <= innerHeight && rect.bottom >= 0);
      };
      addEventListener('scroll', update, { passive: true });
      update();
    }
  }

  // ---------- Startseite: Wissens-Rechner ----------
  const kOut = $('#kCalcResult');
  if (kOut) {
    const inputs = ['kPeople', 'kMinutes', 'kDays'].map((id) => document.getElementById(id));
    let shown = 0;
    let timer;
    const update = () => {
      const [people, minutes, days] = inputs.map((el) => Math.max(parseFloat(el.value) || 0, 0));
      const target = (people * minutes * days) / 60;
      const from = shown;
      const start = performance.now();
      clearInterval(timer);
      timer = setInterval(() => {
        const t = reducedMotion ? 1 : Math.min((performance.now() - start) / 400, 1);
        shown = from + (target - from) * (1 - Math.pow(1 - t, 3));
        kOut.textContent = num(shown, 1);
        if (t === 1) clearInterval(timer);
      }, 16);
    };
    inputs.forEach((el) => el.addEventListener('input', update));
    update();
  }

  // ---------- LEXIA: animierte Chat-Demo ----------
  const chat = $('#chatDemo');
  if (chat) {
    const scenes = JSON.parse($('#chatScenes').textContent);
    const body = $('#chatBody', chat);
    const input = $('#chatInput', chat);
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const bubble = (html, cls) => {
      const el = document.createElement('div');
      el.className = `chat-msg ${cls}`;
      el.innerHTML = html;
      body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      body.scrollTop = body.scrollHeight;
      return el;
    };
    const answerHtml = (s) => `
      <p>${esc(s.answer)}</p>
      <div class="flex flex-wrap gap-2 mt-3">${s.sources.map((src) =>
        `<span class="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-lexia/30 bg-lexia/10 text-lexia">
           <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>${esc(src)}</span>`).join('')}
      </div>
      <button type="button" tabindex="-1" class="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full bg-lexia text-[#04201d]">${esc(s.action)}</button>`;

    async function play() {
      for (;;) {
        for (const s of scenes) {
          body.innerHTML = '';
          bubble(`<p class="text-slate-400 text-xs mb-1">LEXIA</p><p>${esc(s.greeting)}</p>`, 'self-start bg-slate-800/70 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]');
          await sleep(900);
          input.classList.add('typing-caret');
          for (let i = 1; i <= s.question.length; i++) {
            input.textContent = s.question.slice(0, i);
            await sleep(38 + Math.random() * 40);
          }
          await sleep(450);
          input.classList.remove('typing-caret');
          input.textContent = '';
          bubble(esc(s.question), 'self-end bg-lexia/15 border border-lexia/30 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]');
          await sleep(500);
          const dots = bubble('<span class="dots"><span></span><span></span><span></span></span>', 'self-start bg-slate-800/70 rounded-2xl rounded-tl-md px-4 py-3');
          await sleep(1300);
          dots.remove();
          bubble(answerHtml(s), 'self-start bg-slate-800/70 rounded-2xl rounded-tl-md px-4 py-3 max-w-[92%] text-sm leading-relaxed');
          await sleep(4800);
        }
      }
    }
    if (reducedMotion) {
      const s = scenes[0];
      bubble(esc(s.question), 'show self-end bg-lexia/15 border border-lexia/30 rounded-2xl px-4 py-3 max-w-[85%]');
      bubble(answerHtml(s), 'show self-start bg-slate-800/70 rounded-2xl px-4 py-3 max-w-[92%] text-sm');
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { io.disconnect(); play(); }
      }, { threshold: 0.3 });
      io.observe(chat);
    }
  }

  // ---------- Abo: monatlich / jährlich ----------
  const billing = $('.billing-toggle');
  if (billing) {
    const set = (mode) => {
      $$('button', billing).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      $$('[data-show]').forEach((el) => { el.hidden = el.dataset.show !== mode; });
    };
    $$('button', billing).forEach((b) => b.addEventListener('click', () => set(b.dataset.mode)));
    set('monthly');
  }

  // ---------- Abo: Preisrechner ----------
  // Muss mit der Preistabelle in LEXIA übereinstimmen (Plattform → Finanzen → Preise):
  // Grundpreis + Personen × € je Person + max(0, Antworten − Kontingent) × € je weitere Antwort
  const PLANS = {
    start: { name: 'Start', base: 149, perPerson: 0, included: () => 3000, extra: 0.03, maxPeople: 15 },
    business: { name: 'Business', base: 149, perPerson: 6, included: (p) => 150 * p, extra: 0.03, maxPeople: Infinity },
  };
  const monthlyPrice = (plan, people, answers) => {
    const included = plan.included(people);
    const over = Math.max(0, answers - included);
    return { plan, included, over, people,
      fixed: plan.base + plan.perPerson * people,
      overCost: over * plan.extra,
      total: plan.base + plan.perPerson * people + over * plan.extra };
  };
  window.lexiaPrice = (people, perDay, days = 21) => {
    const answers = people * perDay * days;
    const options = Object.values(PLANS).filter((p) => people <= p.maxPeople).map((p) => monthlyPrice(p, people, answers));
    return { answers, options, best: options.reduce((a, b) => (b.total < a.total ? b : a)) };
  };
  const calc = $('#priceCalc');
  if (calc) {
    const people = $('#pcPeople'), perDay = $('#pcQuestions'), days = $('#pcDays');
    const update = () => {
      $('#pcPeopleOut').textContent = people.value;
      $('#pcQuestionsOut').textContent = perDay.value;
      const r = window.lexiaPrice(+people.value, +perDay.value, Math.max(+days.value || 0, 0));
      const b = r.best;
      $('#pcPlan').textContent = b.plan.name;
      $('#pcTotal').textContent = euro(b.total, b.overCost % 1 ? 2 : 0);
      $('#pcAnswers').textContent = num(r.answers);
      $('#pcBase').textContent = euro(b.plan.base);
      $('#pcPersons').textContent = b.plan.perPerson ? `${b.people} × ${euro(b.plan.perPerson)} = ${euro(b.plan.perPerson * b.people)}` : 'im Grundpreis enthalten';
      $('#pcIncluded').textContent = `${num(b.included)} Antworten`;
      $('#pcOver').textContent = b.over ? `${num(b.over)} × 3 ct = ${euro(b.overCost, 2)}` : 'keiner';
      const yearlyPerMonth = (b.fixed * 10 + b.overCost * 12) / 12;
      $('#pcYearly').textContent = euro(yearlyPerMonth, 0);
      const other = r.options.find((o) => o !== b);
      $('#pcCompare').textContent = other
        ? `Zum Vergleich: ${other.plan.name} läge bei ${euro(other.total, other.overCost % 1 ? 2 : 0)}.`
        : 'Ab 16 Personen ist Business das passende Paket.';
    };
    [people, perDay, days].forEach((el) => el.addEventListener('input', update));
    update();
  }

  // ---------- Kontakt: Anliegen + vorausgefüllte E-Mail ----------
  const form = $('#contactForm');
  if (form) {
    const chips = $$('.toggle-chip', form);
    const other = $('#sonstigesContainer');
    const syncOther = () => other.classList.toggle('hidden', !chips.some((c) => c.dataset.topic === 'sonstiges' && c.getAttribute('aria-pressed') === 'true'));
    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', () => {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
        syncOther();
      });
    });
    const presets = {
      demo: ['demo'], pilot: ['pilot'], enterprise: ['enterprise'],
      download: ['sonstiges', 'Bitte benachrichtigen Sie mich, sobald die Desktop-App verfügbar ist.'],
    };
    const preset = presets[new URLSearchParams(location.search).get('anliegen')];
    if (preset) {
      chips.find((c) => c.dataset.topic === preset[0])?.setAttribute('aria-pressed', 'true');
      if (preset[1]) $('#sonstigesText').value = preset[1];
      syncOther();
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (id) => (document.getElementById(id)?.value || '').trim();
      const topics = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent.trim());
      const name = [val('first-name'), val('last-name')].filter(Boolean).join(' ');
      const lines = [`Name: ${name}`, `Firma: ${val('company') || '–'}`, `E-Mail: ${val('email')}`, `Anliegen: ${topics.join(', ') || '–'}`];
      if (val('sonstigesText')) lines.push(`Sonstiges: ${val('sonstigesText')}`);
      lines.push('', val('message'));
      const subject = `Anfrage über die Website${name ? ' – ' + name : ''}`;
      location.href = `mailto:flowsolutions.digital@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    });
  }
})();
