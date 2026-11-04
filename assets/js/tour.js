// Rundgänge beim Scrollen: ein Abschnitt [data-tour] bleibt stehen, die Scroll-Position wählt den Schritt.
// Die Bilder kommen aus dem echten LEXIA (dort: npm run rundgang-bilder) – so stimmt die Website immer mit der App überein.
// Im HTML genügen diese Markierungen:
//   [data-tour-schritt="n"]       Erklärung zu Schritt n (links); optional data-fokus="x,y,breite" = Ausschnitt fürs Handy
//   img[data-bild="name-n"]       Bild zu Schritt n (1280 × 800); data-xy="x,y" = dorthin tippt der „Finger“
// Die Bühne hat feste Maße (1280 × 800) und wird skaliert. Am Handy zoomt eine „Kamera“ auf den wichtigen Teil.
// Bewusst schlicht: nur Bilder überblenden und den Finger bewegen – das läuft auf jedem Gerät flüssig (auch iPad).
(() => {
  const touren = [...document.querySelectorAll('[data-tour]')];
  if (!touren.length) return;

  // Mehrere Rundgänge: Auswahl oben zeigt immer genau einen ([data-tour-wahl] → [data-tour-id])
  document.querySelectorAll('[data-tour-wahl]').forEach((knopf) =>
    knopf.addEventListener('click', () => {
      const id = knopf.dataset.tourWahl;
      document.querySelectorAll('[data-tour-wahl]').forEach((k) => k.setAttribute('aria-checked', String(k === knopf)));
      touren.forEach((t) => (t.hidden = t.dataset.tourId !== id));
      dispatchEvent(new Event('tour-wechsel'));
    })
  );
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const schmal = matchMedia('(max-width: 1023px)');
  const B = 1280;
  const H = 800;

  for (const tour of touren) {
    const rahmen = tour.querySelector('[data-tour-rahmen]');
    const buehne = tour.querySelector('[data-tour-buehne]');
    const texte = [...tour.querySelectorAll('[data-tour-schritt]')];
    const bilder = [...buehne.querySelectorAll('[data-bild]')];
    const nummer = tour.querySelector('[data-tour-nummer]');
    const balken = tour.querySelector('[data-tour-balken]');
    const zeiger = tour.querySelector('[data-tour-zeiger]');
    const anzahl = texte.length;
    let aktuell = 0;
    let uhr;
    let breite = 0;

    const bildZu = (n) => bilder.find((b) => b.dataset.bild.endsWith(`-${n}`));
    const punktZu = (n) => {
      const xy = bildZu(n)?.dataset.xy;
      return xy ? xy.split(',').map(Number) : null;
    };

    // Desktop: ganzer Bildschirm. Handy: Ausschnitt um die Stelle, auf die der Finger tippt (sonst der Inhalt ohne Menü).
    function kamera() {
      const b = rahmen.clientWidth;
      const h = rahmen.clientHeight;
      if (!schmal.matches) {
        buehne.style.setProperty('--s', String(b / B));
        buehne.style.setProperty('--tx', '0px');
        buehne.style.setProperty('--ty', '0px');
        return;
      }
      const eigen = texte[aktuell - 1]?.dataset.fokus;
      const punkt = punktZu(aktuell);
      let x, y, w;
      if (eigen) [x, y, w] = eigen.split(',').map(Number);
      else if (punkt) {
        w = 760;
        x = Math.min(Math.max(punkt[0] - w / 2, 0), B - w);
        y = punkt[1] - (w * h) / b / 2;
      } else [x, y, w] = [220, 0, 1060];
      const s = b / w;
      const yMax = H - h / s;
      buehne.style.setProperty('--s', String(s));
      buehne.style.setProperty('--tx', `${-x * s}px`);
      buehne.style.setProperty('--ty', `${-Math.max(0, Math.min(y, yMax)) * s}px`);
    }

    // Finger zur Stelle des Schritts bewegen, kurz tippen, dann ausblenden (er soll nichts verdecken)
    function tippen(n) {
      clearTimeout(uhr);
      const punkt = punktZu(n);
      zeiger.classList.toggle('weg', !punkt);
      if (!punkt || ruhig) return;
      zeiger.style.setProperty('--x', `${punkt[0]}px`);
      zeiger.style.setProperty('--y', `${punkt[1]}px`);
      uhr = setTimeout(() => {
        zeiger.classList.add('klick');
        uhr = setTimeout(() => {
          zeiger.classList.remove('klick');
          uhr = setTimeout(() => zeiger.classList.add('weg'), 1100);
        }, 200);
      }, 800);
    }

    function zeigen(n) {
      if (n === aktuell) return;
      aktuell = n;
      texte.forEach((t) => {
        const an = Number(t.dataset.tourSchritt) === n;
        t.classList.toggle('ist-aktiv', an);
        t.inert = !an;
      });
      bilder.forEach((b) => b.classList.toggle('an', b === bildZu(n)));
      if (nummer) nummer.textContent = String(n).padStart(2, '0');
      balken?.style.setProperty('--fortschritt', String(n / anzahl));
      if (schmal.matches) kamera();
      tippen(n);
    }

    let geplant = false;
    function scrollen() {
      geplant = false;
      if (tour.hidden) return;
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
    // Sichtbar geworden (Auswahl oben): neu messen und von vorn beginnen
    addEventListener('tour-wechsel', () => {
      if (tour.hidden) return;
      breite = rahmen.clientWidth;
      aktuell = 0;
      scrollen();
      kamera();
    });
    breite = rahmen.clientWidth;
    scrollen();
    kamera();
    requestAnimationFrame(() => buehne.classList.add('bereit'));
  }
})();
