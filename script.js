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
  // Встреча: 13 мая 2026, 17:30 по Москве (UTC+3 → 14:30 UTC)
  const target = new Date(Date.UTC(2026, 4, 13, 14, 30, 0));

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
    yes: 'ура ✨ тогда до среды, 17:30!',
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
    for (let i = 0; i < 24; i++) {
      const heart = document.createElement('span');
      heart.textContent = ['❤', '✦', '✿', '♡', '⭐', '💫'][i % 6];
      heart.className = 'burst-particle';
      heart.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        color: ${['#ffb3c7', '#f6d6a8', '#c9a0ff', '#fff', '#8ad8ff', '#ffb3c7'][i % 6]};
        font-size: ${14 + Math.random() * 18}px;
        pointer-events: none;
        z-index: 100;
        transform: translate(-50%, -50%);
        transition: transform 1.6s cubic-bezier(0.2,0.8,0.2,1), opacity 1.6s ease;
      `;
      document.body.appendChild(heart);
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.3;
      const dist = 100 + Math.random() * 120;
      requestAnimationFrame(() => {
        heart.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist - 60}px)) rotate(${(Math.random()-0.5)*120}deg) scale(${0.3 + Math.random() * 0.7})`;
        heart.style.opacity = '0';
      });
      setTimeout(() => heart.remove(), 1800);
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

  const bgCount = Math.min(80, Math.floor((bgW * bgH) / 14000));
  const particles = [];
  for (let i = 0; i < bgCount; i++) {
    particles.push({
      x: Math.random() * bgW,
      y: Math.random() * bgH,
      r: 0.5 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.08 - Math.random() * 0.3,
      a: 0.12 + Math.random() * 0.6,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.015 + Math.random() * 0.03,
      color: ['255,179,199', '246,214,168', '201,160,255', '255,255,255', '138,216,255'][Math.floor(Math.random() * 5)],
    });
  }

  function drawBg() {
    bgCtx.clearRect(0, 0, bgW, bgH);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += p.twinkleSpeed;
      if (p.y < -10) { p.y = bgH + 10; p.x = Math.random() * bgW; }
      if (p.x < -10) p.x = bgW + 10;
      if (p.x > bgW + 10) p.x = -10;
      const alpha = p.a * (0.5 + 0.5 * Math.sin(p.twinkle));
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(${p.color},${alpha})`;
      bgCtx.shadowBlur = 12;
      bgCtx.shadowColor = `rgba(${p.color},${alpha * 0.8})`;
      bgCtx.fill();
    }
    bgCtx.shadowBlur = 0;
    if (!prefersReducedMotion) requestAnimationFrame(drawBg);
  }
  drawBg();

  /* ---------- 5. Fountain sparkles overlay ---------- */
  const sparkleContainer = document.querySelector('.fountain-sparkles');
  if (sparkleContainer && !prefersReducedMotion) {
    function createSparkle() {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${10 + Math.random() * 80}%`;
      sparkle.style.top = `${10 + Math.random() * 60}%`;
      sparkle.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      sparkle.style.setProperty('--size', `${3 + Math.random() * 5}px`);
      sparkleContainer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 3500);
    }
    setInterval(createSparkle, 250);
  }

  /* ---------- 6. Music player (vinyl with real audio) ---------- */
  const player = document.getElementById('musicPlayer');
  const audio = document.getElementById('musicAudio');

  if (player && audio) {
    audio.volume = 0.45;

    const setPlaying = (on) => player.classList.toggle('is-playing', on);

    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('ended', () => setPlaying(false));

    const toggle = () => {
      if (audio.paused) {
        audio.play().catch((err) => console.warn('Audio play blocked:', err));
      } else {
        audio.pause();
      }
    };

    player.addEventListener('click', toggle);
    player.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    // Попытка автозапуска. Большинство браузеров блокирует без мьюта,
    // поэтому пробуем: сначала без мьюта (вдруг разрешено), потом в тишине,
    // и в любом случае подхватываем первый клик/тап юзера, чтобы запустить со звуком.
    const tryAutoplay = async () => {
      try {
        await audio.play();
      } catch (_) {
        try {
          audio.muted = true;
          await audio.play();
        } catch (__) { /* автозапуск запрещён — ждём жеста */ }
      }
    };
    tryAutoplay();

    const firstGesture = () => {
      if (audio.muted) audio.muted = false;
      if (audio.paused) audio.play().catch(() => {});
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('keydown', firstGesture);
      window.removeEventListener('touchstart', firstGesture);
    };
    window.addEventListener('pointerdown', firstGesture, { once: false });
    window.addEventListener('keydown', firstGesture, { once: false });
    window.addEventListener('touchstart', firstGesture, { once: false, passive: true });
  }

  /* ---------- 7. Parallax hero на скролл ---------- */
  const hero = document.querySelector('.hero__inner');
  if (hero && !prefersReducedMotion) {
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600);
        hero.style.transform = `translateY(${y * 0.22}px) scale(${1 - y * 0.0003})`;
        hero.style.opacity = String(Math.max(0, 1 - y / 450));
        raf = 0;
      });
    }, { passive: true });
  }

  /* ---------- 8. Magnetic hover on buttons ---------- */
  document.querySelectorAll('.btn--primary').forEach((btn) => {
    if (prefersReducedMotion) return;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ---------- 9. Smooth section transitions with tilt ---------- */
  if (!prefersReducedMotion) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- 10. Typing effect on hero eyebrow ---------- */
  const eyebrow = document.querySelector('.hero__eyebrow');
  if (eyebrow && !prefersReducedMotion) {
    const text = eyebrow.textContent;
    eyebrow.textContent = '';
    eyebrow.style.opacity = '1';
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        eyebrow.textContent += text[i];
        i++;
        setTimeout(typeChar, 80 + Math.random() * 60);
      }
    }
    setTimeout(typeChar, 800);
  }
})();
