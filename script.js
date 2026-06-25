(function() {
  const page = document.querySelector('.page');
  if (!page) return;
  // ===== СБОР UTM-МЕТОК И РЕКЛАМНЫХ ДАННЫХ =====
  function fillTrackingData() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];
      
      params.forEach(param => {
        const val = urlParams.get(param);
        if (val) {
          const input = document.getElementById(param);
          if (input) input.value = val;
        }
      });
      
      const pageUrlInput = document.getElementById('page_url');
      if (pageUrlInput) pageUrlInput.value = window.location.href;
      
      const referrerInput = document.getElementById('referrer');
      if (referrerInput) referrerInput.value = document.referrer || 'direct';
    } catch (e) {
      console.error('Tracking error:', e);
    }
  }
  fillTrackingData();

  // ===== ДИНАМИЧЕСКОЕ ПОДКЛЮЧЕНИЕ ЯНДЕКС МЕТРИКИ =====
  if (typeof SITE_SETTINGS !== 'undefined' && SITE_SETTINGS.yandexMetrikaId && SITE_SETTINGS.yandexMetrikaId !== 'XXXXXX' && SITE_SETTINGS.yandexMetrikaId !== '') {
    const metrikaId = parseInt(SITE_SETTINGS.yandexMetrikaId);
    window.ymID = metrikaId;

    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(metrikaId, "init", {
         clickmap:true,
         trackLinks:true,
         accurateTrackBounce:true,
         webvisor:true
    });
  }

  // ===== ЦЕЛЬ: КЛИК ПО КНОПКАМ CTA =====
  document.querySelectorAll('a[href="#hero-form-anchor"], a[href="#hero-form"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.ymID && typeof ym !== 'undefined') {
        ym(window.ymID, 'reachGoal', 'cta_click');
      }
    });
  });


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

  // Smooth scroll for all anchor links
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
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ===== FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // Закрываем все остальные аккордеоны
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            const otherContent = otherItem.querySelector('.faq-content');
            if (otherTrigger && otherContent) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherContent.style.maxHeight = null;
              const otherIcon = otherItem.querySelector('.faq-icon-arrow i');
              if (otherIcon) {
                otherIcon.setAttribute('data-lucide', 'plus');
              }
            }
          }
        });
        
        // Переключаем текущий
        trigger.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
        if (!isExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
          const icon = item.querySelector('.faq-icon-arrow i');
          if (icon) icon.setAttribute('data-lucide', 'minus');
        } else {
          content.style.maxHeight = null;
          const icon = item.querySelector('.faq-icon-arrow i');
          if (icon) icon.setAttribute('data-lucide', 'plus');
        }
        
        // Переинициализируем иконки Lucide для обновления иконки плюс/минус
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      });
    }
  });

  // ===== FORM SELECTOR (Количество карточек) =====
  const selectorBtns = document.querySelectorAll('.selector-btn');
  const hiddenCountInput = document.getElementById('hidden-cards-count');
  
  if (selectorBtns.length > 0 && hiddenCountInput) {
    selectorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        hiddenCountInput.value = btn.getAttribute('data-value');
      });
    });
  }

  // ===== WEB3FORMS SUBMISSION LOGIC =====
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('form-submit-btn');
      const originalText = submitBtn.innerText;
      
      submitBtn.innerText = 'Отправка...';
      submitBtn.disabled = true;
      
      const formData = new FormData(leadForm);
      
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Вызываем цель успешной отправки в Яндекс Метрике
          if (window.ymID && typeof ym !== 'undefined') {
            ym(window.ymID, 'reachGoal', 'lead_submit');
          }
          
          submitBtn.innerText = 'Заявка принята!';
          submitBtn.style.backgroundColor = '#10B981';
          leadForm.reset();
          
          // Перенаправляем на страницу Спасибо
          setTimeout(() => {
            window.location.href = 'spasibo.html';
          }, 500);
        } else {
          alert('Ошибка при отправке: ' + (data.message || 'пожалуйста, попробуйте еще раз.'));
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
        }
      })
      .catch(error => {
        console.error('Submission Error:', error);
        alert('Произошла ошибка при отправке заявки. Проверьте интернет.');
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  // ===== FAQ CATEGORY TABS =====
  const faqTabs = document.querySelectorAll('.faq-tab-btn');
  const faqItemsList = document.querySelectorAll('.faq-item');
  
  if (faqTabs.length > 0 && faqItemsList.length > 0) {
    faqTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle active class on tabs
        faqTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const cat = tab.getAttribute('data-category');
        
        faqItemsList.forEach(item => {
          const trigger = item.querySelector('.faq-trigger');
          const content = item.querySelector('.faq-content');
          const icon = item.querySelector('.faq-icon-arrow i');
          
          // Close all accordions during switch to prevent height glitches
          if (trigger && content) {
            trigger.setAttribute('aria-expanded', 'false');
            content.style.maxHeight = null;
            if (icon) icon.setAttribute('data-lucide', 'plus');
          }
          
          // Toggle visibility based on category
          if (item.getAttribute('data-cat') === cat) {
            item.style.display = 'block';
            // Force reflow and add visible class
            item.offsetHeight; 
            item.classList.add('visible');
          } else {
            item.classList.remove('visible');
            item.style.display = 'none';
          }
        });
        
        // Re-initialize Lucide icons for the newly visible category
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      });
    });
    
    // Set active tab on load
    const activeTab = document.querySelector('.faq-tab-btn.active');
    if (activeTab) {
      // Small timeout to let everything render first
      setTimeout(() => {
        activeTab.click();
      }, 50);
    }
  }
})();
