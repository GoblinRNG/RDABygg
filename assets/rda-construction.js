/* RDA Bygg AB - Construction Theme JS */
/* Vanilla JS only — no jQuery, no external CDN */

(function () {
  'use strict';

  /* ============================================================
     Before/After Slider
     ============================================================ */
  function initBeforeAfterSliders() {
    var sliders = document.querySelectorAll('.rda-before-after__slider');
    if (!sliders.length) return;

    sliders.forEach(function (slider) {
      var afterImg = slider.querySelector('.rda-ba-img--after');
      var handle = slider.querySelector('.rda-ba-handle');
      if (!afterImg || !handle) return;

      var dragging = false;

      function setPosition(clientX) {
        var rect = slider.getBoundingClientRect();
        var x = clientX - rect.left;
        var pct = Math.min(Math.max(x / rect.width, 0), 1);
        var clipPct = (1 - pct) * 100;
        afterImg.style.clipPath = 'inset(0 ' + clipPct + '% 0 0)';
        handle.style.left = (pct * 100) + '%';
      }

      /* Mouse events */
      handle.addEventListener('mousedown', function (e) {
        e.preventDefault();
        dragging = true;
      });

      document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        setPosition(e.clientX);
      });

      document.addEventListener('mouseup', function () {
        dragging = false;
      });

      /* Touch events */
      handle.addEventListener('touchstart', function (e) {
        dragging = true;
      }, { passive: true });

      document.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        if (e.touches && e.touches[0]) {
          setPosition(e.touches[0].clientX);
        }
      }, { passive: true });

      document.addEventListener('touchend', function () {
        dragging = false;
      });

      /* Keyboard support */
      handle.setAttribute('tabindex', '0');
      handle.setAttribute('role', 'slider');
      handle.setAttribute('aria-label', 'Before/after comparison slider');
      handle.addEventListener('keydown', function (e) {
        var rect = slider.getBoundingClientRect();
        var currentLeft = parseFloat(handle.style.left) || 50;
        var step = 5;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          currentLeft = Math.max(0, currentLeft - step);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          currentLeft = Math.min(100, currentLeft + step);
        } else {
          return;
        }
        handle.style.left = currentLeft + '%';
        var clipPct = 100 - currentLeft;
        afterImg.style.clipPath = 'inset(0 ' + clipPct + '% 0 0)';
        e.preventDefault();
      });
    });
  }

  /* ============================================================
     FAQ Accordion
     ============================================================ */
  function initFaqAccordions() {
    var questions = document.querySelectorAll('.rda-faq-question');
    if (!questions.length) return;

    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var answerId = btn.getAttribute('aria-controls');
        var answer = answerId ? document.getElementById(answerId) : null;

        /* Optionally close other open items in the same list */
        var parentList = btn.closest('.rda-faq__list');
        if (parentList) {
          parentList.querySelectorAll('.rda-faq-question[aria-expanded="true"]').forEach(function (other) {
            if (other !== btn) {
              other.setAttribute('aria-expanded', 'false');
              var otherId = other.getAttribute('aria-controls');
              var otherAnswer = otherId ? document.getElementById(otherId) : null;
              if (otherAnswer) otherAnswer.classList.remove('is-open');
            }
          });
        }

        if (expanded) {
          btn.setAttribute('aria-expanded', 'false');
          if (answer) answer.classList.remove('is-open');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.classList.add('is-open');
        }
      });
    });
  }

  /* ============================================================
     Init on DOMContentLoaded
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBeforeAfterSliders();
      initFaqAccordions();
    });
  } else {
    initBeforeAfterSliders();
    initFaqAccordions();
  }

})();
