(function() {
  const page = document.querySelector('.page');
  if (!page) return;

  // Burger menu
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const active = burger.classList.toggle('active');
      nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('active');
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll
  page.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  // IntersectionObserver for .reveal, .reveal-left, .reveal-right, .reveal-scale
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealEls = document.querySelectorAll(revealSelectors);

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -80px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: make everything visible if no IntersectionObserver
    revealEls.forEach(el => el.classList.add('visible'));
  }


  // CTA form submit (Telegram redirect)
  const ctaSubmit = document.getElementById('cta-submit');
  if (ctaSubmit) {
    ctaSubmit.addEventListener('click', () => {
      const name = document.getElementById('cta-name').value.trim();
      const contact = document.getElementById('cta-contact').value.trim();
      const msg = encodeURIComponent(
        `Здравствуйте! Хочу обсудить обновление карточек.\n` +
        (name ? `Имя: ${name}\n` : '') +
        (contact ? `Контакт: ${contact}` : '')
      );
      const tgLink = (typeof SITE_SETTINGS !== 'undefined' && SITE_SETTINGS.telegramLink) || 'https://t.me/cardssellers';
      const separator = tgLink.includes('?') ? '&' : '?';
      window.open(`${tgLink}${separator}text=${msg}`, '_blank');
    });
  }
})();
