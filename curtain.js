// Photo intro: sets --p (0 to 1) from how far she has scrolled through the pinned intro; curtain.css moves the photos with it.
(() => {
  const sec = document.querySelector('.veil-intro');
  if (!sec) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { sec.style.setProperty('--p', 1); return; }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const span = () => sec.offsetHeight - sec.querySelector('.pin').offsetHeight;
  const top = () => sec.getBoundingClientRect().top + scrollY - 65;
  const frame = () => sec.style.setProperty('--p', ease(clamp((scrollY - top()) / span())).toFixed(4));
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();
})();
