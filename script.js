const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Loading screen
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader')?.classList.add('done'), 650);
});

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
menuToggle?.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
}));

// Scroll reveal
const revealItems = document.querySelectorAll('.reveal, .reveal-card, .reveal-section');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.14});
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

// Animated counters
const counters = document.querySelectorAll('.counter');
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.target || 0);
      let start = 0;
      const duration = reduceMotion ? 0 : 900;
      const startTime = performance.now();
      const tick = now => {
        const progress = duration ? Math.min((now - startTime) / duration, 1) : 1;
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased) + (target >= 5 ? '+' : '');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, {threshold: .7});
  counters.forEach(c => counterObserver.observe(c));
}

// Project filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projects.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hide', !match);
      if (match && !reduceMotion) {
        card.animate(
          [{opacity:0, transform:'translateY(12px)'}, {opacity:1, transform:'translateY(0)'}],
          {duration:350, easing:'cubic-bezier(.2,.8,.2,1)'}
        );
      }
    });
  });
});

// Project pointer glow / subtle tilt
if (!reduceMotion) {
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      const rx = ((y / r.height) - .5) * -2.5;
      const ry = ((x / r.width) - .5) * 2.5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

// Subtle hero parallax
if (!reduceMotion) {
  const heroPhoto = document.querySelector('.hero-photo-wrap');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroPhoto?.style.setProperty('transform', `translateY(${y * 0.035}px)`);
    }
  }, {passive:true});
}

// Particle background
const canvas = document.getElementById('particles');
const ctx = canvas?.getContext('2d');
if (canvas && ctx && !reduceMotion) {
  let particles = [];
  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    const count = Math.min(65, Math.floor(window.innerWidth / 20));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + .3,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18
    }));
  };
  const draw = () => {
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = window.innerWidth + 5;
      if (p.x > window.innerWidth + 5) p.x = -5;
      if (p.y < -5) p.y = window.innerHeight + 5;
      if (p.y > window.innerHeight + 5) p.y = -5;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(185,255,102,.42)';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize);
  draw();
}

// Active nav link while scrolling
const navLinks = document.querySelectorAll('.navbar nav a');
const sections = [...document.querySelectorAll('main section[id]')];
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('current', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, {rootMargin:'-35% 0px -55% 0px'});
sections.forEach(s => activeObserver.observe(s));
