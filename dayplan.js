(() => {
  const root = document.querySelector('.dayplan');
  if (!root) return;
  const $ = s => root.querySelector(s);
  const dateIn = $('#dp-date'), timeIn = $('#dp-time'), out = $('.dp-out'), count = $('.dp-count'), wa = $('.dp-wa');
  const WA = '201024724578';
  const state = { travel: 30, ready: true };

  // chip groups
  root.querySelectorAll('.dp-chips').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    state[g.dataset.k] = g.dataset.k === 'ready' ? b.dataset.v === '1' : +b.dataset.v;
    build();
  }));

  const tf = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' });
  const df = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  const nf = new Intl.NumberFormat('ar-EG');
  const at = (base, min) => new Date(base.getTime() + min * 60000);

  function plan(entrance) {
    // built backwards from the entrance (الزفة)
    const rows = [];
    let t = -30;                                     // breathe + touch-ups before entering
    const rest = t;
    t -= state.travel;                               // session spot -> venue
    const leaveSession = t;
    t -= 90;                                         // the session itself
    const session = t;
    t -= 20;                                         // first look with the groom
    const firstLook = t;
    t -= state.ready ? 45 : 15;                      // dress on (+ getting-ready photos)
    const dress = t;
    t -= 180;                                        // makeup & hair
    const makeup = t;
    rows.push([makeup, 'الميكب والشعر', 'حوالي ٣ ساعات. خليكي فاطرة وشاربة مية.']);
    rows.push([dress, state.ready ? 'الفستان وصور التجهيز' : 'لبس الفستان', state.ready ? 'المصوّر بيلحق التفاصيل: الطرحة، والجزمة، والبرفان.' : 'ربع ساعة كفاية لو مفيش صور تجهيز.']);
    rows.push([firstLook, 'أول ما العريس يشوفك', 'أصدق ٢٠ دقيقة في اليوم كله.', true]);
    rows.push([session, 'السيشن', 'ساعة ونص على راحتك، والنور بنختاره معاكي حسب المكان.']);
    if (state.travel) rows.push([leaveSession, 'الطريق للقاعة', `حوالي ${nf.format(state.travel)} دقيقة.`]);
    rows.push([rest, 'نفَس ولمسات أخيرة', 'نص ساعة تهدي فيها وتصلّحي الميكب.']);
    rows.push([0, 'الزفة', 'ودي لحظتك… والباقي علينا.', true]);
    return rows.map(([m, title, note, key]) => ({ time: at(entrance, m), title, note, key }));
  }

  function build() {
    if (!timeIn.value) return;
    const [h, m] = timeIn.value.split(':').map(Number);
    const day = dateIn.value ? new Date(dateIn.value + 'T00:00') : new Date();
    const entrance = new Date(day); entrance.setHours(h, m, 0, 0);
    const rows = plan(entrance);

    out.innerHTML = '<i class="fill"></i>' + rows.map((r, i) =>
      `<div class="dp-row${r.key ? ' key' : ''}" style="--d:${i * .09}s"><time>${tf.format(r.time)}</time><b>${r.title}</b><span>${r.note}</span></div>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      out.style.setProperty('--fill', 1);
      out.querySelectorAll('.dp-row').forEach(r => r.classList.add('in'));
    }));

    // countdown
    if (dateIn.value) {
      const days = Math.ceil((day - new Date().setHours(0, 0, 0, 0)) / 864e5);
      count.innerHTML = days > 0 ? `فاضل <b>${nf.format(days)}</b> يوم على ${df.format(day)}` : days === 0 ? '<b>النهارده!</b> مبروك 🤍' : '';
    } else count.textContent = '';

    const lines = rows.map(r => `${tf.format(r.time)} · ${r.title}`).join('\n');
    const msg = `أهلًا 🤍 ده جدول يومي المبدئي من موقعكم${dateIn.value ? `، فرحي يوم ${df.format(day)}` : ''}:\n${lines}\nعايزة أعرف لو التاريخ متاح.`;
    wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    wa.hidden = false;
  }
  dateIn.addEventListener('change', build);
  timeIn.addEventListener('input', build);
  build();
})();
