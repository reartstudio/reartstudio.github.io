(() => {
  const $ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // ribbon progress bar
  const bar = document.createElement('div');
  bar.className = 'ribbon-progress';
  document.body.appendChild(bar);

  // reveal on view
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
  const reveal = (els, step = .09) => els.forEach((el, i) => {
    el.classList.add('rv'); el.style.setProperty('--d', (i % 6) * step + 's'); io.observe(el);
  });

  $('section .kicker, section .lead, .bookband .bprice').forEach(el => reveal([el], 0));
  $('section h2').forEach(h => { h.classList.add('thread'); io.observe(h); if (!h.closest('.closing')) reveal([h], 0); });
  reveal($('.voices figure'), .12);
  reveal($('.plan, .ch, .parts > div, .custom, .tier12, .deliv, details, .quiz'), .08);
  reveal($('.steps > div'), .12);

  // photos develop like prints
  $('.work img, .gal img, .peek img').forEach((img, i) => {
    img.classList.add('develop'); img.style.setProperty('--d', (i % 4) * .15 + 's'); io.observe(img);
  });

  // worry cards: tap to flip to the answer
  $('.cards .card').forEach(card => {
    const n = card.querySelector('.n'), h = card.querySelector('h3'), p = card.querySelector('p');
    if (!h || !p) return;
    card.classList.add('flip');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `<div class="inner">
      <div class="face front">${n ? n.outerHTML : ''}${h.outerHTML}<span class="tap">اضغطي تشوفي الرد ←</span></div>
      <div class="face back"><span class="latin">don't worry</span>${p.outerHTML}</div></div>`;
    const toggle = () => {
      const on = card.classList.toggle('on');
      card.setAttribute('aria-pressed', on);
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  reveal($('.cards .card'), .12);

  // steps: gold thread fills with scroll
  const steps = document.querySelector('.steps');
  let thread = null;
  if (steps) {
    thread = document.createElement('div');
    thread.className = 'thread-line';
    thread.innerHTML = '<i></i>';
    steps.before(thread);
  }

  // closing words land one by one
  $('.closing h2').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map((w, i) => `<span class="wd" style="--d:${i * .14}s">${w}</span>`).join(' ');
  });

  // count-up for the hero stats (+١٥٠٠)
  const toLatin = s => s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const fmt = new Intl.NumberFormat('ar-EG', { useGrouping: false });
  $('.stats b').forEach(b => {
    const m = toLatin(b.textContent).match(/(\D*)(\d+)(\D*)/);
    if (!m || reduce) return;
    const [, pre, num, post] = m, target = +num;
    const cio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      cio.disconnect();
      const t0 = performance.now();
      const step = now => {
        const t = clamp((now - t0) / 1600), v = Math.round(target * (1 - Math.pow(1 - t, 3)));
        b.textContent = pre + fmt.format(v) + post;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    cio.observe(b);
  });

  // tilt on desktop
  if (finePointer && !reduce) {
    $('.plan, .ch, .work a, .voices figure').forEach(el => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
        el.classList.add('moving');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('moving');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
    // hero photos follow the pointer at different depths
    const hero = document.querySelector('.hero');
    const imgs = $('.hero .stack img');
    if (hero && imgs.length) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        imgs.forEach((img, i) => {
          const k = (i + 1) * 10;
          img.style.setProperty('--px', (-x * k).toFixed(1) + 'px');
          img.style.setProperty('--py', (-y * k).toFixed(1) + 'px');
        });
      });
    }
  }

  // scroll-linked: progress ribbon, steps thread, book opening
  const books = $('.bookband img, .bhero .wrap > img');
  const progressThrough = el => {
    const r = el.getBoundingClientRect();
    return clamp((innerHeight - r.top) / (innerHeight + r.height));
  };
  function frame() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (thread) {
      const r = steps.getBoundingClientRect();
      const p = reduce ? 1 : clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35));
      thread.style.setProperty('--tp', p.toFixed(4));
      $('.steps > div').forEach((d, i, all) => d.classList.toggle('lit', p >= (i + .5) / all.length));
    }
    books.forEach(img => {
      const p = reduce ? 1 : clamp(progressThrough(img) / .5);
      img.style.setProperty('--bo', (1 - p).toFixed(4));
    });
  }
  let ticking = false;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  frame();
})();

/* floating WhatsApp on phones: shows after the first screen, steps aside when another WhatsApp button or the book is on screen */
(() => {
  let fab = document.querySelector('.wafab');
  if (!fab) {
    fab = document.createElement('a');
    fab.className = 'wafab';
    fab.textContent = 'واتساب 💬';
    const msg = document.body.dataset.wa || 'أهلًا 🤍 عايزة أعرف لو تاريخ فرحي متاح. التاريخ: ... والمكان: ...';
    fab.href = 'https://wa.me/201024724578?text=' + encodeURIComponent(msg);
    document.body.appendChild(fab);
  }
  const blockers = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? blockers.add(e.target) : blockers.delete(e.target));
    upd();
  });
  document.querySelectorAll('a[href*="wa.me"]:not(.wafab), .flipbook, .veil-intro, .dp-wa, .ts-wa')
    .forEach(el => { if (!el.closest('nav')) io.observe(el); });
  function upd() { fab.classList.toggle('show', scrollY > innerHeight * .8 && blockers.size === 0); }
  addEventListener('scroll', upd, { passive: true });
  upd();
})();
