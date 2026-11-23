// Bride feedback row: slides to the next card every few seconds and loops; stops while she touches it.
(() => {
  const track = document.querySelector('.voices');
  const dots = document.querySelector('.vdots');
  if (!track) return;
  const cards = Array.from(track.children);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rtl = getComputedStyle(track).direction === 'rtl';
  cards.forEach(() => dots && dots.appendChild(document.createElement('i')));

  // card whose start edge is nearest the track's start edge
  const edge = r => (rtl ? r.right : r.left);
  const current = () => {
    const t = edge(track.getBoundingClientRect());
    let best = 0, d = Infinity;
    cards.forEach((c, i) => { const x = Math.abs(edge(c.getBoundingClientRect()) - t); if (x < d) { d = x; best = i; } });
    return best;
  };
  const mark = i => dots && Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i));
  const go = i => {
    const c = cards[i], delta = edge(c.getBoundingClientRect()) - edge(track.getBoundingClientRect());
    track.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
    c.classList.remove('now'); void c.offsetWidth; c.classList.add('now');
    mark(i);
  };

  // how many fit, so "the end" means the last card is fully in view
  const perView = () => Math.max(1, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width));
  const next = () => { const i = current(), last = cards.length - perView(); go(i >= last ? 0 : i + 1); };

  let timer = null, idle = null;
  const start = () => { if (!reduce && !timer) timer = setInterval(next, 3600); };
  const stop = () => { clearInterval(timer); timer = null; };
  const pause = () => { stop(); clearTimeout(idle); idle = setTimeout(start, 7000); };
  ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(e => track.addEventListener(e, pause, { passive: true }));
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', () => { clearTimeout(idle); start(); });
  let raf; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => mark(current())); }, { passive: true });

  // only run while the row is on screen
  // the page's scroll-reveal only sees cards inside the viewport; show the whole row together so the next one peeks in
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { cards.forEach(c => c.classList.add('in')); start(); } else stop();
  }, { threshold: .3 }).observe(track);
  mark(0);
})();
