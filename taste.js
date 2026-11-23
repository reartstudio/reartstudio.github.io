(() => {
  const root = document.querySelector('.taste');
  if (!root) return;
  const photo = root.querySelector('.ts-photo');
  const who = photo.querySelector('.who');
  const imgs = {};
  photo.querySelectorAll('img[data-k]').forEach(i => imgs[i.dataset.k] = i);
  const tabs = Array.from(root.querySelectorAll('.ts-tabs button'));
  const panels = Array.from(root.querySelectorAll('.ts-panel'));
  const sliders = Array.from(root.querySelectorAll('.ts-mix input'));
  const wa = root.querySelector('.ts-wa');
  const nf = new Intl.NumberFormat('ar-EG');
  const g2 = photo.querySelector('img.groom2');
  let groomTimer = null;

  function mix() {
    const v = {};
    sliders.forEach(s => {
      v[s.name] = +s.value;
      s.nextElementSibling.textContent = nf.format(s.value) + '٪';
      imgs[s.name].style.opacity = s.value / 100;
    });
    const msg = `أهلًا 🤍 عايزة صوري تبقى كده:\nنعومة ${nf.format(v.makeup)}٪ · لمعة الفستان ${nf.format(v.dress)}٪ · أخضر وخشب ${nf.format(v.photog)}٪\nوعايزة أعرف لو تاريخ فرحي متاح.`;
    wa.href = 'https://wa.me/201024724578?text=' + encodeURIComponent(msg);
  }

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
    clearInterval(groomTimer); g2.classList.remove('on');
    if (k === 'groom') groomTimer = setInterval(() => g2.classList.toggle('on'), 2600);
    if (k === 'you') mix();
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
  sliders.forEach(s => s.addEventListener('input', mix));
  show(tabs[0].dataset.k);
})();
