(() => {
  const sec = document.querySelector('.veil-intro');
  if (!sec) return;
  const ribbon = sec.querySelector('.ribbon');
  const ring = sec.querySelector('.ring');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const span = () => sec.offsetHeight - sec.querySelector('.pin').offsetHeight;
  const top = () => sec.getBoundingClientRect().top + scrollY - 65;

  function frame() {
    const p = reduce ? 1 : clamp((scrollY - top()) / span());
    sec.style.setProperty('--pull', clamp(p / 0.15).toFixed(4));
    sec.style.setProperty('--open', ease(clamp((p - 0.12) / 0.5)).toFixed(4));
    sec.style.setProperty('--reveal', clamp((p - 0.55) / 0.35).toFixed(4));
    ribbon.classList.toggle('still', p > 0.02);
  }
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();

  // pull the ribbon: dragging down scrolls through the reveal
  let drag = null;
  ring.addEventListener('pointerdown', e => {
    drag = { y: e.clientY, s: scrollY };
    ring.setPointerCapture(e.pointerId);
    ribbon.classList.add('still');
  });
  ring.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = span() / (innerHeight * 0.35);
    scrollTo({ top: clamp(drag.s + (e.clientY - drag.y) * k, top(), top() + span()), behavior: 'instant' });
  });
  const release = e => {
    if (!drag) return;
    const moved = Math.abs(e.clientY - drag.y) > 6;
    drag = null;
    if (!moved) openAll();
  };
  ring.addEventListener('pointerup', release);
  ring.addEventListener('pointercancel', release);
  ring.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAll(); }
  });

  function openAll() {
    const from = scrollY, to = top() + span(), t0 = performance.now(), dur = 2200;
    const step = now => {
      const t = clamp((now - t0) / dur);
      scrollTo({ top: from + (to - from) * ease(t), behavior: 'instant' });
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();
