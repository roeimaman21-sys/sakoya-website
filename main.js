/* =====================================================
   SAKOYA — main.js
   ===================================================== */

(function () {
  'use strict';

  /* ── Page transition: fade in ── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    requestAnimationFrame(() => {
      document.body.classList.add('page-visible');
    });

    setupNav();
    setupDrawer();
    setupCursor();
    setupScrollTop();
    setupScrollProgress();
    setupMobileCta();
    setupRipple();
    setupPageTransitions();
    setupLightbox();
    setupWaTracking();
    setupWaMessages();
    setupTiltCards();
    setupMagneticBtns();
    setupTypewriter();
    setupToast();
    setupDynamicYear();

    // AOS
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out-cubic' });
    }

    // GSAP
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      setupHeroGSAP();
      setupParallax();
      setupCounters();
    }
  }

  /* ── Navigation ── */
  function setupNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const hero = document.querySelector('.hero');
    let heroBottom = hero ? hero.offsetHeight : 0;

    function onScroll() {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      if (hero) nav.classList.toggle('on-hero', y < heroBottom - nav.offsetHeight);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial state

    // Recalculate on resize
    window.addEventListener('resize', () => {
      heroBottom = hero ? hero.offsetHeight : 0;
    }, { passive: true });
  }

  /* ── Mobile drawer ── */
  function setupDrawer() {
    const hamburger = document.querySelector('.nav-hamburger');
    const drawer    = document.querySelector('.nav-drawer');
    const overlay   = document.querySelector('.nav-overlay');
    if (!hamburger || !drawer) return;

    function openDrawer() {
      hamburger.classList.add('open');
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Close on drawer link click
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
  }

  /* ── Custom cursor ── */
  function setupCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function loop() {
      // Dot: instant
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
      // Ring: lag
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf = requestAnimationFrame(loop);
    }
    loop();

    // Grow on interactive elements
    const interactiveSelector = 'a, button, .btn, .service-card, .gallery-item, .lightbox-close';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactiveSelector)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactiveSelector)) document.body.classList.remove('cursor-hover');
    });
  }

  /* ── Scroll to top ── */
  function setupScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Ripple on buttons ── */
  function setupRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect   = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top  = (e.clientY - rect.top)  + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ── Page transitions ── */
  function setupPageTransitions() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          href.startsWith('javascript')) return;

      link.addEventListener('click', e => {
        e.preventDefault();
        const dest = link.href;
        document.body.classList.remove('page-visible');
        setTimeout(() => { window.location.href = dest; }, 320);
      });
    });
  }

  /* ── Lightbox ── */
  function setupLightbox() {
    const lightbox = document.querySelector('.lightbox');
    const lbImg    = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lbClose  = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    if (!lightbox || !lbImg) return;

    function openLb(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.focus();
    }

    function closeLb() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => openLb(el.dataset.lightbox, el.dataset.alt));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') openLb(el.dataset.lightbox, el.dataset.alt); });
    });

    if (lbClose) lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb();
    });
  }

  /* ── WhatsApp GA4 tracking ── */
  function setupWaTracking() {
    const wa = document.querySelector('.wa-btn');
    if (!wa) return;
    wa.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', { event_category: 'contact' });
      }
    });
  }

  /* ── GSAP: Hero animations ── */
  function setupHeroGSAP() {
    const words = document.querySelectorAll('.hero-title .word');
    const label = document.querySelector('.hero-label');
    const sub   = document.querySelector('.hero-sub');
    const acts  = document.querySelector('.hero-actions');

    const tl = gsap.timeline({ delay: 0.25 });

    if (label) tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);

    if (words.length) {
      tl.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out'
      }, 0.1);
    }

    if (sub)  tl.to(sub,  { opacity: 0.88, y: 0, duration: 0.7, ease: 'power3.out' }, 0.6);
    if (acts) tl.to(acts, { opacity: 1,    y: 0, duration: 0.6, ease: 'power3.out' }, 0.85);
  }

  /* ── GSAP: Parallax ── */
  function setupParallax() {
    const heroWrap = document.querySelector('.hero-img-wrap');
    if (!heroWrap) return;

    gsap.to(heroWrap, {
      yPercent: 28,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ── GSAP: Stat counters ── */
  function setupCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter() {
          gsap.to(obj, {
            val: target,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate() {
              el.textContent = Math.round(obj.val);
            }
          });
        }
      });
    });
  }

  /* ── Scroll progress bar ── */
  function setupScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      bar.style.transform = 'scaleX(' + (window.scrollY / max) + ')';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Mobile sticky CTA bar ── */
  function setupMobileCta() {
    const bar = document.querySelector('.mobile-cta-bar');
    const hero = document.querySelector('.hero');
    if (!bar || !hero) return;
    function check() {
      const heroBottom = hero.getBoundingClientRect().bottom;
      bar.classList.toggle('visible', heroBottom < 0);
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ── Dynamic copyright year ── */
  function setupDynamicYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.copyright-year').forEach(el => {
      el.textContent = year;
    });
  }

  /* ── WhatsApp pre-filled messages ── */
  function setupWaMessages() {
    const messages = {
      '.wa-btn':           'היי סקויה! ראיתי את האתר שלכם ורוצה לקבל הצעת מחיר.',
      '[data-wa="cta"]':   'היי! אני מעוניין בפרויקט. אשמח לשמוע פרטים נוספים.',
    };
    const phone = '972542819656';
    Object.entries(messages).forEach(([sel, msg]) => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.tagName === 'A') {
          el.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
        }
      });
    });
    // Also fix any plain wa.me links without a message
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(el => {
      if (!el.href.includes('?text=')) {
        const defaultMsg = 'היי סקויה! ראיתי את האתר שלכם ורוצה לקבל הצעת מחיר.';
        el.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(defaultMsg);
      }
    });
  }

  /* ── 3D Tilt cards ── */
  function setupTiltCards() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = 'perspective(800px) rotateY(' + (dx * 8) + 'deg) rotateX(' + (-dy * 6) + 'deg) translateZ(8px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Magnetic buttons (desktop only) ── */
  function setupMagneticBtns() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.22) + 'px, ' + (dy * 0.28) + 'px)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── Typewriter on hero subtitle ── */
  function setupTypewriter() {
    const el = document.querySelector('.hero-sub[data-typewriter]');
    if (!el) return;
    const lines = (el.dataset.typewriter || '').split('|');
    if (lines.length < 2) return;
    let lineIdx = 0;
    let charIdx = 0;
    let deleting = false;
    el.textContent = '';

    function tick() {
      const current = lines[lineIdx];
      if (!deleting) {
        charIdx++;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 2200);
          return;
        }
        setTimeout(tick, 55);
      } else {
        charIdx--;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          lineIdx = (lineIdx + 1) % lines.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 28);
      }
    }
    setTimeout(tick, 900);
  }

  /* ── Toast notification system ── */
  function setupToast() {
    window.showToast = function(msg, duration) {
      duration = duration || 3000;
      let toast = document.querySelector('.toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
    };

    // Trigger toast after contact form submission
    const contactForm = document.querySelector('form[name="contact"]');
    if (contactForm) {
      contactForm.addEventListener('submit', () => {
        setTimeout(() => window.showToast('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.', 4000), 500);
      });
    }
  }

  /* ── CTA tracking ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-track]').forEach(el => {
      el.addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', el.dataset.track, { event_category: 'engagement' });
        }
      });
    });
  });

  /* ── Image fade-in on load ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      }
    });
  });

  /* ── Lightbox keyboard navigation ── */
  document.addEventListener('DOMContentLoaded', () => {
    const lb = document.querySelector('.lightbox');
    if (!lb) return;

    const lbImg = lb.querySelector('.lightbox-img');
    if (!lbImg) return;

    let items = [];
    let currentIdx = 0;

    function getLightboxItems() {
      return Array.from(document.querySelectorAll('[data-lightbox]'));
    }

    function openLightboxAt(idx) {
      items = getLightboxItems();
      currentIdx = idx;
      const src = items[currentIdx].dataset.lightbox;
      const alt = items[currentIdx].dataset.alt || '';
      lbImg.src = src;
      lbImg.alt = alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.focus();
    }

    document.body.addEventListener('click', e => {
      const trigger = e.target.closest('[data-lightbox]');
      if (!trigger) return;
      items = getLightboxItems();
      const idx = items.indexOf(trigger);
      openLightboxAt(idx >= 0 ? idx : 0);
    });

    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    lb.addEventListener('click', e => {
      if (e.target === lb) closeLb();
    });

    const closeBtn = lb.querySelector('.lightbox-close');
    const prevBtn  = lb.querySelector('.lightbox-prev');
    const nextBtn  = lb.querySelector('.lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', closeLb);
    if (prevBtn)  prevBtn.addEventListener('click', () => {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      openLightboxAt(currentIdx);
    });
    if (nextBtn)  nextBtn.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % items.length;
      openLightboxAt(currentIdx);
    });

    lb.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft')  { currentIdx = (currentIdx - 1 + items.length) % items.length; openLightboxAt(currentIdx); }
      if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % items.length; openLightboxAt(currentIdx); }
    });
  });

})();
