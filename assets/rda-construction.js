/* RDA Bygg AB - Construction Theme JS
 * Vanilla JS only — no jQuery, no external CDN
 * Progressive enhancement, DOMContentLoaded safe
 */

(function () {
  'use strict';

  /* ============================================================
     FAQ Accordion
     ============================================================ */
  function initFaqAccordion() {
    var questions = document.querySelectorAll('.rda-faq-item__question');
    if (!questions.length) return;

    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var answerId = btn.getAttribute('aria-controls');
        var answer = answerId ? document.getElementById(answerId) : null;

        // Close all others in same FAQ list
        var parentList = btn.closest('.rda-faq-list');
        if (parentList) {
          parentList.querySelectorAll('.rda-faq-item__question').forEach(function (otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.setAttribute('aria-expanded', 'false');
              var otherId = otherBtn.getAttribute('aria-controls');
              var otherAnswer = otherId ? document.getElementById(otherId) : null;
              if (otherAnswer) {
                otherAnswer.classList.remove('rda-faq-item__answer--open');
              }
            }
          });
        }

        // Toggle current
        var newExpanded = !expanded;
        btn.setAttribute('aria-expanded', String(newExpanded));
        if (answer) {
          if (newExpanded) {
            answer.classList.add('rda-faq-item__answer--open');
          } else {
            answer.classList.remove('rda-faq-item__answer--open');
          }
        }
      });

      // Keyboard support
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ============================================================
     Before/After Slider
     ============================================================ */
  function initBeforeAfterSliders() {
    var sliders = document.querySelectorAll('.rda-ba-slider');
    if (!sliders.length) return;

    sliders.forEach(function (slider) {
      var beforeEl = slider.querySelector('.rda-ba-slider__before');
      var handle = slider.querySelector('.rda-ba-slider__handle');
      if (!beforeEl || !handle) return;

      var isDragging = false;

      function setPosition(x) {
        var rect = slider.getBoundingClientRect();
        var pos = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
        var pct = pos * 100;
        beforeEl.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        handle.style.left = pct + '%';
      }

      // Mouse events
      slider.addEventListener('mousedown', function (e) {
        isDragging = true;
        setPosition(e.clientX);
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        setPosition(e.clientX);
      });

      document.addEventListener('mouseup', function () {
        isDragging = false;
      });

      // Touch events
      slider.addEventListener('touchstart', function (e) {
        isDragging = true;
        setPosition(e.touches[0].clientX);
      }, { passive: true });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        setPosition(e.touches[0].clientX);
      }, { passive: true });

      document.addEventListener('touchend', function () {
        isDragging = false;
      });

      // Keyboard accessibility
      handle.setAttribute('tabindex', '0');
      handle.setAttribute('role', 'slider');
      handle.setAttribute('aria-label', 'Before/after comparison slider');
      handle.setAttribute('aria-valuemin', '0');
      handle.setAttribute('aria-valuemax', '100');
      handle.setAttribute('aria-valuenow', '50');

      handle.addEventListener('keydown', function (e) {
        var rect = slider.getBoundingClientRect();
        var currentLeft = parseFloat(handle.style.left) || 50;
        var step = 5;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setPosition(rect.left + ((currentLeft - step) / 100) * rect.width);
          handle.setAttribute('aria-valuenow', String(Math.max(0, currentLeft - step)));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setPosition(rect.left + ((currentLeft + step) / 100) * rect.width);
          handle.setAttribute('aria-valuenow', String(Math.min(100, currentLeft + step)));
        }
      });
    });
  }

  /* ============================================================
     Homepage: transparent header → solid on scroll
     ============================================================ */
  function initScrollHeader() {
    if (!document.body.classList.contains('template-index')) return;

    var header = document.querySelector('.header-wrapper');
    if (!header) return;

    var hero = document.querySelector('.rda-hero');
    if (!hero) return;

    var threshold = hero.offsetHeight - 80;

    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     Careers / Recruiting Form
     ============================================================ */
  function initCareersForm() {
    var form = document.getElementById('rda-careers-form');
    if (!form) return;

    var submitBtn = form.querySelector('.rda-careers__submit');
    var successMsg = document.getElementById('rda-careers-success');
    var errorMsg = document.getElementById('rda-careers-error');
    var MAX_SIZE = 25 * 1024 * 1024; // 25MB

    function validateFiles() {
      var inputs = form.querySelectorAll('input[type="file"]');
      for (var i = 0; i < inputs.length; i++) {
        var files = inputs[i].files;
        for (var j = 0; j < files.length; j++) {
          if (files[j].size > MAX_SIZE) {
            return 'File "' + files[j].name + '" is too large. Maximum size is 25 MB.';
          }
        }
      }
      return null;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fileError = validateFiles();
      if (fileError) {
        errorMsg.textContent = fileError;
        errorMsg.hidden = false;
        successMsg.hidden = true;
        return;
      }
      errorMsg.hidden = true;
      successMsg.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = submitBtn.getAttribute('data-loading');

      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          successMsg.hidden = false;
          form.reset();
        } else {
          return res.json().then(function (json) {
            throw new Error(json.error || 'Submission failed');
          });
        }
      })
      .catch(function (err) {
        errorMsg.textContent = err.message || 'Something went wrong. Please try again or email us directly.';
        errorMsg.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.getAttribute('data-default');
      });
    });
  }

  /* ============================================================
     Init on DOMContentLoaded
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFaqAccordion();
      initBeforeAfterSliders();
      initScrollHeader();
      initCareersForm();
    });
  } else {
    initFaqAccordion();
    initBeforeAfterSliders();
    initScrollHeader();
    initCareersForm();
  }

})();
