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
        // Auf schmalen Bildschirmen klappen die Details direkt unter dem Punkt auf (erneut tippen schließt)
        if (list.hasAttribute('data-inline-details') && innerWidth < 1024) {
          const item = tab.closest('.baustein-item');
          const open = !item.classList.contains('is-open');
          $$('.baustein-item', list).forEach((el) => el.classList.toggle('is-open', el === item && open));
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

  // ---------- Startseite: Slogan in Buchstaben zerlegen; beim Scrollen (Bereich bleibt stehen) im Flow auflösen ----------
  const heroFlow = $('#hero-flow');
  if (heroFlow) {
    let n = 0;
    const zerlegen = (knoten) => {
      [...knoten.childNodes].forEach((k) => {
        if (k.nodeType === 3) {
          // Wörter zusammenhalten (kein Umbruch mitten im Wort), darin jeder Buchstabe einzeln animiert
          const frag = document.createDocumentFragment();
          k.textContent.split(/(\s+)/).forEach((wort) => {
            if (!wort) return;
            if (/^\s+$/.test(wort)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.style.whiteSpace = 'nowrap'; w.style.display = 'inline-block';
            for (const z of wort) {
              const s = document.createElement('span');
              s.className = 'fl-b'; s.textContent = z; s.style.setProperty('--i', n++);
              w.appendChild(s);
            }
            frag.appendChild(w);
          });
          k.replaceWith(frag);
        } else if (k.nodeType === 1) zerlegen(k);
      });
    };
    $$('[data-zeile]', heroFlow).forEach(zerlegen);
    const buchstaben = $$('.fl-b', heroFlow);
    const welle = $('#heroWelle'), unten = $('#heroUnten'), hinweis = $('#heroHinweis');
    if (!reducedMotion) {
      let tick = false;
      const update = () => {
        tick = false;
        const weg = Math.max(heroFlow.offsetHeight - innerHeight, 1);
        const p = Math.min(Math.max(-heroFlow.getBoundingClientRect().top / weg, 0), 1);
        // Buchstaben lösen sich über den ganzen Scrollweg auf (bis zum Schluss), die Welle tritt früher zurück
        const q = Math.min(Math.max((p - 0.04) / 0.96, 0), 1);
        const e = q * q * (3 - 2 * q);
        buchstaben.forEach((b, i) => {
          if (!e) { b.style.transform = ''; b.style.opacity = ''; b.style.filter = ''; return; }
          const phase = i * 0.55;
          const dx = Math.sin(phase) * 70 * e;
          const dy = (-40 - 90 * Math.abs(Math.cos(phase))) * e - Math.sin(phase + e * 3) * 18 * e;
          b.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${Math.sin(phase) * 20 * e}deg)`;
          b.style.opacity = String(Math.max(1 - e * 1.15, 0));
          b.style.filter = `blur(${(e * 6).toFixed(2)}px)`;
        });
        const u = Math.min(Math.max((p - 0.15) / 0.45, 0), 1);
        if (welle) { welle.style.transform = `translate(-50%, -50%) scale(${1 + e * 0.35})`; welle.style.opacity = String(1 - u * 0.9); }
        if (unten) { unten.style.transform = `translateY(${-50 * e}px)`; unten.style.opacity = String(1 - u); }
        if (hinweis) hinweis.style.opacity = String(Math.max(1 - p * 8, 0));
      };
      addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
      addEventListener('resize', update, { passive: true });
      update();
    }
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

  // ---------- LEXIA: Verweis "In der Demo ausprobieren" öffnet den passenden Reiter ----------
  $$('[data-demo-tab]').forEach((link) => link.addEventListener('click', () => {
    document.getElementById(link.dataset.demoTab)?.click();
  }));

  // ---------- LEXIA: Buchstaben der Wortmarke fliegen beim Scrollen auseinander ----------
  const mark = $('#lexiaMark');
  if (mark && !reducedMotion) {
    const letters = $$('.lx-l', mark);
    // Richtung je Buchstabe (x, y in SVG-Einheiten, Drehung in Grad)
    const dirs = [[-520, -260, -40], [-260, 380, 25], [0, -460, 140], [240, 420, -30], [520, -240, 45]];
    let ticking = false;
    const update = () => {
      ticking = false;
      // Die Wortmarke bleibt beim Scrollen stehen, bis die Buchstaben auseinandergeflogen sind
      const range = innerHeight * 0.45;
      const y = Math.min(Math.max(scrollY, 0), range);
      const p = y / range;
      const e = p * p * (3 - 2 * p);
      mark.style.transform = y ? `translate3d(0, ${y}px, 0)` : '';
      letters.forEach((el, i) => {
        const [x, yy, r] = dirs[i] || [0, 0, 0];
        el.style.transform = p ? `translate(${x * e}px, ${yy * e}px) rotate(${r * e}deg)` : '';
        el.style.opacity = p ? Math.max(1 - p * 1.15, 0) : '';
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // ---------- LEXIA: Symbole wandern in zufälliger Reihenfolge von den Quellen zu LEXIA ----------
  const stage = $('#flowStage');
  if (stage && !reducedMotion) {
    const sources = $$('.flow-src', stage);
    const desktopPaths = $$('.flow-path', stage);
    const mobilePath = $('.flow-path-mobile', stage);
    const hub = $('#flowHub');
    const icons = $$('template[data-flow-icon]', stage).map((t) => t.innerHTML);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let visible = false, timer = 0, last = -1;

    const fly = () => {
      const desktop = innerWidth >= 1024;
      let i;
      do { i = Math.floor(Math.random() * sources.length); } while (sources.length > 1 && i === last && Math.random() < 0.7);
      last = i;
      const path = desktop ? desktopPaths[i] : mobilePath;
      if (!path || !path.getBoundingClientRect().width && !path.getBoundingClientRect().height) return;
      const token = document.createElement('div');
      token.className = 'flow-token';
      token.innerHTML = icons[i] || '';
      stage.appendChild(token);
      sources[i].classList.add('is-sending');
      setTimeout(() => sources[i].classList.remove('is-sending'), 600);
      const len = path.getTotalLength();
      const dur = 1700 + Math.random() * 900;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        // Punkt auf dem Pfad in Bildschirm-Koordinaten umrechnen (SVG ist verzerrt skaliert)
        const pt = path.getPointAtLength(ease(t) * len).matrixTransform(path.getScreenCTM());
        const box = stage.getBoundingClientRect();
        const fade = Math.min(t / 0.12, (1 - t) / 0.15, 1);
        token.style.opacity = fade;
        token.style.transform = `translate3d(${pt.x - box.left}px, ${pt.y - box.top}px, 0) scale(${0.7 + 0.3 * fade})`;
        if (t < 1) requestAnimationFrame(step);
        else {
          token.remove();
          hub.classList.add('is-hit');
          setTimeout(() => hub.classList.remove('is-hit'), 450);
        }
      };
      requestAnimationFrame(step);
    };

    // unregelmäßige Abstände; manchmal zwei Symbole kurz nacheinander
    const schedule = () => {
      clearTimeout(timer);
      if (!visible) return;
      timer = setTimeout(() => { if (!document.hidden) fly(); schedule(); }, Math.random() < 0.25 ? 180 + Math.random() * 250 : 550 + Math.random() * 1500);
    };
    // Sobald der Bereich ins Bild kommt, sofort das erste Symbol schicken – nicht erst nach der Zufallspause
    new IntersectionObserver(([entry]) => {
      const neu = entry.isIntersecting && !visible;
      visible = entry.isIntersecting;
      if (neu && !document.hidden) fly();
      schedule();
    }, { threshold: 0.1 }).observe(stage);
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
    const lohn = document.getElementById('kLohn');
    const wert = document.getElementById('kWert');
    let shown = 0;
    let timer;
    const update = () => {
      const [people, minutes, days] = inputs.map((el) => Math.max(parseFloat(el.value) || 0, 0));
      const target = (people * minutes * days) / 60;
      // Wert der Hälfte der Suchzeit – bewusst vorsichtig gerechnet
      if (wert && lohn) wert.textContent = num(Math.round((target / 2) * Math.max(parseFloat(lohn.value) || 0, 0)), 0);
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
    [...inputs, lohn].filter(Boolean).forEach((el) => el.addEventListener('input', update));
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

  // ---------- Startseite: Live-Vorschau – Frage wird getippt, Antwort erscheint mit Quelle ----------
  const live = $('#liveDemo');
  if (live) {
    const fragen = JSON.parse(live.dataset.fragen);
    const knoepfe = $$('[data-frage]');
    const frageEl = $('#liveFrage'), antwortEl = $('#liveAntwort'), quellenEl = $('#liveQuellen'), box = $('#liveAntwortBox');
    let aktuell = 0, lauf = 0, auto = 0, sichtbar = false;
    const chip = (q) => q.map(([art, text]) => art === 'luecke'
      ? `<span class="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-1 text-xs text-yellow-300">${text}</span>`
      : `<span class="inline-flex items-center gap-1.5 rounded-full border border-lexia/30 bg-lexia/10 px-3 py-1 text-xs text-lexia">${text}</span>`).join('');
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const zeigen = async (i) => {
      const meinLauf = ++lauf;
      aktuell = i;
      knoepfe.forEach((k) => k.setAttribute('aria-pressed', String(+k.dataset.frage === i)));
      const f = fragen[i];
      if (reducedMotion) { frageEl.textContent = f.f; antwortEl.textContent = f.a; quellenEl.innerHTML = chip(f.q); return; }
      box.style.opacity = '0';
      frageEl.textContent = '';
      for (const z of f.f) { if (meinLauf !== lauf) return; frageEl.textContent += z; await warte(38); }
      await warte(450);
      if (meinLauf !== lauf) return;
      antwortEl.textContent = ''; quellenEl.innerHTML = '';
      box.style.opacity = '1';
      const woerter = f.a.split(' ');
      for (let w = 0; w < woerter.length; w++) { if (meinLauf !== lauf) return; antwortEl.textContent += (w ? ' ' : '') + woerter[w]; await warte(55); }
      quellenEl.innerHTML = chip(f.q);
    };
    const weiter = () => { clearTimeout(auto); if (sichtbar) auto = setTimeout(() => { zeigen((aktuell + 1) % fragen.length).then(weiter); }, 6500); };
    box.style.transition = 'opacity .3s ease';
    knoepfe.forEach((k) => k.addEventListener('click', () => { clearTimeout(auto); zeigen(+k.dataset.frage).then(weiter); }));
    if ('IntersectionObserver' in window) {
      let erstes = true;
      new IntersectionObserver(([e]) => {
        sichtbar = e.isIntersecting;
        if (sichtbar && erstes) { erstes = false; zeigen(0).then(weiter); } else weiter();
      }, { threshold: 0.35 }).observe(live);
    }
  }

  // ---------- LEXIA: Rollen-Umschalter („Wer sind Sie?“) ----------
  $$('.rollen').forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const zeigen = (tab) => {
      tabs.forEach((t) => {
        const an = t === tab;
        t.setAttribute('aria-selected', String(an));
        t.tabIndex = an ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !an;
      });
    };
    tabs.forEach((t, i) => {
      t.tabIndex = i === 0 ? 0 : -1;
      t.addEventListener('click', () => zeigen(t));
      t.addEventListener('keydown', (e) => {
        const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!n) return;
        e.preventDefault();
        const ziel = tabs[(i + n + tabs.length) % tabs.length];
        zeigen(ziel);
        ziel.focus();
      });
    });
  });

  // ---------- Download-Seite: Versionen und App-Adresse aus assets/downloads.json ----------
  const dl = $('#dlDateien');
  if (dl || $('[data-app-link]')) {
    fetch('/assets/downloads.json', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      $$('[data-app-link]').forEach((a) => { if (d.app_url) a.href = d.app_url + (a.dataset.appPfad || ''); });
      if (!dl) return;
      const a = d.aktuell || {};
      const datum = a.datum ? new Date(a.datum).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      $('#dlVersion').textContent = a.version ? `Version ${a.version}${datum ? ' · ' + datum : ''}` : '';
      $('#dlHinweis').textContent = a.hinweis || '';
      dl.innerHTML = (a.dateien || []).map((f) => f.url
        ? `<a href="${f.url}" class="flex items-center justify-between gap-3 rounded-2xl bg-lexia text-[#04201d] px-5 py-4 font-bold hover:bg-white transition-colors"><span>Für ${f.name} herunterladen</span><span class="text-sm font-semibold opacity-75">${f.groesse || ''}</span></a>`
        : `<div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4"><span class="font-semibold">${f.name}</span><span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-700 text-slate-400">Bald verfügbar</span></div>`).join('');
      const alt = d.frueher || [];
      $('#dlFrueher').innerHTML = alt.length ? `<details><summary class="cursor-pointer text-sm text-slate-400">Frühere Versionen</summary><ul class="mt-3 space-y-2 text-sm">${alt.map((v) => `<li>${v.version} · ${v.datum}${(v.dateien || []).filter((f) => f.url).map((f) => ` · <a class="text-lexia" href="${f.url}">${f.name}</a>`).join('')}</li>`).join('')}</ul></details>` : '';
    }).catch(() => {});
  }

  // ---------- Kaufseite: Zusammenfassung live rechnen, Bestellung an LEXIA senden ----------
  const kauf = $('#kaufForm');
  if (kauf) {
    const p = new URLSearchParams(location.search).get('paket');
    if (p === 'start' || p === 'business') $$('input[name="paket"]', kauf).forEach((r) => { r.checked = r.value === p; });
    const geld = (x) => x.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    const stand = () => {
      const paket = $('input[name="paket"]:checked', kauf).value;
      const personen = Math.max(1, Math.round(+$('#kPersonen').value || 1));
      const plan = paket === 'start' ? { base: 149, perPerson: 0, incl: 15, credit: 20, creditPP: 0 } : { base: 199, perPerson: 6, incl: 15, credit: 20, creditPP: 1 };
      const weitere = paket === 'start' ? 0 : Math.max(0, personen - plan.incl);
      const netto = plan.base + weitere * plan.perPerson;
      return { paket, personen, plan, weitere, netto, guthaben: plan.credit + weitere * plan.creditPP };
    };
    const zeigen = () => {
      const s = stand();
      $('#kPersonenFeld').hidden = s.paket === 'start';
      $('#kPaket').textContent = s.paket === 'start' ? 'START' : 'BUSINESS';
      $('#kGrund').textContent = geld(s.plan.base);
      $('#kWeitere').textContent = s.paket === 'start' ? 'bis 15 inklusive' : s.weitere ? `15 inkl. + ${s.weitere} × 6 € = ${geld(s.weitere * 6)}` : '15 inklusive';
      $('#kGuthaben').textContent = `${geld(s.guthaben)} inklusive`;
      $('#kNetto').textContent = geld(s.netto);
      $('#kUst').textContent = geld(s.netto * 0.19);
      $('#kBrutto').textContent = geld(s.netto * 1.19);
    };
    kauf.addEventListener('input', zeigen);
    kauf.addEventListener('change', zeigen);
    zeigen();
    kauf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fehler = $('#kFehler');
      const zeige = (t) => { fehler.textContent = t; fehler.classList.toggle('hidden', !t); };
      const f = new FormData(kauf);
      const s = stand();
      const daten = {
        paket: s.paket, personen: s.paket === 'start' ? 1 : s.personen, zahlweise: f.get('zahlweise') || 'rechnung',
        firma: f.get('firma'), anschrift: f.get('anschrift'), ust_id: f.get('ust_id'), name: f.get('name'), email: f.get('email'),
        telefon: f.get('telefon'), nachricht: f.get('nachricht'), website: f.get('website'), netto_monat: s.netto, zustimmung: $('#kZustimmung').checked,
      };
      if (!String(daten.firma || '').trim() || !String(daten.name || '').trim()) return zeige('Bitte Firma und Ihren Namen angeben.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(daten.email || ''))) return zeige('Bitte eine gültige E-Mail-Adresse angeben.');
      if (!daten.zustimmung) return zeige('Bitte bestätigen Sie die Hinweise zur Bestellung.');
      zeige('');
      const knopf = $('#kSenden'); knopf.disabled = true; knopf.textContent = 'Wird gesendet …';
      try {
        const cfg = await fetch('/assets/downloads.json', { cache: 'no-store' }).then((r) => r.json());
        const r = await fetch(`${cfg.app_url}/api/bestellung`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(daten) });
        const a = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(a.fehler || 'Fehler');
        kauf.hidden = true; $('#kDanke').classList.remove('hidden'); scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        // Notfall: Bestellung per E-Mail-Programm schicken, damit nichts verloren geht
        const text = `Bestellung LEXIA ${s.paket === 'start' ? 'Start' : 'Business'}${s.paket === 'business' ? ` (${s.personen} Personen)` : ''}%0D%0AFirma: ${encodeURIComponent(daten.firma)}%0D%0AAnschrift: ${encodeURIComponent(daten.anschrift || '')}%0D%0AUSt-IdNr.: ${encodeURIComponent(daten.ust_id || '')}%0D%0AAnsprechperson: ${encodeURIComponent(daten.name)}, ${encodeURIComponent(daten.email)} ${encodeURIComponent(daten.telefon || '')}%0D%0AZahlung: Rechnung%0D%0A${encodeURIComponent(daten.nachricht || '')}`;
        zeige(`${err.message && err.message !== 'Fehler' && err.message !== 'Failed to fetch' ? err.message + ' ' : ''}Sie können die Bestellung auch per E-Mail senden: `);
        const link = document.createElement('a'); link.href = `mailto:flowsolutions.digital@gmail.com?subject=Bestellung LEXIA&body=${text}`; link.textContent = 'E-Mail öffnen'; link.className = 'underline font-semibold';
        fehler.appendChild(link);
        knopf.disabled = false; knopf.textContent = 'Bestellung absenden';
      }
    });
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
  // Grundpreis + max(0, Personen − enthaltene Personen) × € je Person + max(0, KI-Kosten − KI-Guthaben)  (KI zum Einkaufspreis)
  // KI-Kosten je Antwort sind hier nur Schätzwerte; LEXIA rechnet den echten Verbrauch ab.
  const PLANS = {
    start: { name: 'Start', base: 149, perPerson: 0, peopleIncluded: 0, credit: 20, creditPerPerson: 0, maxPeople: 15 },
    business: { name: 'Business', base: 199, perPerson: 6, peopleIncluded: 15, credit: 20, creditPerPerson: 1, maxPeople: Infinity },
  };
  const PER_ANSWER = { schnell: 0.0005, standard: 0.002, gruendlich: 0.015 };
  const monthlyPrice = (plan, people, answers, stufe = 'standard') => {
    const extraPeople = Math.max(0, people - plan.peopleIncluded);
    const credit = plan.credit + extraPeople * plan.creditPerPerson;
    const ai = answers * (PER_ANSWER[stufe] ?? PER_ANSWER.standard);
    const overCost = Math.max(0, ai - credit);
    return { plan, people, extraPeople, credit, ai, overCost,
      fixed: plan.base + plan.perPerson * extraPeople,
      total: plan.base + plan.perPerson * extraPeople + overCost };
  };
  window.lexiaPrice = (planKey, people, perDay, days = 21, stufe = 'standard') => {
    const answers = people * perDay * days;
    return { answers, ...monthlyPrice(PLANS[planKey], people, answers, stufe) };
  };
  const calc = $('#priceCalc');
  if (calc) {
    const people = $('#pcPeople'), perDay = $('#pcQuestions'), days = $('#pcDays'), stufe = $('#pcStufe');
    const pick = $$('#pcPlanPick button');
    let chosen = 'start';
    const fmt = (r) => euro(r.total, r.overCost % 1 ? 2 : 0);
    const update = () => {
      $('#pcPeopleOut').textContent = people.value;
      $('#pcQuestionsOut').textContent = perDay.value;
      const p = +people.value, q = +perDay.value, d = Math.max(+days.value || 0, 0);
      const startOk = p <= PLANS.start.maxPeople;
      pick[0].disabled = !startOk;
      const key = startOk ? chosen : 'business';
      pick.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.plan === key)));
      const st = stufe ? stufe.value : 'standard';
      const b = window.lexiaPrice(key, p, q, d, st);
      $('#pcPlan').textContent = b.plan.name;
      $('#pcTotal').textContent = fmt(b);
      $('#pcAnswers').textContent = num(b.answers);
      $('#pcBase').textContent = euro(b.plan.base);
      $('#pcPersons').textContent = !b.plan.perPerson || !b.extraPeople ? 'im Grundpreis enthalten' : `${b.plan.peopleIncluded} enthalten + ${b.extraPeople} × ${euro(b.plan.perPerson)} = ${euro(b.plan.perPerson * b.extraPeople)}`;
      $('#pcKi').textContent = euro(b.ai, 2);
      $('#pcIncluded').textContent = euro(b.credit, 0);
      $('#pcOver').textContent = b.overCost > 0 ? euro(b.overCost, 2) : 'nichts';
      $('#pcYearly').textContent = euro((b.fixed * 10 + b.overCost * 12) / 12, 0);
      $('#pcCompare').textContent = !startOk
        ? 'Start gilt für bis zu 15 Personen – ab 16 Personen ist Business das passende Paket.'
        : key === 'start'
          ? `Mit Business (Organigramm, Einarbeitung, Vier-Augen-Prinzip, Nachweise) wären es ${fmt(window.lexiaPrice('business', p, q, d, st))}.`
          : `Ohne die Business-Funktionen reicht Start für ${fmt(window.lexiaPrice('start', p, q, d, st))}.`;
    };
    pick.forEach((btn) => btn.addEventListener('click', () => { chosen = btn.dataset.plan; update(); }));
    [people, perDay, days, stufe].filter(Boolean).forEach((el) => el.addEventListener('input', update));
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
    // Nachricht geht direkt an LEXIA (Liste auf der Plattform + Mail an Flow Solutions + Bestätigung an den Absender).
    // Klappt das nicht, öffnet sich wie bisher das E-Mail-Programm – es geht nichts verloren.
    const ANLIEGEN = { demo: 'Demo', pilot: 'Pilot', enterprise: 'Enterprise', sonstiges: 'Sonstiges' };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = (id) => (document.getElementById(id)?.value || '').trim();
      const gewaehlt = chips.filter((c) => c.getAttribute('aria-pressed') === 'true');
      const topics = gewaehlt.map((c) => c.textContent.trim());
      const name = [val('first-name'), val('last-name')].filter(Boolean).join(' ');
      const nachricht = [val('sonstigesText') ? `Sonstiges: ${val('sonstigesText')}` : '', val('message')].filter(Boolean).join('\n\n');
      const knopf = $('button[type="submit"]', form);
      const alterText = knopf ? knopf.innerHTML : '';
      if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird gesendet …'; }
      try {
        const cfg = await fetch('/assets/downloads.json', { cache: 'no-store' }).then((r) => r.json());
        const r = await fetch(`${cfg.app_url}/api/kontakt`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, firma: val('company'), email: val('email'), anliegen: gewaehlt.map((c) => ANLIEGEN[c.dataset.topic]).filter(Boolean), nachricht, website: (form.querySelector('[name="website"]') || {}).value || '' }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).fehler || 'Fehler');
        form.innerHTML = '<div class="rounded-3xl border border-lexia/40 bg-[#0b1817] p-8 text-center"><p class="text-2xl font-extrabold">Danke – Ihre Nachricht ist angekommen.</p><p class="mt-3 text-slate-300">Wir melden uns innerhalb eines Werktags. Eine Bestätigung ist per E-Mail unterwegs.</p></div>';
      } catch (err) {
        if (knopf) { knopf.disabled = false; knopf.innerHTML = alterText; }
        const lines = [`Name: ${name}`, `Firma: ${val('company') || '–'}`, `E-Mail: ${val('email')}`, `Anliegen: ${topics.join(', ') || '–'}`, '', nachricht];
        const subject = `Anfrage über die Website${name ? ' – ' + name : ''}`;
        location.href = `mailto:flowsolutions.digital@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      }
    });
  }
})();
