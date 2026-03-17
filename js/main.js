/* ══════════════════════════════════════════
   GLOBAL LOGIC (Standardized)
══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll → sticky header ──
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mega Menu Logic (From V2) ──
  const trigger    = document.getElementById('hizmetler-trigger');
  const hizItem    = document.getElementById('hizmetler-item');
  const megaMenu   = document.getElementById('mega-menu');
  const overlay    = document.getElementById('mega-overlay');

  if (trigger && megaMenu && overlay) {
    const openMega = () => {
      megaMenu.classList.add('open');
      overlay.classList.add('open');
      if (hizItem) hizItem.classList.add('active');
    };
    const closeMega = () => {
      megaMenu.classList.remove('open');
      overlay.classList.remove('open');
      if (hizItem) hizItem.classList.remove('active');
    };
    const toggleMega = (e) => {
      e.preventDefault();
      megaMenu.classList.contains('open') ? closeMega() : openMega();
    };

    trigger.addEventListener('click', toggleMega);
    overlay.addEventListener('click', closeMega);

    // Hover intent
    let hoverTimeout;
    const itemsToHover = [hizItem, megaMenu];
    itemsToHover.forEach(el => {
      if (el) {
        el.addEventListener('mouseenter', () => {
          clearTimeout(hoverTimeout);
          openMega();
        });
        el.addEventListener('mouseleave', () => {
          hoverTimeout = setTimeout(closeMega, 120);
        });
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMega();
    });
  }

  // ── Hamburger (Mobile Menu Side Drawer) ──
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const megaOverlay = document.getElementById('mega-overlay'); // Reuse existing overlay

  if (hamburger && mobileMenu && megaOverlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        megaOverlay.classList.remove('open');
        document.body.style.overflow = '';
      } else {
        hamburger.classList.add('open');
        mobileMenu.classList.add('open');
        megaOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scroll when menu is open
      }
    });

    megaOverlay.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      megaOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // ── Mobile Services Toggle ──
  const mobileToggle   = document.getElementById('mobile-hizmetler-toggle');
  const mobileServices = document.getElementById('mobile-services');
  if (mobileToggle && mobileServices) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileServices.classList.toggle('open');
    });
  }

  // ── Custom Cursor (From Original) ──
  const cur = document.getElementById('cursor') || document.getElementById('cur');
  const curR = document.getElementById('cursor-ring') || document.getElementById('cur-r');
  
  if (cur && curR) {
    let mx=0, my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top = my + 'px';
    });
    
    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      curR.style.left = rx + 'px';
      curR.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    };
    animRing();

    document.querySelectorAll('a, button, .service-card, .bsm-row, .gallery-item, .ovf-item, .pkg-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.style.width = '14px'; cur.style.height = '14px';
        curR.style.width = '48px'; curR.style.height = '48px';
      });
      el.addEventListener('mouseleave', () => {
        cur.style.width = '9px'; cur.style.height = '9px';
        curR.style.width = '30px'; curR.style.height = '30px';
      });
    });
  }

  // ── Scroll Reveal ──
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .rv');
  if (revealEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          e.target.classList.add('on'); // for .rv
          // Trigger process line if matches
          if (e.target.classList.contains('process-step')) e.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // ── Animated Counter ──
  const stats = document.querySelectorAll('.stat-num');
  if (stats.length > 0) {
    const animateCount = (el, target, suffix = '') => {
      let start = 0;
      const dur = 2000;
      const step = timestamp => {
        if (!start) start = timestamp;
        const prog = Math.min((timestamp - start) / dur, 1);
        const ease = 1 - Math.pow(1 - prog, 4);
        el.innerHTML = Math.floor(ease * target) + '<sup>' + suffix + '</sup>';
        if (prog < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const text = el.dataset.target;
          if (text) {
            const num = parseInt(text);
            const suf = text.replace(String(num), '');
            animateCount(el, num, suf);
            countObs.unobserve(el);
          }
        }
      });
    }, { threshold: 0.5 });
    
    stats.forEach(el => {
      const txt = el.textContent;
      const num = parseInt(txt);
      const suf = txt.replace(num, '').replace(/[0-9]/g, '').trim();
      el.dataset.target = num + suf;
      el.innerHTML = num + '<sup>' + suf + '</sup>';
      countObs.observe(el);
    });
  }

  // ── Newsletter ──
  const nlBtn = document.querySelector('.nl-form button');
  if (nlBtn) {
    nlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const inp = nlBtn.previousElementSibling;
      if (inp && inp.value.includes('@')) {
        inp.value = '';
        inp.placeholder = 'Teşekkürler! ✦';
        setTimeout(() => inp.placeholder = 'E-posta adresiniz', 3000);
      }
    });
  }
});

// Observers are now initialized in DOMContentLoaded for better reliability

/* ──────────── ACCORDION (Hizmetler) ──────────── */
document.querySelectorAll('[data-svc]').forEach(item => {
  const trigger = item.querySelector('[data-trigger]');
  if (trigger) {
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-svc]').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});

/* ──────────── PROCESS BAR OBSERVER ──────────── */
const pObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
    }
  });
}, { threshold: 0.25 });


document.querySelectorAll('.pm-step').forEach(el => pObs.observe(el));

/* ──────────── ILETISIM PAGE LOGIC ──────────── */

/* Highlight today's hours */
const today = new Date().getDay();
document.querySelectorAll('.hr-row').forEach(row => {
  if (parseInt(row.dataset.day) === today) {
    row.classList.add('today');
    const b = document.createElement('span');
    b.className = 'today-badge';
    b.textContent = 'Bugün';
    row.querySelector('.hr-day').appendChild(b);
  }
});

/* Checkbox toggle */
document.querySelectorAll('[data-check]').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('checked');
    const inp = item.querySelector('input');
    if (inp) inp.checked = item.classList.contains('checked');
  });
});

/* FAQ accordion */
document.querySelectorAll('[data-faq]').forEach(item => {
  const trigger = item.querySelector('.faq-trigger');
  if (trigger) {
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-faq]').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});

/* Form submit */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const btnSpan = btn.querySelector('span');
    const oldText = btnSpan.textContent;
    
    btnSpan.textContent = 'Gönderiliyor…';
    btn.disabled = true;
    
    setTimeout(() => {
      contactForm.style.transition = 'opacity .5s';
      contactForm.style.opacity = '0';
      setTimeout(() => {
        contactForm.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.classList.add('show');
      }, 500);
    }, 1400);
  });
}

/* Input date helper */
document.querySelectorAll('input[type=date]').forEach(inp => {
  inp.addEventListener('focus', () => inp.showPicker?.());
});
