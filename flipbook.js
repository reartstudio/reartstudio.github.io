(() => {
  const sec = document.querySelector('.flipbook');
  if (!sec) return;
  const pin = sec.querySelector('.pin');
  // phone: one page at a time, in reading order (front, back, front, back…)
  const single = matchMedia('(max-width: 760px)').matches;
  if (single) {
    const book = sec.querySelector('.book');
    const pages = [];
    book.querySelectorAll('.leaf').forEach(l => l.querySelectorAll('.face img').forEach(img => pages.push(img.getAttribute('src'))));
    book.querySelectorAll('.leaf, .spine, .block.r').forEach(el => el.remove());
    const spine = book.querySelector('.curl');
    pages.forEach((src, i) => {
      const leaf = document.createElement('div');
      leaf.className = 'leaf' + (i === 0 ? ' cover' : '');
      leaf.innerHTML = `<div class="face front"><img src="${src}" alt=""></div>`;
      book.insertBefore(leaf, spine);
    });
    sec.classList.add('single');
  }
  const leaves = Array.from(sec.querySelectorAll('.leaf'));
  const caps = Array.from(sec.querySelectorAll('.cap'));
  const dots = Array.from(sec.querySelectorAll('.count i'));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const n = leaves.length;

  // dust drifting through the lamp light
  const dust = sec.querySelector('.dust');
  if (!reduce) for (let i = 0; i < 18; i++) {
    const d = document.createElement('i');
    d.style.left = 25 + Math.random() * 50 + '%';
    d.style.top = 30 + Math.random() * 55 + '%';
    d.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
    d.style.animationDuration = 9 + Math.random() * 9 + 's';
    d.style.animationDelay = -Math.random() * 18 + 's';
    dust.appendChild(d);
  }

  // timeline: closed hold, then one flip per leaf with a pause on each spread
  const START = 0.06, SLOT = (0.94 - START) / n, FLIP = SLOT * 0.62;
  const span = () => sec.offsetHeight - pin.offsetHeight;
  const top = () => sec.getBoundingClientRect().top + scrollY - 65;

  function frame() {
    const p = reduce ? 1 : clamp((scrollY - top()) / span());
    let spread = 0;
    leaves.forEach((leaf, i) => {
      const t = ease(clamp((p - START - i * SLOT) / FLIP));
      const ang = single ? t * 150 : t * 180;
      if (single) leaf.style.opacity = (1 - clamp((t - .55) / .35)).toFixed(3);
      if (t > .5) spread = i + 1;
      const s = Math.sin(t * Math.PI);
      leaf.style.setProperty('--a', ang.toFixed(2) + 'deg');
      // unturned leaves stack left (first on top); turned ones stack right (last on top)
      leaf.style.setProperty('--z', ((t < .5 ? n - i : i + 1) * 0.8 + s * 40).toFixed(2) + 'px');
      leaf.style.setProperty('--shade', (s * .38).toFixed(3));
      leaf.style.setProperty('--shadeb', ((1 - t) * .45).toFixed(3));
      if (i === 0) sec.style.setProperty('--shift', (1 - t).toFixed(4));
    });
    sec.style.setProperty('--glow', (spread / n).toFixed(3));
    const capIdx = single ? Math.ceil(spread / 2) : spread;   // pages 1-2 → spread 1, 3-4 → 2…
    caps.forEach((c, i) => c.classList.toggle('on', i === capIdx));
    dots.forEach((d, i) => d.classList.toggle('on', i <= capIdx));
    current = spread;
    if (prevBtn) { prevBtn.disabled = spread === 0; nextBtn.disabled = spread === n; }
    inView = p > 0 && p < 1 || (sec.getBoundingClientRect().top < innerHeight * .5 && sec.getBoundingClientRect().bottom > innerHeight * .5);
  }

  // ---- hand controls: turn pages by drag, tap, arrows or keyboard ----
  const book = sec.querySelector('.book');
  const nextBtn = sec.querySelector('.nav.next'), prevBtn = sec.querySelector('.nav.prev');
  let current = 0, inView = false, tween = null;
  // scroll position where spread k rests (middle of its pause)
  const restP = k => k <= 0 ? 0 : Math.min(1, START + (k - 1) * SLOT + FLIP + (SLOT - FLIP) * .45);
  const toY = pp => top() + pp * span();
  function glide(y, dur = 900) {
    cancelAnimationFrame(tween);
    const from = scrollY, t0 = performance.now();
    if (reduce) { scrollTo({ top: y, behavior: 'instant' }); return; }
    const step = now => {
      const t = clamp((now - t0) / dur);
      scrollTo({ top: from + (y - from) * ease(t), behavior: 'instant' });
      if (t < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  }
  const go = k => glide(toY(restP(clamp(k, 0, n))));
  nextBtn && nextBtn.addEventListener('click', () => go(current + 1));
  prevBtn && prevBtn.addEventListener('click', () => go(current - 1));
  addEventListener('keydown', e => {
    if (!inView || /input|textarea|select/i.test(document.activeElement.tagName)) return;
    // RTL book: the next page lies to the left
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current - 1); }
  });

  // drag the page sideways; a short tap turns one page (left half = next, right half = back)
  let drag = null;
  book.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    cancelAnimationFrame(tween);
    drag = { x: e.clientX, y: e.clientY, s: scrollY, moved: false, id: e.pointerId };
  });
  book.addEventListener('pointermove', e => {
    if (!drag) {
      // curl the free corner when the pointer comes near it
      const r = book.getBoundingClientRect();
      const near = e.clientX < r.left + r.width * .5 && e.clientY > r.top + r.height * .55 && current < n;
      sec.style.setProperty('--curl', near ? '.16' : '0');
      return;
    }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true; book.setPointerCapture(drag.id); book.classList.add('dragging');
    }
    if (!drag.moved) return;
    const pagePx = book.offsetWidth * .5;
    scrollTo({ top: clamp(drag.s + (dx / pagePx) * SLOT * span(), toY(0), toY(1)), behavior: 'instant' });
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null; book.classList.remove('dragging');
    if (d.moved) {
      // settle on the spread the page fell toward
      const dx = e.clientX - d.x, p = clamp((scrollY - top()) / span());
      let k = 0; for (let i = 1; i <= n; i++) if (p > START + (i - 1) * SLOT + FLIP * (dx > 0 ? .25 : .75)) k = i;
      go(k);
    } else if (e.type === 'pointerup') {
      const r = book.getBoundingClientRect();
      go(e.clientX < r.left + r.width / 2 ? current + 1 : current - 1);
    }
  };
  book.addEventListener('pointerup', end);
  book.addEventListener('pointercancel', end);
  book.addEventListener('pointerleave', () => { if (!drag) sec.style.setProperty('--curl', '0'); });

  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();
})();
