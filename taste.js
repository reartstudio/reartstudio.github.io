(() => {
  const root = document.querySelector('.taste');
  if (!root) return;
  const photo = root.querySelector('.ts-photo');
  const who = photo.querySelector('.who');
  const imgs = {};
  photo.querySelectorAll('img[data-k]').forEach(i => imgs[i.dataset.k] = i);
  const tabs = Array.from(root.querySelectorAll('.ts-tabs button'));
  const panels = Array.from(root.querySelectorAll('.ts-panel'));
  const wa = root.querySelector('.ts-wa');
  const g2 = photo.querySelector('img.groom2');
  let groomTimer = null;

  // her tab: no photo, no sliders, just what we say and a WhatsApp line
  // her tab: the message opens with a line for her to finish in her own words
  wa.href = 'https://wa.me/201024724578?text=' + encodeURIComponent('أهلًا 🤍 ده زوقي في الصور:\n- بحب الصور تبقى: \n- أكتر حاجة مش عايزاها: \n- تاريخ فرحي: \nعايزة أعرف لو التاريخ متاح.');

  function show(k) {
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.k === k));
    panels.forEach(p => p.hidden = p.dataset.k !== k);
    photo.dataset.mode = k === 'you' ? 'mix' : 'one';
    Object.entries(imgs).forEach(([n, img]) => {
      img.classList.toggle('on', k !== 'you' && n === k);
      if (k !== 'you') img.style.opacity = '';
    });
    who.textContent = tabs.find(t => t.dataset.k === k).dataset.label;
    photo.dataset.k = k;
    root.dataset.k = k;
    clearTimeout(groomTimer); g2.classList.remove('on');
    if (k === 'groom') groomTimer = setTimeout(() => g2.classList.add('on'), 1000);   // about a second on the near shot, then they're at the gate
  }
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.k)));
  root.querySelector('.ts-tabs').addEventListener('keydown', e => {
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const step = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;   // RTL
    if (!step) return;
    e.preventDefault();
    const n = tabs[(i + step + tabs.length) % tabs.length];
    n.focus(); show(n.dataset.k);
  });
  show(tabs[0].dataset.k);
})();
