// Rundgänge beim Scrollen: ein Abschnitt [data-tour] bleibt stehen, die Scroll-Position wählt den Schritt.
// Wiederverwendbar für jede Funktion – im HTML genügen diese Markierungen:
//   [data-tour-schritt="n"]   Erklärung zu Schritt n (links)
//   [data-zeigen="a-b"]       im Nachbau nur in den Schritten a bis b sichtbar (z. B. ein Bildschirm)
//   [data-ab="n"]             erscheint ab Schritt n (solange sein Bildschirm sichtbar ist)
//   [data-aktiv="a-b"]        hervorgehoben in den Schritten a bis b (z. B. Menüpunkt)
//   [data-markiert="n"]       ausgewählt in Schritt n
//   [data-zeiger="n"]         dorthin tippt der „Finger“ in Schritt n
(() => {
  const touren = [...document.querySelectorAll('[data-tour]')];
  if (!touren.length) return;
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inBereich = (wert, n) => {
    const [a, b = a] = String(wert).split('-').map(Number);
    return n >= a && n <= b;
  };

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

    const skalieren = () => buehne.style.setProperty('--s', String(rahmen.clientWidth / buehne.offsetWidth));

    // Finger zum Ziel des Schritts bewegen, kurz tippen und das Ziel „drücken“
    function tippen(n) {
      clearTimeout(uhr);
      const ziel = buehne.querySelector(`[data-zeiger="${n}"]`);
      zeiger.classList.toggle('weg', !ziel);
      if (!ziel || ruhig) return;
      const s = rahmen.clientWidth / buehne.offsetWidth;
      const b = buehne.getBoundingClientRect();
      const r = ziel.getBoundingClientRect();
      zeiger.style.setProperty('--x', `${(r.left + r.width / 2 - b.left) / s}px`);
      zeiger.style.setProperty('--y', `${(r.top + r.height / 2 - b.top) / s}px`);
      uhr = setTimeout(() => {
        zeiger.classList.add('klick');
        ziel.classList.add('tb-gedrueckt');
        uhr = setTimeout(() => {
          zeiger.classList.remove('klick');
          ziel.classList.remove('tb-gedrueckt');
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
      buehne.querySelectorAll('[data-zeigen]').forEach((e) => e.classList.toggle('an', inBereich(e.dataset.zeigen, n)));
      buehne.querySelectorAll('[data-aktiv]').forEach((e) => e.classList.toggle('an', inBereich(e.dataset.aktiv, n)));
      buehne.querySelectorAll('[data-markiert]').forEach((e) => e.classList.toggle('markiert', Number(e.dataset.markiert) === n));
      buehne.querySelectorAll('[data-ab]').forEach((e) => {
        const bildschirm = e.closest('[data-zeigen]');
        e.classList.toggle('an', n >= Number(e.dataset.ab) && (!bildschirm || inBereich(bildschirm.dataset.zeigen, n)));
      });
      if (nummer) nummer.textContent = String(n).padStart(2, '0');
      balken?.style.setProperty('--fortschritt', String(n / anzahl));
      tippen(n);
    }

    let geplant = false;
    function scrollen() {
      geplant = false;
      const weg = tour.offsetHeight - innerHeight;
      const anteil = Math.min(Math.max(-tour.getBoundingClientRect().top / weg, 0), 0.9999);
      zeigen(Math.floor(anteil * anzahl) + 1);
    }
    addEventListener('scroll', () => {
      if (!geplant) {
        geplant = true;
        requestAnimationFrame(scrollen);
      }
    }, { passive: true });
    addEventListener('resize', () => {
      skalieren();
      tippen(aktuell);
    });
    skalieren();
    scrollen();
  }
})();
