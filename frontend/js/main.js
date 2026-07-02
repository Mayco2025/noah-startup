/* ============================================================
   EthioMirai — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ── EN / JA language toggle ─────────────────────────────── */
  const docEl = document.documentElement;

  function applyLang(lang) {
    const ja = lang === 'ja';
    docEl.classList.toggle('lang-ja', ja);
    docEl.classList.toggle('lang-en', !ja);
    docEl.lang = ja ? 'ja' : 'en';
    try { localStorage.setItem('em-lang', ja ? 'ja' : 'en'); } catch (e) {}

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setlang === (ja ? 'ja' : 'en'));
    });

    /* form placeholders: data-ph-en / data-ph-ja */
    document.querySelectorAll('[data-ph-en]').forEach(el => {
      el.placeholder = (ja && el.dataset.phJa) ? el.dataset.phJa : el.dataset.phEn;
    });

    /* <option> labels: data-en / data-ja (submitted value stays English) */
    document.querySelectorAll('option[data-en]').forEach(opt => {
      opt.textContent = (ja && opt.dataset.ja) ? opt.dataset.ja : opt.dataset.en;
      if (!opt.hasAttribute('value')) opt.setAttribute('value', opt.dataset.en);
    });

    /* <title> / meta description: data-title-ja etc. on <body> */
    const body = document.body;
    if (body && body.dataset.titleEn) {
      document.title = ja && body.dataset.titleJa ? body.dataset.titleJa : body.dataset.titleEn;
    }
  }

  const isJa = () => docEl.classList.contains('lang-ja');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) applyLang(btn.dataset.setlang);
  });

  /* initial sync (class already set by inline head script) */
  applyLang(isJa() ? 'ja' : 'en');

  /* ── Sticky nav shadow on scroll ─────────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger menu toggle ───────────────────────────────── */
  const toggle   = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── IntersectionObserver: .reveal → .visible ───────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const navH = header ? header.offsetHeight : 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Active nav link ─────────────────────────────────────── */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link, .nav-dropdown__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop().split('#')[0];
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  if (currentFile === 'services.html' || currentFile === 'maya-nihongo.html') {
    document.querySelectorAll('.nav-dropdown__toggle').forEach(t => t.classList.add('active'));
  }

  /* ── Nav dropdown (What We Do) ────────────────────────────── */
  document.querySelectorAll('.nav-dropdown__toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.nav-dropdown');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== parent) {
          d.classList.remove('open');
          d.querySelector('.nav-dropdown__toggle')?.setAttribute('aria-expanded', 'false');
        }
      });
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown__toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Contact / inquiry form submit (Netlify Forms) ───────── */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) { field.style.borderColor = '#C0392B'; valid = false; }
      });
      if (!valid) return;
      const btn = form.querySelector('[type="submit"]');
      const original = btn ? btn.innerHTML : '';
      if (btn) {
        btn.textContent = isJa() ? '送信中…' : 'Sending…';
        btn.disabled = true;
      }
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
      .then(res => {
        if (!res.ok) throw new Error('Form submit failed: ' + res.status);
        if (btn) {
          btn.textContent = isJa() ? '送信しました。折り返しご連絡いたします。' : 'Sent — we will be in touch.';
          setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 5000);
        }
        form.reset();
      })
      .catch(() => {
        if (btn) {
          btn.textContent = isJa()
            ? '送信できませんでした。info@ethiomirai.com までご連絡ください。'
            : 'Could not send — please email info@ethiomirai.com';
          setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 6000);
        }
      });
    });
  });

  /* ── Inquiry tabs ────────────────────────────────────────── */
  const tabNavs = document.querySelectorAll('.tab-nav');
  const activateTab = (container, target) => {
    const btn = container.querySelector('.tab-btn[data-tab="' + target + '"]');
    const panel = container.querySelector('[data-panel="' + target + '"]');
    if (!btn || !panel) return false;
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    panel.classList.add('active');
    return true;
  };
  tabNavs.forEach(nav => {
    const container = nav.closest('.tab-section') || nav.closest('section') || document;
    nav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => activateTab(container, btn.dataset.tab));
    });
    const hashTarget = window.location.hash.slice(1);
    if (hashTarget) activateTab(container, hashTarget);
  });

  /* ── Counter animation for stats ─────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (statNums.length && 'IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          const decimals = String(target).includes('.') ? 1 : 0;
          let current = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current.toFixed(decimals) + suffix;
            if (current >= target) clearInterval(timer);
          }, 25);
          statsObs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(el => statsObs.observe(el));
  }

  /* ── Scroll progress bar ─────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── Rotating hero words (per element, data-words="a|b|c") ── */
  document.querySelectorAll('.rotate-word[data-words]').forEach(el => {
    const words = el.dataset.words.split('|');
    if (words.length < 2) return;
    let wi = 0;
    setInterval(() => {
      el.classList.add('swap');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        el.textContent = words[wi];
        el.classList.remove('swap');
      }, 360);
    }, 3200);
  });

  /* ── Hero image 3D tilt ──────────────────────────────────── */
  const heroImg = document.querySelector('.hero-map-img');
  if (heroImg && window.matchMedia('(hover: hover)').matches) {
    const wrap = heroImg.parentElement;
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.transform = `rotateY(${nx * 6}deg) rotateX(${-ny * 6}deg) scale(1.015)`;
    });
    wrap.addEventListener('mouseleave', () => { heroImg.style.transform = ''; });
  }

  /* ── Hero World Map Canvas ───────────────────────────────── */
  (function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, animFrame, dotGrid;

    /* ── World map (equirectangular) ── */
    const mapImg = new Image();
    let mapReady = false;
    mapImg.onload = () => { mapReady = true; };
    mapImg.src = 'media/world-map.png';

    /* Viewport: lon/lat bounds — wider view keeps countries away from edges */
    const LON0 = 0, LON1 = 175;
    const LAT0 = -18, LAT1 = 55;

    /* Convert geographic coords → canvas px */
    function geo(lon, lat) {
      return {
        x: (lon - LON0) / (LON1 - LON0) * W,
        y: (LAT1 - lat) / (LAT1 - LAT0) * H,
      };
    }

    /* ── Three nodes ── */
    // Ethiopia  38°E, 9°N
    // EthioMirai hub  88°E, 20°N  (Indian Ocean bridge)
    // Japan  138°E, 36°N

    /* ── Country shape data (normalized 0-1 bounding box) ── */
    const ETH_SHAPE = [
      [0.22,0.00],[0.48,0.00],[0.68,0.04],[0.78,0.10],
      [0.98,0.25],[0.90,0.38],[1.00,0.52],[0.85,0.70],
      [0.72,1.00],[0.52,0.90],[0.38,0.96],[0.20,0.84],
      [0.05,0.68],[0.00,0.50],[0.04,0.28],[0.12,0.12],
    ];
    const JPN_HONSHU = [
      [0.00,1.00],[0.06,0.80],[0.14,0.65],[0.20,0.50],
      [0.28,0.38],[0.38,0.25],[0.52,0.16],[0.62,0.10],
      [0.72,0.10],[0.84,0.15],[0.96,0.28],[0.92,0.42],
      [0.82,0.55],[0.72,0.65],[0.58,0.76],[0.44,0.87],
      [0.28,0.96],[0.12,1.00],
    ];
    const JPN_HOKKAIDO = [
      [0.55,0.08],[0.65,0.00],[0.80,0.00],[1.00,0.10],
      [0.98,0.25],[0.85,0.32],[0.68,0.30],[0.57,0.20],
    ];

    /* ── Ambient particles (lon/lat based) ── */
    function makeGeoParticles(n, lonMin, lonMax, latMin, latMax, cfn) {
      return Array.from({ length: n }, () => ({
        lon: lonMin + Math.random() * (lonMax - lonMin),
        lat: latMin + Math.random() * (latMax - latMin),
        dlat: Math.random() * 0.018 + 0.004,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.32 + 0.06,
        lonMin, lonMax, latMin, latMax, cfn,
      }));
    }

    const particles = [
      ...makeGeoParticles(20, 22, 52, -12, 22, a => `rgba(7,160,55,${a})`),   // Ethiopia region
      ...makeGeoParticles(18, 118,152, 28, 50, a => `rgba(196,154,26,${a})`), // Japan region
      ...makeGeoParticles(14, 60, 110, 0, 38,  a => `rgba(196,154,26,${a * 0.7})`), // ocean corridor
    ];

    /* ── Dot grid (offscreen, rebuilt on resize) ── */
    function buildDotGrid() {
      dotGrid = document.createElement('canvas');
      dotGrid.width = W; dotGrid.height = H;
      const gc = dotGrid.getContext('2d');
      const sp = 46;
      gc.fillStyle = 'rgba(255,255,255,0.042)';
      for (let gx = sp / 2; gx < W; gx += sp)
        for (let gy = sp / 2; gy < H; gy += sp) {
          gc.beginPath(); gc.arc(gx, gy, 0.75, 0, Math.PI * 2); gc.fill();
        }
    }

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = Math.round(r.width)  || 900;
      H = canvas.height = Math.round(r.height) || 600;
      buildDotGrid();
    }

    /* ── Bezier helpers ── */
    function qBez(t, p0, c, p1) {
      const mt = 1 - t;
      return {
        x: mt*mt*p0.x + 2*mt*t*c.x + t*t*p1.x,
        y: mt*mt*p0.y + 2*mt*t*c.y + t*t*p1.y,
      };
    }

    /* ── Country shape path ── */
    function tracePath(coords, cx, cy, sz) {
      ctx.beginPath();
      coords.forEach(([nx, ny], i) => {
        const px = cx - sz/2 + nx*sz, py = cy - sz/2 + ny*sz;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.closePath();
    }

    /* ── Country outline glow ── */
    function drawCountryShape(coords, cx, cy, sz, fill, stroke) {
      tracePath(coords, cx, cy, sz);
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
    }

    /* ── Twinkling stars ── */
    const stars = Array.from({ length: 60 }, () => ({
      fx: Math.random(), fy: Math.random(),
      r: Math.random() * 1.1 + 0.3,
      phase: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.02 + 0.008,
    }));

    function drawStars(t) {
      stars.forEach(s => {
        const a = 0.05 + 0.22 * (0.5 + 0.5 * Math.sin(t * s.spd * 60 + s.phase));
        ctx.beginPath(); ctx.arc(s.fx * W, s.fy * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
      });
    }

    /* ── Node marker ── */
    let p1 = 0, p2 = 0.5, p3 = 0.25, orbit = 0;
    function drawNode(x, y, pulse, r, rgb) {
      ctx.beginPath();
      ctx.arc(x, y, pulse * 44, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb},${(1-pulse)*0.45})`;
      ctx.lineWidth = 1.5; ctx.stroke();

      const g = ctx.createRadialGradient(x, y, 0, x, y, r*2.8);
      g.addColorStop(0, `rgba(${rgb},0.6)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.beginPath(); ctx.arc(x, y, r*2.8, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();

      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = `rgb(${rgb})`; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r*0.42, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
    }

    /* ── EthioMirai center hub ── */
    function drawHub(x, y, pulse) {
      /* Three expanding rings */
      for (let i = 0; i < 3; i++) {
        const p = (pulse + i * 0.333) % 1;
        ctx.beginPath(); ctx.arc(x, y, p * 68, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(242,169,0,${(1-p)*0.32})`;
        ctx.lineWidth = 1; ctx.stroke();
      }
      /* Outer glow */
      const g = ctx.createRadialGradient(x, y, 0, x, y, 38);
      g.addColorStop(0, 'rgba(242,169,0,0.55)');
      g.addColorStop(0.5, 'rgba(242,169,0,0.12)');
      g.addColorStop(1, 'rgba(242,169,0,0)');
      ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();

      /* Rotating dashed orbit */
      orbit += 0.008;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(orbit);
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI*2);
      ctx.setLineDash([6, 9]);
      ctx.strokeStyle = 'rgba(242,169,0,0.45)';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.setLineDash([]);
      /* satellite dot riding the orbit */
      ctx.beginPath(); ctx.arc(28, 0, 2.4, 0, Math.PI*2);
      ctx.fillStyle = '#F2A900'; ctx.fill();
      ctx.restore();

      /* Outer ring */
      ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(242,169,0,0.85)';
      ctx.lineWidth = 1.5; ctx.stroke();

      /* Dark core */
      ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(6,9,13,0.92)'; ctx.fill();

      /* "EM" text */
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#F2A900';
      ctx.fillText('EM', x, y);
    }

    /* ── Label on canvas ── */
    function drawLabel(x, y, name, sub, align) {
      const dx = align === 'right' ? -26 : 26;
      ctx.save();
      ctx.textAlign = align === 'right' ? 'right' : 'left';
      ctx.font = '700 12px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.90)';
      ctx.fillText(name, x + dx, y - 6);
      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.fillText(sub, x + dx, y + 8);
      ctx.restore();
    }

    /* ── Relay particle state ── */
    let relayT = 0, relayPhase = 0, burstTimer = 0;
    let revT = 0, revPhase = 2, revBurstTimer = 0, frameT = 0;
    let burstPts = [];

    function burst(x, y) {
      burstPts = Array.from({ length: 18 }, (_, i) => ({
        angle: (i / 18) * Math.PI * 2,
        spd: Math.random() * 2.2 + 0.8,
        r: Math.random() * 2.5 + 1,
        life: 1,
        x, y,
      }));
    }

    function drawBurst() {
      burstPts.forEach(b => {
        b.life -= 0.045;
        b.x += Math.cos(b.angle) * b.spd;
        b.y += Math.sin(b.angle) * b.spd;
        if (b.life > 0) {
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,220,70,${b.life * 0.85})`;
          ctx.fill();
        }
      });
    }

    function drawParticleHead(pos, r, col) {
      const pg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r*4);
      pg.addColorStop(0, col.replace(')', ',0.96)').replace('rgb','rgba'));
      pg.addColorStop(0.35, col.replace(')', ',0.45)').replace('rgb','rgba'));
      pg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r*4, 0, Math.PI*2);
      ctx.fillStyle = pg; ctx.fill();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
    }

    function drawTail(t, p0, ctrl, p1, col) {
      for (let i = 12; i >= 1; i--) {
        const tt = Math.max(0, t - i * 0.003);
        const tp = qBez(tt, p0, ctrl, p1);
        ctx.beginPath(); ctx.arc(tp.x, tp.y, 3.8 - i*0.28, 0, Math.PI*2);
        ctx.fillStyle = col.replace(')', `,${0.60 - i*0.048})`).replace('rgb','rgba');
        ctx.fill();
      }
    }

    /* ── Main render loop ── */
    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* ── Geographic positions ── */
      const eth = geo(38,  9);
      const em  = geo(88, 20);
      const jpn = geo(138, 36);

      /* Arc control points */
      const ctrl1 = { x: (eth.x + em.x)/2, y: Math.min(eth.y, em.y) - H*0.12 };
      const ctrl2 = { x: (em.x + jpn.x)/2, y: Math.min(em.y, jpn.y) - H*0.12 };

      /* ── World map ── */
      if (mapReady) {
        const iW = mapImg.naturalWidth, iH = mapImg.naturalHeight;
        const sx = (LON0 + 180) / 360 * iW;
        const sw = (LON1 - LON0) / 360 * iW;
        const sy = (90 - LAT1) / 180 * iH;
        const sh = (LAT1 - LAT0) / 180 * iH;
        ctx.globalAlpha = 0.18;
        ctx.drawImage(mapImg, sx, sy, sw, sh, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      /* ── Dot grid + stars ── */
      if (dotGrid) ctx.drawImage(dotGrid, 0, 0);
      frameT += 0.016;
      drawStars(frameT);

      /* ── Area glow blobs (give each side its color atmosphere) ── */
      const ethGlow = ctx.createRadialGradient(eth.x, eth.y, 0, eth.x, eth.y, W * 0.32);
      ethGlow.addColorStop(0, 'rgba(7,137,48,0.18)');
      ethGlow.addColorStop(1, 'rgba(7,137,48,0)');
      ctx.fillStyle = ethGlow; ctx.fillRect(0, 0, W, H);

      const jpnGlow = ctx.createRadialGradient(jpn.x, jpn.y, 0, jpn.x, jpn.y, W * 0.32);
      jpnGlow.addColorStop(0, 'rgba(188,0,45,0.14)');
      jpnGlow.addColorStop(1, 'rgba(188,0,45,0)');
      ctx.fillStyle = jpnGlow; ctx.fillRect(0, 0, W, H);

      /* ── Ambient particles ── */
      particles.forEach(p => {
        p.lat += p.dlat * 0.08;
        if (p.lat > p.latMax) { p.lat = p.latMin; p.lon = p.lonMin + Math.random()*(p.lonMax-p.lonMin); }
        const px = geo(p.lon, p.lat);
        if (px.x < 0 || px.x > W || px.y < 0 || px.y > H) return;
        ctx.beginPath(); ctx.arc(px.x, px.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.cfn(p.alpha); ctx.fill();
      });

      /* ── Country icons (small, decorative — no clipping) ── */
      const sz = 70;
      drawCountryShape(ETH_SHAPE, eth.x, eth.y, sz, 'rgba(7,160,55,0.18)', 'rgba(7,220,80,0.70)');
      drawCountryShape(JPN_HONSHU,   jpn.x, jpn.y, sz, 'rgba(188,0,45,0.15)', 'rgba(220,80,80,0.65)');
      drawCountryShape(JPN_HOKKAIDO, jpn.x, jpn.y, sz, 'rgba(188,0,45,0.15)', 'rgba(220,80,80,0.65)');

      /* ── Arc 1: Ethiopia → EthioMirai (green) ── */
      [[22,0.02],[10,0.06],[4,0.20],[1.5,0.60]].forEach(([lw, a]) => {
        ctx.beginPath(); ctx.moveTo(eth.x, eth.y);
        ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, em.x, em.y);
        ctx.strokeStyle = `rgba(7,200,80,${a})`;
        ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
      });

      /* ── Arc 2: EthioMirai → Japan (gold) ── */
      [[22,0.02],[10,0.06],[4,0.20],[1.5,0.60]].forEach(([lw, a]) => {
        ctx.beginPath(); ctx.moveTo(em.x, em.y);
        ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, jpn.x, jpn.y);
        ctx.strokeStyle = `rgba(242,169,0,${a})`;
        ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
      });

      /* ── Nodes & hub ── */
      p1 = (p1 + 0.010) % 1; p2 = (p2 + 0.010) % 1; p3 = (p3 + 0.008) % 1;
      drawNode(eth.x, eth.y, p1, 6, '34,197,94');
      drawNode(jpn.x, jpn.y, p2, 6, '226,72,82');
      drawHub(em.x, em.y, p3);

      /* ── Labels ── */
      drawLabel(eth.x, eth.y, 'ETHIOPIA', '9°N · 38°E', 'right');
      drawLabel(jpn.x, jpn.y, 'JAPAN', '36°N · 139°E', 'left');
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = '600 9px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(242,169,0,0.70)';
      ctx.letterSpacing = '0.10em';
      ctx.fillText('ETHIOMIRAI', em.x, em.y + 26);
      ctx.restore();

      /* ── Relay particle: Phase 0 = Eth→EM, 1 = burst@EM, 2 = EM→Jpn, 3 = burst@Jpn ── */
      if (relayPhase === 0) {
        relayT += 0.0035;
        if (relayT >= 1) { relayT = 0; relayPhase = 1; burstTimer = 0; burst(em.x, em.y); }
        drawTail(relayT, eth, ctrl1, em, 'rgb(80,255,120)');
        drawParticleHead(qBez(relayT, eth, ctrl1, em), 5, 'rgb(80,255,130)');

      } else if (relayPhase === 1) {
        burstTimer += 0.05;
        drawBurst();
        if (burstTimer >= 1) { relayPhase = 2; relayT = 0; }

      } else if (relayPhase === 2) {
        relayT += 0.0035;
        if (relayT >= 1) { relayT = 0; relayPhase = 3; burstTimer = 0; burst(jpn.x, jpn.y); }
        drawTail(relayT, em, ctrl2, jpn, 'rgb(255,220,70)');
        drawParticleHead(qBez(relayT, em, ctrl2, jpn), 5, 'rgb(255,230,80)');

      } else if (relayPhase === 3) {
        burstTimer += 0.04;
        drawBurst();
        if (burstTimer >= 1.2) { relayPhase = 0; relayT = 0; }
      }

      /* ── Reverse traveler: Japan → EM → Ethiopia (blue) ── */
      if (revPhase === 2) {
        revT += 0.0030;
        if (revT >= 1) { revT = 0; revPhase = 1; revBurstTimer = 0; }
        drawTail(revT, jpn, ctrl2, em, 'rgb(90,140,255)');
        drawParticleHead(qBez(revT, jpn, ctrl2, em), 4.5, 'rgb(100,150,255)');
      } else if (revPhase === 1) {
        revBurstTimer += 0.05;
        if (revBurstTimer >= 0.6) { revPhase = 0; revT = 0; }
      } else {
        revT += 0.0030;
        if (revT >= 1) { revT = 0; revPhase = 2; }
        drawTail(revT, em, ctrl1, eth, 'rgb(90,140,255)');
        drawParticleHead(qBez(revT, em, ctrl1, eth), 4.5, 'rgb(100,150,255)');
      }

      animFrame = requestAnimationFrame(frame);
    }

    resize();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(canvas.parentElement);
    } else {
      window.addEventListener('resize', resize);
    }
    animFrame = requestAnimationFrame(frame);
  }());

})();
