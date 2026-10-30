// „Frag LEXIA“ – kleiner Helfer unten rechts auf jeder Seite.
// Bewusst vorprogrammiert (keine KI, keine Kosten, nichts wird gespeichert oder verschickt):
// Antwort-Knöpfe plus einfache Stichwortsuche. Inhalte nur, was laut produkt-stand.md wirklich fertig ist.
(() => {
  const APP = 'https://lexia-nu.vercel.app';

  const WISSEN = [
    {
      id: 'was', frage: 'Was ist LEXIA?',
      worte: ['was ist', 'lexia', 'funktion', 'kann', 'macht', 'wofür', 'wissen'],
      antwort: 'LEXIA ist die Unternehmens-KI für Ihr Team: Mitarbeitende stellen Fragen in normaler Sprache und bekommen Antworten aus Ihren eigenen Dokumenten und Abläufen – immer mit Quelle. Dazu kommen Prozesse als Checklisten, Aufgaben und „Wer ist zuständig?“.',
      links: [['So funktioniert LEXIA', '/lexia']],
    },
    {
      id: 'preis', frage: 'Was kostet LEXIA?',
      worte: ['preis', 'kost', 'euro', '€', 'teuer', 'abo', 'paket', 'business', 'start', 'enterprise', 'bezahl'],
      antwort: 'Start: 149 € im Monat für bis zu 15 Personen. Business: 199 € im Monat inklusive 15 Personen, jede weitere 6 €. Enterprise: individuell. Ein KI-Guthaben ist enthalten; darüber rechnen wir die KI zum Einkaufspreis ab. Alle Preise zzgl. USt.',
      links: [['Preise im Detail', '/abo']],
    },
    {
      id: 'testen', frage: 'Kann ich LEXIA testen?',
      worte: ['test', 'ausprobier', 'kostenlos', 'gratis', 'probe', 'demo', 'anmelden', 'registrier'],
      antwort: 'Ja – 30 Tage kostenlos mit allen Funktionen. Ohne Zahlungsdaten, der Test endet von selbst. Ein Assistent richtet LEXIA in wenigen Minuten mit Ihnen ein.',
      links: [['Jetzt kostenlos testen', APP + '/registrieren']],
    },
    {
      id: 'dsgvo', frage: 'Ist LEXIA DSGVO-konform?',
      worte: ['dsgvo', 'datenschutz', 'daten', 'sicher', 'server', 'frankfurt', 'eu', 'deutschland', 'avv'],
      antwort: 'Ihre Daten liegen in Frankfurt am Main, Chats sind privat, und es gibt einen Vertrag zur Auftragsverarbeitung. Offen gesagt: Das Sprachmodell, das die Antworten formuliert, rechnet derzeit nicht garantiert in der EU.',
      links: [['Sicherheit & Technik', '/lexia#sicherheit']],
    },
    {
      id: 'chatgpt', frage: 'Was ist der Unterschied zu ChatGPT?',
      worte: ['chatgpt', 'gpt', 'copilot', 'openai', 'unterschied', 'alternative'],
      antwort: 'LEXIA antwortet nur aus Ihrem Firmenwissen, zeigt immer die Quelle und beachtet Ihre Rechte: Jede Person sieht nur, was sie auch sonst sehen darf. Weiß LEXIA etwas nicht, sagt sie das – statt zu raten.',
      links: [['Mehr über LEXIA', '/lexia']],
    },
    {
      id: 'einrichten', frage: 'Wie aufwendig ist die Einrichtung?',
      worte: ['einricht', 'aufwand', 'it-kenntnis', 'technik', 'installier', 'einführ', 'mitarbeiter einladen', 'team einladen'],
      antwort: 'Gering: Ein Assistent führt Sie durch die Einrichtung – Bereiche passend zu Ihrer Branche, Ihr Team per Liste aus Excel einladen, Logo hochladen. IT-Kenntnisse brauchen Sie nicht; auf Wunsch helfen wir persönlich.',
      links: [['Kostenlos testen', APP + '/registrieren']],
    },
    {
      id: 'chef', frage: 'Sieht mein Chef meine Fragen?',
      worte: ['chef', 'privat', 'überwach', 'kontroll', 'betriebsrat', 'leistung'],
      antwort: 'Nein. Chats sind privat – auch Admins und Flow Solutions lesen sie nicht. Statistiken zeigen nur Summen; eine Leistungskontrolle einzelner Personen ist nicht möglich.',
      links: [],
    },
    {
      id: 'kuendigen', frage: 'Kann ich jederzeit kündigen?',
      worte: ['kündig', 'laufzeit', 'vertrag', 'binden'],
      antwort: 'Das Monatsabo ist monatlich kündbar. Der kostenlose Test endet von selbst – Sie müssen nichts kündigen.',
      links: [['Preise und Bedingungen', '/abo']],
    },
    {
      id: 'pilot', frage: 'Gibt es ein Angebot für Pilotfirmen?',
      worte: ['pilot', 'rabatt', 'angebot', 'gründer', 'günstig'],
      antwort: 'Ja, für drei Pilotfirmen: 3 Monate kostenlos, danach 50 % Rabatt im ersten Jahr – gegen ehrliches Feedback.',
      links: [['Pilotplatz anfragen', '/kontakt?anliegen=pilot']],
    },
    {
      id: 'app', frage: 'Gibt es LEXIA als App?',
      worte: ['app', 'handy', 'iphone', 'android', 'mac', 'windows', 'download', 'herunterlad'],
      antwort: 'Ja – LEXIA lässt sich in wenigen Sekunden als App auf Handy und Computer installieren, ohne App Store.',
      links: [['Zum Download', '/download']],
    },
    {
      id: 'wer', frage: 'Wer steckt hinter LEXIA?',
      worte: ['wer', 'flow solutions', 'gründer', 'firma', 'esslingen', 'maximilian', 'hersteller'],
      antwort: 'Flow Solutions aus Esslingen am Neckar entwickelt LEXIA selbst. Ihr Ansprechpartner ist der Gründer Maximilian Reiser – Wünsche fließen direkt in die nächste Version ein.',
      links: [['Über uns', '/ueber-uns']],
    },
    {
      id: 'kontakt', frage: 'Ich möchte mit jemandem sprechen',
      worte: ['kontakt', 'sprechen', 'anruf', 'telefon', 'mail', 'termin', 'beratung', 'mensch'],
      antwort: 'Gern! Schreiben Sie uns über das Kontaktformular – wir melden uns persönlich.',
      links: [['Zum Kontaktformular', '/kontakt']],
    },
  ];
  const START = ['was', 'preis', 'testen', 'dsgvo', 'chatgpt', 'kontakt'];

  const finden = (text) => {
    const t = text.toLowerCase();
    let beste = null, punkte = 0;
    for (const e of WISSEN) {
      const p = e.worte.reduce((s, w) => s + (t.includes(w) ? w.length : 0), 0);
      if (p > punkte) { beste = e; punkte = p; }
    }
    return punkte >= 3 ? beste : null;
  };

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };

  const knopf = el('button', 'fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-[#141414]/95 backdrop-blur border border-lexia/40 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(50,243,221,0.18)] hover:border-lexia transition-colors');
  knopf.type = 'button';
  knopf.setAttribute('aria-expanded', 'false');
  knopf.setAttribute('aria-controls', 'fragLexia');
  knopf.innerHTML = '<span class="w-2 h-2 rounded-full bg-lexia animate-pulse" aria-hidden="true"></span>Frag LEXIA';

  const fenster = el('section', '[&[hidden]]:hidden fixed bottom-20 right-3 sm:right-5 z-[60] w-[min(380px,calc(100vw-24px))] max-h-[min(560px,calc(100dvh-110px))] flex flex-col rounded-3xl border border-slate-800 bg-[#121212] shadow-2xl');
  fenster.id = 'fragLexia';
  fenster.hidden = true;
  fenster.setAttribute('aria-label', 'Frag LEXIA');
  fenster.innerHTML = `
    <div class="flex items-center gap-2 border-b border-slate-800 px-5 py-3.5">
      <span class="w-2.5 h-2.5 rounded-full bg-[#FF453A]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#FFD60A]"></span><span class="w-2.5 h-2.5 rounded-full bg-[#30D158]"></span>
      <span class="ml-3 text-sm font-semibold">Frag LEXIA</span>
      <button type="button" data-zu class="ml-auto w-9 h-9 -mr-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Schließen">✕</button>
    </div>
    <div data-verlauf class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 text-sm" aria-live="polite"></div>
    <form data-form class="flex gap-2 border-t border-slate-800 p-3">
      <input data-eingabe type="text" maxlength="200" placeholder="Ihre Frage …" aria-label="Ihre Frage" class="flex-1 min-w-0 rounded-full bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-lexia/60">
      <button type="submit" class="rounded-full bg-lexia px-4 text-sm font-bold text-[#04201d] hover:bg-white">Fragen</button>
    </form>
    <p class="px-5 pb-3 text-[11px] text-slate-500">Vorbereitete Antworten · nichts wird gespeichert</p>`;

  const verlauf = fenster.querySelector('[data-verlauf]');
  const scrollen = () => { verlauf.scrollTop = verlauf.scrollHeight; };

  const vonMir = (text) => verlauf.append(el('p', 'ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-lexia/15 border border-lexia/30 px-4 py-2.5', text));
  const vonLexia = (text, links = [], vorschlaege = []) => {
    const box = el('div', 'max-w-[92%] rounded-2xl rounded-bl-md bg-slate-900 border border-slate-800 px-4 py-3');
    box.append(el('p', 'leading-relaxed text-slate-200', text));
    if (links.length) {
      const l = el('div', 'mt-2.5 flex flex-wrap gap-2');
      for (const [t, href] of links) {
        const a = el('a', 'inline-flex rounded-full border border-lexia/40 px-3 py-1.5 text-xs font-semibold text-lexia hover:bg-lexia hover:text-[#04201d] transition-colors', t + ' →');
        a.href = href;
        l.append(a);
      }
      box.append(l);
    }
    verlauf.append(box);
    if (vorschlaege.length) {
      const v = el('div', 'flex flex-wrap gap-2');
      v.dataset.vorschlaege = '';
      for (const id of vorschlaege) {
        const e = WISSEN.find((x) => x.id === id);
        const b = el('button', 'rounded-full border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 hover:border-lexia/60 text-left', e.frage);
        b.type = 'button';
        b.addEventListener('click', () => antworten(e.frage, e));
        v.append(b);
      }
      verlauf.append(v);
    }
    scrollen();
  };

  const antworten = (frage, treffer = finden(frage)) => {
    verlauf.querySelectorAll('[data-vorschlaege]').forEach((v) => v.remove()); // alte Vorschläge weg
    vonMir(frage);
    if (treffer) vonLexia(treffer.antwort, treffer.links, START.filter((id) => id !== treffer.id).slice(0, 3));
    else vonLexia('Dazu habe ich keine vorbereitete Antwort – ich rate nicht. Schreiben Sie uns gern, wir antworten persönlich.', [['Zum Kontaktformular', '/kontakt']], START.slice(0, 4));
  };

  let begruesst = false;
  const umschalten = (auf) => {
    fenster.hidden = !auf;
    knopf.setAttribute('aria-expanded', String(auf));
    if (auf && !begruesst) {
      begruesst = true;
      vonLexia('Hallo! Ich beantworte die häufigsten Fragen zu LEXIA. Wählen Sie eine Frage oder schreiben Sie selbst.', [], START);
    }
    if (auf) fenster.querySelector('[data-eingabe]').focus();
    else knopf.focus();
  };

  knopf.addEventListener('click', () => umschalten(fenster.hidden));
  fenster.querySelector('[data-zu]').addEventListener('click', () => umschalten(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !fenster.hidden) umschalten(false); });
  fenster.querySelector('[data-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const feld = fenster.querySelector('[data-eingabe]');
    const t = feld.value.trim();
    if (!t) return;
    feld.value = '';
    antworten(t);
  });

  document.body.append(fenster, knopf);
})();
