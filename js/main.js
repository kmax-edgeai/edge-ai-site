/* ═══════════════════════════════════════════════════ CURSOR */
const glow = document.getElementById('cursor-glow');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  glow.style.left = mx + 'px';
  glow.style.top  = my + 'px';
  document.documentElement.style.setProperty('--cursor-x', mx + 'px');
  document.documentElement.style.setProperty('--cursor-y', my + 'px');
});

/* ═══════════════════════════════════════════════════ NAV SCROLL */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ═══════════════════════════════════════════════════ SCROLL REVEAL */
const revels = document.querySelectorAll('.rv');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revels.forEach(el => io.observe(el));

/* ═══════════════════════════════════════════════════ 3D CARD TILT */
document.querySelectorAll('.tilt').forEach(card => {
  let raf = null;
  card.addEventListener('mousemove', e => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rx = ((y - r.height / 2) / r.height) * -10;
      const ry = ((x - r.width  / 2) / r.width)  *  10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
      card.style.transition = 'transform .05s linear, box-shadow .3s';
      card.style.boxShadow  = `0 20px 50px rgba(0,0,0,.4)`;
    });
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1), box-shadow .3s';
    card.style.boxShadow  = '';
  });
});

/* ═══════════════════════════════════════════════════ MAGNETIC BUTTONS */
document.querySelectorAll('.mag').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * 0.22;
    const y = (e.clientY - r.top  - r.height / 2) * 0.22;
    btn.style.transform  = `translate(${x}px, ${y}px)`;
    btn.style.transition = 'transform .08s linear';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform  = '';
    btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
  });
});

/* ═══════════════════════════════════════════════════ PARTICLE CANVAS */
const canvas = document.getElementById('pcanvas');
const ctx    = canvas.getContext('2d');
let W, H, pts = [], localX, localY;

function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  localX = W / 2; localY = H / 2;
}

class Pt {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .5;
    this.vy = (Math.random() - .5) * .5;
    this.r  = Math.random() * 1.4 + .4;
    this.a  = Math.random() * .35 + .08;
  }
  tick() {
    const dx = this.x - localX, dy = this.y - localY;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 130) {
      const f = (130 - d) / 130;
      this.vx += dx / d * f * .9;
      this.vy += dy / d * f * .9;
    }
    this.vx *= .95; this.vy *= .95;
    this.x  += this.vx; this.y  += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59,130,246,${this.a})`;
    ctx.fill();
  }
}

function links() {
  const N = pts.length;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59,130,246,${.13 * (1 - d / 100)})`;
        ctx.lineWidth = .6;
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
      }
    }
  }
}

document.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  localX = e.clientX - r.left;
  localY = e.clientY - r.top;
});

function loop() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.tick(); p.draw(); });
  links();
  requestAnimationFrame(loop);
}

resize();
pts = Array.from({ length: 95 }, () => new Pt());
loop();
window.addEventListener('resize', () => {
  resize();
  pts = Array.from({ length: 95 }, () => new Pt());
}, { passive: true });

/* ═══════════════════════════════════════════════════ BOOKING POPUP */
const CAL_URL = 'https://calendar.app.google/H4zzktrnKBw4TqqD9';

function openCal(e) {
  e.preventDefault();
  const W = 720, H = 660;
  const left = Math.round((screen.width  - W) / 2 + (screen.availLeft || 0));
  const top  = Math.round((screen.height - H) / 2 + (screen.availTop  || 0));
  const popup = window.open(
    CAL_URL,
    'edge-booking',
    `width=${W},height=${H},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
  // If browser blocked the popup, fall back to new tab
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    window.open(CAL_URL, '_blank', 'noopener');
  }
}

document.querySelectorAll('.cal-trigger').forEach(el => el.addEventListener('click', openCal));
