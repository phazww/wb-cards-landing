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
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    });
  });

  // ===== HEADER SHRINK ON SCROLL =====
  const headerEl = document.getElementById('header');
  if (headerEl) {
    let shrinkTicking = false;
    
    function updateHeaderShrink() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 80) {
        headerEl.classList.add('header--shrink');
      } else {
        headerEl.classList.remove('header--shrink');
      }
      shrinkTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!shrinkTicking) {
        requestAnimationFrame(updateHeaderShrink);
        shrinkTicking = true;
      }
    }, { passive: true });
  }

  // ===== ACTIVE NAV HIGHLIGHT =====
  const navLinksAll = document.querySelectorAll('.nav a[href^="#"]');
  const navSections = [];
  navLinksAll.forEach(link => {
    const id = link.getAttribute('href').substring(1);
    const sec = document.getElementById(id);
    if (sec) navSections.push({ el: sec, link: link });
  });

  if (navSections.length > 0) {
    let navTicking = false;
    function updateActiveNav() {
      const scrollY = window.scrollY + 120;
      let activeIdx = 0;
      for (let i = 0; i < navSections.length; i++) {
        if (navSections[i].el.offsetTop <= scrollY) {
          activeIdx = i;
        }
      }
      navLinksAll.forEach(l => l.classList.remove('nav-active'));
      navSections[activeIdx].link.classList.add('nav-active');
      navTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!navTicking) {
        requestAnimationFrame(updateActiveNav);
        navTicking = true;
      }
    }, { passive: true });

    updateActiveNav();
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger';
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ===== COUNTER ANIMATION =====
  const chartLabel = document.querySelector('.hero-chart-label');
  if (chartLabel && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const text = chartLabel.textContent || chartLabel.innerText;
          const match = text.match(/(\+?)(\d+)(%.*)$/);
          if (match) {
            const prefix = match[1];
            const target = parseInt(match[2]);
            const suffix = match[3];
            const duration = 1200;
            const startTime = performance.now();

            function animateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * target);
              chartLabel.textContent = prefix + current + suffix;
              if (progress < 1) {
                requestAnimationFrame(animateCounter);
              }
            }
            requestAnimationFrame(animateCounter);
          }
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterObserver.observe(chartLabel);
  }

  // ===== SUBTLE PARALLAX ON HERO =====
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    let parallaxTicking = false;
    const heroTop = heroSection.querySelector('.hero-top');
    const heroMedia = heroSection.querySelector('.hero-media');
    
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const heroHeight = heroSection.offsetHeight;
          
          if (scrollY < heroHeight) {
            const ratio = scrollY / heroHeight;
            if (heroTop) {
              heroTop.style.transform = `translateY(${ratio * 15}px)`;
              heroTop.style.opacity = 1 - ratio * 0.3;
            }
            if (heroMedia) {
              heroMedia.style.transform = `translateY(${ratio * 10}px)`;
            }
          }
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });
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

  // ===== FAQ SHOW MORE BUTTON =====
  const faqShowMoreBtn = document.getElementById('faq-show-more-btn');
  const faqShowMoreWrap = document.getElementById('faq-show-more-wrap');
  const faqGrid = document.querySelector('.faq-grid');
  
  if (faqShowMoreBtn && faqGrid) {
    faqShowMoreBtn.addEventListener('click', () => {
      faqGrid.classList.add('faq-expanded');
      if (faqShowMoreWrap) faqShowMoreWrap.classList.add('faq-hidden');
      
      // Re-initialize Lucide icons for the newly visible items
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // ===== DRAGGABLE BEFORE/AFTER SLIDER =====
  const slider = document.getElementById('hero-slider');
  const handle = document.getElementById('hero-slider-handle');

  if (slider && handle) {
    let isDragging = false;

    function setSlidePercent(percent) {
      percent = Math.max(0, Math.min(100, percent));
      slider.style.setProperty('--slide-percent', `${percent}%`);
      handle.setAttribute('aria-valuenow', Math.round(percent));
    }

    function handleMove(clientX) {
      const rect = slider.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = (x / rect.width) * 100;
      setSlidePercent(percent);
    }

    // Touch events
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    slider.addEventListener('click', (e) => {
      if (e.target.closest('.slider-handle-button')) return;
      handleMove(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Keyboard events
    handle.addEventListener('keydown', (e) => {
      const currentPercent = parseFloat(slider.style.getPropertyValue('--slide-percent') || '50%');
      if (e.key === 'ArrowLeft') {
        setSlidePercent(currentPercent - 5);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setSlidePercent(currentPercent + 5);
        e.preventDefault();
      } else if (e.key === 'Home') {
        setSlidePercent(0);
        e.preventDefault();
      } else if (e.key === 'End') {
        setSlidePercent(100);
        e.preventDefault();
      }
    });
  }

  // ===== INTERACTIVE AUDIT SANDBOX LOGIC =====
  const sandboxStartBtn = document.getElementById('sandbox-start-btn');
  const sandboxDemoBtn = document.getElementById('sandbox-demo-btn');
  const sandboxResetBtn = document.getElementById('sandbox-reset-btn');
  const sandboxSkuInput = document.getElementById('sandbox-sku-input');
  
  const screenInput = document.getElementById('sandbox-screen-input');
  const screenLoading = document.getElementById('sandbox-screen-loading');
  const screenResult = document.getElementById('sandbox-screen-result');
  
  const loadingStatus = document.getElementById('sandbox-loading-status');
  const loadingProgress = document.getElementById('sandbox-loading-progress');
  const skuDisplay = document.getElementById('sandbox-sku-display');

  if (screenInput && screenLoading && screenResult) {
    
    function runSimulation(sku) {
      // Подготовка
      sku = sku.trim() || '195384029';
      skuDisplay.innerText = `арт. ${sku}`;
      
      // Переход на экран загрузки
      screenInput.classList.remove('active');
      screenLoading.classList.add('active');
      
      let progress = 0;
      loadingProgress.style.width = '0%';
      
      const statuses = [
        { limit: 30, text: `Анализ артикула ${sku}...` },
        { limit: 60, text: 'Сканирование главного фото...' },
        { limit: 85, text: 'Проверка SEO и ключевых слов...' },
        { limit: 100, text: 'Сборка отчёта об ошибках...' }
      ];

      const interval = setInterval(() => {
        progress += 4;
        if (progress > 100) progress = 100;
        
        loadingProgress.style.width = `${progress}%`;
        
        const currentStatus = statuses.find(s => progress <= s.limit);
        if (currentStatus && loadingStatus) {
          loadingStatus.innerText = currentStatus.text;
        }

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            screenLoading.classList.remove('active');
            screenResult.classList.add('active');
            
            // Сброс хотспотов в исходное состояние
            resetHotspots();
          }, 300);
        }
      }, 80);
    }

    if (sandboxStartBtn) {
      sandboxStartBtn.addEventListener('click', () => {
        const sku = sandboxSkuInput ? sandboxSkuInput.value : '195384029';
        runSimulation(sku);
      });
    }

    if (sandboxDemoBtn) {
      sandboxDemoBtn.addEventListener('click', () => {
        runSimulation('195384029');
      });
    }

    if (sandboxResetBtn) {
      sandboxResetBtn.addEventListener('click', () => {
        screenResult.classList.remove('active');
        screenInput.classList.add('active');
        if (sandboxSkuInput) sandboxSkuInput.value = '195384029';
      });
    }

    // Хотспоты
    const hotspots = document.querySelectorAll('.hotspot');
    const placeholder = document.getElementById('sandbox-info-placeholder');
    const panels = document.querySelectorAll('.sandbox-info-panel');

    function resetHotspots() {
      hotspots.forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
      });
      if (placeholder) placeholder.style.display = 'flex';
      panels.forEach(p => p.classList.remove('active'));
    }

    hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', () => {
        const targetId = hotspot.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);

        if (targetPanel) {
          const isActive = hotspot.classList.contains('active');
          
          resetHotspots();

          if (!isActive) {
            hotspot.classList.add('active');
            hotspot.setAttribute('aria-expanded', 'true');
            if (placeholder) placeholder.style.display = 'none';
            targetPanel.classList.add('active');
          }
        }
      });
    });
  }

  // ===== INTERACTIVE PRICING CALCULATOR LOGIC =====
  const calcRange = document.getElementById('calc-cards-range');
  const calcValDisplay = document.getElementById('calc-cards-val');
  
  const cbMain = document.getElementById('calc-service-main');
  const cbFull = document.getElementById('calc-service-full');
  const cbSeo = document.getElementById('calc-service-seo');
  const cbWhite = document.getElementById('calc-service-white');
  
  const summaryTariff = document.getElementById('summary-tariff-name');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryTotal = document.getElementById('summary-total-cost');
  const summaryPerCard = document.getElementById('summary-per-card-cost');
  const calcPartnerNote = document.getElementById('calc-partner-note');
  const calcSubmitBtn = document.getElementById('calc-submit-btn');

  if (calcRange) {
    const prices = {
      main: 500,
      full: 3000,
      seo: 1500,
      white: 150
    };

    function calculateCost() {
      const N = parseInt(calcRange.value);
      if (calcValDisplay) calcValDisplay.innerText = N >= 1000 ? '1000+' : N;

      // Получаем сумму выбранных услуг
      let unitCost = 0;
      if (cbMain && cbMain.checked) unitCost += prices.main;
      if (cbFull && cbFull.checked) unitCost += prices.full;
      if (cbSeo && cbSeo.checked) unitCost += prices.seo;
      if (cbWhite && cbWhite.checked) unitCost += prices.white;

      // Определение скидки и названия тарифа
      let discount = 0;
      let tariffName = 'Для 1–50 карточек';
      
      if (N <= 50) {
        discount = 0;
        tariffName = 'Для 1–50 карточек';
      } else if (N <= 499) {
        discount = 15;
        tariffName = 'Для 51–999 карточек';
      } else if (N <= 999) {
        discount = 30;
        tariffName = 'Для селлеров от 500+';
      } else {
        discount = 35;
        tariffName = 'Для 1000+ карточек';
      }

      // Партнерская плашка
      if (N >= 500) {
        if (calcPartnerNote) calcPartnerNote.classList.add('active');
      } else {
        if (calcPartnerNote) calcPartnerNote.classList.remove('active');
      }

      // Расчет стоимости
      const discountMult = 1 - (discount / 100);
      const perCardCost = Math.round(unitCost * discountMult);
      const totalCost = Math.round(N * unitCost * discountMult);

      // Вывод результатов
      if (summaryTariff) summaryTariff.innerText = tariffName;
      if (summaryDiscount) summaryDiscount.innerText = `${discount}%`;
      if (summaryTotal) summaryTotal.innerText = `${totalCost.toLocaleString('ru-RU')} ₽`;
      if (summaryPerCard) summaryPerCard.innerText = `${perCardCost.toLocaleString('ru-RU')} ₽ / карточка`;
    }

    // Слушатели событий
    calcRange.addEventListener('input', calculateCost);
    [cbMain, cbFull, cbSeo, cbWhite].forEach(cb => {
      if (cb) cb.addEventListener('change', calculateCost);
    });

    // Инициализация при загрузке
    calculateCost();

    // Отправка в форму
    if (calcSubmitBtn) {
      calcSubmitBtn.addEventListener('click', () => {
        const N = parseInt(calcRange.value);
        
        // Находим форму и селекторы
        const leadFormAnchor = document.getElementById('hero-form-anchor');
        const selectorBtns = document.querySelectorAll('.selector-btn');
        const hiddenCountInput = document.getElementById('hidden-cards-count');
        const nameInput = document.getElementById('form-name');
        
        let targetValue = '1-50';
        if (N <= 50) targetValue = '1-50';
        else if (N <= 499) targetValue = '51-999';
        else if (N <= 999) targetValue = '500+';
        else targetValue = '1000+';

        // Активируем кнопку в форме
        if (selectorBtns.length > 0) {
          selectorBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-value') === targetValue) {
              btn.classList.add('active');
            }
          });
        }
        if (hiddenCountInput) hiddenCountInput.value = targetValue;

        // Плавный скролл к форме
        if (leadFormAnchor) {
          leadFormAnchor.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            if (nameInput) nameInput.focus();
          }, 600);
        }
      });
    }
  }
})();
