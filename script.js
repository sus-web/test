/* ==========================================================
   Лиза — приглашение · интерактив
   ========================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.setProperty('--delay', `${i * 90}ms`);
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 2. Countdown ---------- */
  // Встреча: 13 мая 2026, 18:00 по Москве (UTC+3 → 15:00 UTC)
  const target = new Date(Date.UTC(2026, 4, 13, 15, 0, 0));

  const els = {
    days: document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    minutes: document.getElementById('cdMinutes'),
    seconds: document.getElementById('cdSeconds'),
  };

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  const prev = { days: null, hours: null, minutes: null, seconds: null };

  function updateCountdown() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      els.days.textContent = '00';
      els.hours.textContent = '00';
      els.minutes.textContent = '00';
      els.seconds.textContent = '00';
      return;
    }

    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1000);

    const values = { days: d, hours: h, minutes: m, seconds: s };
    for (const key in values) {
      const text = pad(values[key]);
      if (els[key].textContent !== text) {
        els[key].textContent = text;
        if (prev[key] !== null && !prefersReducedMotion) {
          els[key].classList.remove('tick');
          // force reflow to restart animation
          void els[key].offsetWidth;
          els[key].classList.add('tick');
        }
        prev[key] = values[key];
      }
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- 3. Reply buttons ---------- */
  const result = document.getElementById('replyResult');
  const messages = {
    yes: 'ура ✨ тогда до среды, 18:00',
    maybe: 'хорошо, я подожду твоего ответа 🌙',
  };

  document.querySelectorAll('[data-reply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.reply;
      result.textContent = messages[choice] || '';
      result.classList.add('is-visible');
      if (choice === 'yes') burstHearts(btn);
    });
  });

  function burstHearts(origin) {
    if (prefersReducedMotion) return;
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 14; i++) {
      const heart = document.createElement('span');
      heart.textContent = ['❤', '✦', '✿', '♡'][i % 4];
      heart.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        color: ${['#ffb3c7', '#f6d6a8', '#c9a0ff', '#fff'][i % 4]};
        font-size: ${12 + Math.random() * 14}px;
        pointer-events: none;
        z-index: 100;
        transform: translate(-50%, -50%);
        transition: transform 1.4s cubic-bezier(0.2,0.8,0.2,1), opacity 1.4s ease;
      `;
      document.body.appendChild(heart);
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 90;
      requestAnimationFrame(() => {
        heart.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist - 40}px)) rotate(${(Math.random()-0.5)*90}deg)`;
        heart.style.opacity = '0';
      });
      setTimeout(() => heart.remove(), 1500);
    }
  }

  /* ---------- 4. Background particles (sparkles + petals) ---------- */
  const bgCanvas = document.getElementById('particles');
  const bgCtx = bgCanvas.getContext('2d');
  let bgW = 0, bgH = 0, DPR = 1;

  function resizeBg() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    bgW = window.innerWidth;
    bgH = window.innerHeight;
    bgCanvas.width = bgW * DPR;
    bgCanvas.height = bgH * DPR;
    bgCanvas.style.width = bgW + 'px';
    bgCanvas.style.height = bgH + 'px';
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resizeBg();
  window.addEventListener('resize', resizeBg);

  const bgCount = Math.min(60, Math.floor((bgW * bgH) / 18000));
  const particles = [];
  for (let i = 0; i < bgCount; i++) {
    particles.push({
      x: Math.random() * bgW,
      y: Math.random() * bgH,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.1 - Math.random() * 0.25,
      a: 0.15 + Math.random() * 0.55,
      twinkle: Math.random() * Math.PI * 2,
      color: ['255,179,199', '246,214,168', '201,160,255', '255,255,255'][Math.floor(Math.random() * 4)],
    });
  }

  function drawBg() {
    bgCtx.clearRect(0, 0, bgW, bgH);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.03;
      if (p.y < -10) { p.y = bgH + 10; p.x = Math.random() * bgW; }
      if (p.x < -10) p.x = bgW + 10;
      if (p.x > bgW + 10) p.x = -10;
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.twinkle));
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(${p.color},${alpha})`;
      bgCtx.shadowBlur = 8;
      bgCtx.shadowColor = `rgba(${p.color},${alpha * 0.7})`;
      bgCtx.fill();
    }
    bgCtx.shadowBlur = 0;
    if (!prefersReducedMotion) requestAnimationFrame(drawBg);
  }
  drawBg();

  /* ---------- 5. Fountain canvas ---------- */
  const fcanvas = document.getElementById('fountainCanvas');
  const fctx = fcanvas.getContext('2d');
  let fW = 0, fH = 0;

  function resizeFountain() {
    const rect = fcanvas.getBoundingClientRect();
    fW = rect.width;
    fH = rect.height;
    fcanvas.width = fW * DPR;
    fcanvas.height = fH * DPR;
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  const drops = [];
  const GRAVITY = 0.12;
  const fountainJets = 9; // количество струй по окружности

  function emitDrop() {
    // Чаша фонтана — в нижней трети
    const cx = fW / 2;
    const cy = fH * 0.82;
    // Выбираем угол из диапазона — струи идут веером
    const jet = Math.floor(Math.random() * fountainJets);
    const base = -Math.PI / 2; // вверх
    const spread = Math.PI * 0.55;
    const ang = base - spread / 2 + (jet / (fountainJets - 1)) * spread + (Math.random() - 0.5) * 0.08;
    const power = 5.2 + Math.random() * 2.8;
    drops.push({
      x: cx + Math.cos(ang) * 4,
      y: cy,
      vx: Math.cos(ang) * power,
      vy: Math.sin(ang) * power,
      life: 0,
      maxLife: 110 + Math.random() * 40,
      r: 1.2 + Math.random() * 1.4,
      hue: 195 + Math.random() * 25,
    });
  }

  let fountainVisible = false;
  const fSection = document.getElementById('fountains');
  if ('IntersectionObserver' in window) {
    const fio = new IntersectionObserver(
      (entries) => entries.forEach((e) => { fountainVisible = e.isIntersecting; }),
      { threshold: 0.1 }
    );
    fio.observe(fSection);
  } else {
    fountainVisible = true;
  }

  function drawFountain() {
    if (!fW || !fH) resizeFountain();

    // slight trail for smooth motion blur
    fctx.fillStyle = 'rgba(13, 6, 24, 0.25)';
    fctx.fillRect(0, 0, fW, fH);

    if (fountainVisible && !prefersReducedMotion) {
      // Эмитим капли пачками
      for (let i = 0; i < 6; i++) emitDrop();
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += GRAVITY;
      d.x += d.vx;
      d.y += d.vy;
      d.life++;

      const waterLine = fH * 0.82;
      if (d.y > waterLine || d.life > d.maxLife || d.x < -20 || d.x > fW + 20) {
        drops.splice(i, 1);
        continue;
      }

      const alpha = Math.max(0, 1 - d.life / d.maxLife);
      fctx.beginPath();
      fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      fctx.fillStyle = `hsla(${d.hue}, 90%, 78%, ${0.55 * alpha})`;
      fctx.shadowBlur = 10;
      fctx.shadowColor = `hsla(${d.hue}, 95%, 75%, ${0.5 * alpha})`;
      fctx.fill();
    }
    fctx.shadowBlur = 0;

    requestAnimationFrame(drawFountain);
  }

  // Инициализация фонтана после раскладки
  const initFountain = () => {
    resizeFountain();
    drawFountain();
  };
  if (document.readyState === 'complete') initFountain();
  else window.addEventListener('load', initFountain);
  window.addEventListener('resize', resizeFountain);

  /* ---------- 6. Ambient sound (toggle) ---------- */
  const soundBtn = document.getElementById('soundToggle');
  let audioCtx = null;
  let ambientNodes = null;

  function startAmbient() {
    if (ambientNodes) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const master = audioCtx.createGain();
      master.gain.value = 0;
      master.connect(audioCtx.destination);

      // Лёгкий hum: две сцепленные синусоиды + триггеры — очень тихий, мечтательный
      const freqs = [220, 277.18, 329.63]; // A3, C#4, E4 — мажорное трезвучие
      const oscs = freqs.map((f, i) => {
        const o = audioCtx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const g = audioCtx.createGain();
        g.gain.value = 0.08 + i * 0.02;
        const lfo = audioCtx.createOscillator();
        lfo.frequency.value = 0.1 + i * 0.05;
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.03;
        lfo.connect(lfoGain).connect(g.gain);
        o.connect(g).connect(master);
        o.start();
        lfo.start();
        return { o, g, lfo };
      });

      // Фейд-ин
      master.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.5);

      ambientNodes = { master, oscs };
    } catch (err) {
      console.warn('Audio unavailable', err);
    }
  }

  function stopAmbient() {
    if (!ambientNodes || !audioCtx) return;
    const { master } = ambientNodes;
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
    setTimeout(() => {
      try { audioCtx.close(); } catch (_) {}
      audioCtx = null;
      ambientNodes = null;
    }, 800);
  }

  soundBtn.addEventListener('click', () => {
    if (soundBtn.classList.contains('is-on')) {
      soundBtn.classList.remove('is-on');
      soundBtn.setAttribute('aria-label', 'Включить звук');
      stopAmbient();
    } else {
      soundBtn.classList.add('is-on');
      soundBtn.setAttribute('aria-label', 'Выключить звук');
      startAmbient();
    }
  });

  /* ---------- 7. Parallax hero на скролл ---------- */
  const hero = document.querySelector('.hero__inner');
  if (hero && !prefersReducedMotion) {
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600);
        hero.style.transform = `translateY(${y * 0.18}px)`;
        hero.style.opacity = String(Math.max(0, 1 - y / 500));
        raf = 0;
      });
    }, { passive: true });
  }
})();
