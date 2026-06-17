/* =====================================================================
   Reveal-on-scroll for content sections + a count-up for the stat block.
   Uses IntersectionObserver; degrades to "just show it" without one or
   under prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showAll() {
    items.forEach(function (el) { el.classList.add('in-view'); });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    showAll();
    runCounts();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
        var strong = e.target.querySelector('strong[data-count]');
        if (strong) countUp(strong);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  items.forEach(function (el) { io.observe(el); });

  function runCounts() {
    document.querySelectorAll('strong[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (target === 0) { el.textContent = '0'; return; }
    var start = performance.now();
    var dur = 1100;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
