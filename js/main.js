/* =====================================================
   PROSPECT LAUNDRY — MAIN JS
   main.js
   ===================================================== */

(function () {
  'use strict';

  /* ---- NAV SCROLL SHADOW ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ---- ACTIVE NAV LINK ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- HAMBURGER MENU ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- INFINITE REVIEW CAROUSEL ---- */
  function initCarousel(wrapSelector) {
    const wrap = document.querySelector(wrapSelector);
    if (!wrap) return;

    const track = wrap.querySelector('.carousel-track');
    let cards = Array.from(track.querySelectorAll('.review-card'));
    const prevBtn = wrap.querySelector('.carousel-btn-prev');
    const nextBtn = wrap.querySelector('.carousel-btn-next');
    const dotsWrap = wrap.querySelector('.carousel-dots');

    if (!track || cards.length === 0) return;

    // Clone elements for infinite effect
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    const secondClone = cards[1].cloneNode(true);
    const penultimateClone = cards[cards.length - 2].cloneNode(true);

    track.appendChild(firstClone);
    track.appendChild(secondClone);
    track.insertBefore(lastClone, cards[0]);
    track.insertBefore(penultimateClone, lastClone);

    const allCards = Array.from(track.querySelectorAll('.review-card'));
    const originalCount = cards.length;
    let current = 2; // Starting at the first original card (after 2 clones)
    let isTransitioning = false;
    let autoTimer;

    function getVisibleCount() {
      return window.innerWidth < 640 ? 1 : 2;
    }

    function getCardWidth() {
      const gap = 24;
      return (track.offsetWidth - (getVisibleCount() - 1) * gap) / getVisibleCount() + gap;
    }

    function updateDots() {
      if (!dotsWrap) return;
      const dotIndex = (current - 2 + originalCount) % originalCount;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === dotIndex);
      });
    }

    function setupDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < originalCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => {
          if (isTransitioning) return;
          clearAuto();
          goTo(i + 2);
          startAuto();
        });
        dotsWrap.appendChild(dot);
      }
    }

    function goTo(index, animated = true) {
      if (animated) isTransitioning = true;
      track.style.transition = animated ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      const offset = index * getCardWidth();
      track.style.transform = `translateX(-${offset}px)`;
      current = index;
      updateDots();
    }

    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      // Loop back without animation if at clones
      if (current <= 1) {
        goTo(current + originalCount, false);
      } else if (current >= originalCount + 2) {
        goTo(current - originalCount, false);
      }
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      clearAuto();
      goTo(current - 1);
      startAuto();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      clearAuto();
      goTo(current + 1);
      startAuto();
    });

    function startAuto() {
      clearAuto();
      autoTimer = setInterval(() => {
        if (!isTransitioning) goTo(current + 1);
      }, 5000);
    }

    function clearAuto() { clearInterval(autoTimer); }

    // Swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; clearAuto(); }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50 && !isTransitioning) goTo(current + (diff > 0 ? 1 : -1));
      startAuto();
    }, { passive: true });

    window.addEventListener('resize', () => {
      track.style.transition = 'none';
      goTo(current, false);
    }, { passive: true });

    setupDots();
    goTo(2, false);
    startAuto();
  }

  initCarousel('#reviews-carousel');

  /* ---- SCROLL FADE-IN ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const viewH = window.innerHeight;

    // Mark only elements below the fold as needing animation
    fadeEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top > viewH * 0.95) {
        el.classList.add('will-animate');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('will-animate');
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

    fadeEls.forEach(el => {
      if (el.classList.contains('will-animate')) observer.observe(el);
    });
  }

})();
