/* ============================================
   RAPHAEL OBOT PHOTOGRAPHY — MAIN.JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR SCROLL STATE ──────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ── MOBILE NAV ───────────────────────────────
  const toggle    = document.getElementById('navToggle')    || document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('navMobile')    || document.querySelector('.nav-mobile');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        toggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── SCROLL REVEAL ────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // ── DRAG-TO-SCROLL (desktop) ──────────────────
  function dragScroll(el) {
    if (!el) return;
    let isDown = false, startX, scrollLeft;

    el.addEventListener('mousedown', e => {
      isDown = true;
      el.style.cursor = 'grabbing';
      startX    = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mouseup',    () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mousemove',  e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.6;
      el.scrollLeft = scrollLeft - walk;
    });
  }

  // Apply drag to all horizontal galleries
  document.querySelectorAll('.h-gallery').forEach(dragScroll);

  // ── LIGHTBOX ─────────────────────────────────
  const lightbox        = document.querySelector('.lightbox');
  const lightboxImg     = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose   = document.querySelector('.lightbox-close');
  const lightboxPrev    = document.querySelector('.lightbox-prev');
  const lightboxNext    = document.querySelector('.lightbox-next');

  let galleryImages = [];
  let currentIndex  = 0;

  function openLightbox(src, caption, index, images) {
    if (!lightbox) return;
    galleryImages = images;
    currentIndex  = index;
    if (lightboxImg)     lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    if (!galleryImages.length || !lightboxImg) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const item = galleryImages[currentIndex];
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = item.src;
      lightboxImg.style.opacity = '1';
      if (lightboxCaption) lightboxCaption.textContent = item.caption || '';
    }, 150);
    lightboxImg.style.transition = 'opacity 0.15s';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
  if (lightboxNext)  lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  }

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  // Attach lightbox to every h-gallery — each strip has its own image pool
  document.querySelectorAll('.h-gallery').forEach(gallery => {
    const items  = gallery.querySelectorAll('.h-gallery-item');
    const images = [];
    items.forEach((item, i) => {
      const img     = item.querySelector('img');
      if (!img) return;
      const caption = item.dataset.caption || img.alt || '';
      images.push({ src: img.src, caption });
      item.addEventListener('click', () => openLightbox(img.src, caption, i, images));
    });
  });

  // ── FAQ ACCORDION ─────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── CONTACT FORM ──────────────────────────────
  const contactForm = document.querySelector('.contact-form');
  const formSuccess  = document.querySelector('.form-success');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('show');
        } else {
          if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
          alert('Something went wrong. Please try again or reach out via WhatsApp.');
        }
      } catch (_) {
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
        alert('Network error. Please check your connection and try again.');
      }
    });
  }

});
