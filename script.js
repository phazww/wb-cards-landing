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
      window.open(`https://t.me/cardssellers?text=${msg}`, '_blank');
    });
  }
})();
