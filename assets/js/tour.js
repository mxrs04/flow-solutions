// Rundgänge beim Scrollen: ein Abschnitt [data-tour] bleibt stehen, die Scroll-Position wählt den Schritt.
// Wiederverwendbar für jede Funktion – im HTML genügen diese Markierungen:
//   [data-tour-schritt="n"]   Erklärung zu Schritt n (links); data-fokus="x,y,breite" = Ausschnitt fürs Handy
//   [data-zeigen="a-b"]       im Nachbau nur in den Schritten a bis b sichtbar (z. B. ein Bildschirm); auch „1,4“
//   [data-ab="n"]             erscheint ab Schritt n (solange sein Bildschirm sichtbar ist)
//   [data-aktiv="a-b"]        hervorgehoben in den Schritten a bis b (z. B. Menüpunkt)
//   [data-klappe="a-b"]       nur in den Schritten a bis b aufgeklappt (verschiebt das Darunter)
//   [data-markiert="n"]       ausgewählt in Schritt n
//   [data-zeiger="n"]         dorthin tippt der „Finger“ in Schritt n
// Der Nachbau hat feste Maße (z. B. 1280 × 800) und wird skaliert. Am Handy zoomt eine „Kamera“ auf den Ausschnitt des Schritts.
(() => {
  const touren = [...document.querySelectorAll('[data-tour]')];
  if (!touren.length) return;
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const schmal = matchMedia('(max-width: 1023px)');
  const inBereich = (wert, n) =>
    String(wert).split(',').some((teil) => {
      const [a, b = a] = teil.split('-').map(Number);
      return n >= a && n <= b;
    });

  for (const tour of touren) {
    const rahmen = tour.querySelector('[data-tour-rahmen]');
    const buehne = tour.querySelector('[data-tour-buehne]');
    const texte = [...tour.querySelectorAll('[data-tour-schritt]')];
    const nummer = tour.querySelector('[data-tour-nummer]');
    const balken = tour.querySelector('[data-tour-balken]');
    const zeiger = tour.querySelector('[data-tour-zeiger]');
    const anzahl = texte.length;
    let aktuell = 0;
    let uhr;
    let breite = 0;

    // Lage eines Elements im Nachbau (unskaliert) – unabhängig von laufenden Bewegungen
    function lage(el) {
      let x = 0;
      let y = 0;
      for (let e = el; e && e !== buehne; e = e.offsetParent) {
        x += e.offsetLeft;
        y += e.offsetTop;
      }
      return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
    }

    // Desktop: ganzer Bildschirm. Handy: Ausschnitt des Schritts (data-fokus), damit man die Schrift lesen kann.
    function kamera() {
      const b = rahmen.clientWidth;
      const h = rahmen.clientHeight;
      const voll = buehne.offsetWidth;
      const fokus = texte[aktuell - 1]?.dataset.fokus;
      if (!schmal.matches || !fokus) {
        buehne.style.setProperty('--s', String(b / voll));
        buehne.style.setProperty('--tx', '0px');
        buehne.style.setProperty('--ty', '0px');
        return;
      }
      const [x, y, w] = fokus.split(',').map(Number);
      const s = b / w;
      const yMax = buehne.offsetHeight - h / s;
      buehne.style.setProperty('--s', String(s));
      buehne.style.setProperty('--tx', `${-x * s}px`);
      buehne.style.setProperty('--ty', `${-Math.max(0, Math.min(y, yMax)) * s}px`);
    }

    // Finger zum Ziel des Schritts bewegen, kurz tippen und das Ziel „drücken“
    function tippen(n) {
      clearTimeout(uhr);
      const ziel = buehne.querySelector(`[data-zeiger="${n}"]`);
      zeiger.classList.toggle('weg', !ziel);
      if (!ziel || ruhig) return;
      const { x, y } = lage(ziel);
      zeiger.style.setProperty('--x', `${x}px`);
      zeiger.style.setProperty('--y', `${y}px`);
      uhr = setTimeout(() => {
        zeiger.classList.add('klick');
        ziel.classList.add('gedrueckt');
        uhr = setTimeout(() => {
          zeiger.classList.remove('klick');
          ziel.classList.remove('gedrueckt');
          // Nach dem Tippen ausblenden – sonst verdeckt der Finger, was gerade passiert
          uhr = setTimeout(() => zeiger.classList.add('weg'), 900);
        }, 180);
      }, 750);
    }

    function zeigen(n) {
      if (n === aktuell) return;
      aktuell = n;
      texte.forEach((t) => {
        const an = Number(t.dataset.tourSchritt) === n;
        t.classList.toggle('ist-aktiv', an);
        t.inert = !an;
      });
      const setzen = (attr, klasse, pruefen) => buehne.querySelectorAll(`[${attr}]`).forEach((e) => e.classList.toggle(klasse, pruefen(e)));
      setzen('data-zeigen', 'an', (e) => inBereich(e.dataset.zeigen, n));
      setzen('data-aktiv', 'an', (e) => inBereich(e.dataset.aktiv, n));
      setzen('data-klappe', 'an', (e) => inBereich(e.dataset.klappe, n));
      setzen('data-markiert', 'markiert', (e) => Number(e.dataset.markiert) === n);
      setzen('data-ab', 'an', (e) => {
        const bildschirm = e.closest('[data-zeigen]');
        return n >= Number(e.dataset.ab) && (!bildschirm || inBereich(bildschirm.dataset.zeigen, n));
      });
      if (nummer) nummer.textContent = String(n).padStart(2, '0');
      balken?.style.setProperty('--fortschritt', String(n / anzahl));
      kamera();
      tippen(n);
    }

    let geplant = false;
    function scrollen() {
      geplant = false;
      const weg = tour.offsetHeight - tour.querySelector('.tour-sticky').offsetHeight;
      const anteil = Math.min(Math.max(-tour.getBoundingClientRect().top / weg, 0), 0.9999);
      zeigen(Math.floor(anteil * anzahl) + 1);
    }
    addEventListener('scroll', () => {
      if (!geplant) {
        geplant = true;
        requestAnimationFrame(scrollen);
      }
    }, { passive: true });
    // Nur bei echter Breitenänderung neu rechnen – am Handy löst schon die Adressleiste „resize“ aus
    addEventListener('resize', () => {
      if (rahmen.clientWidth === breite) return;
      breite = rahmen.clientWidth;
      kamera();
      tippen(aktuell);
    });
    breite = rahmen.clientWidth;
    scrollen();
    kamera();
    requestAnimationFrame(() => buehne.classList.add('bereit'));
  }
})();
