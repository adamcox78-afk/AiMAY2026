/* =====================================================================
   Scene controller — turns scroll position into melt.
   While the sticky hero is pinned, we map progress through the tall
   .hero-track onto --melt (0 → 1). That single variable drives every
   ice/frost/drip/device transition in hero.css. We also reveal the
   scroll-synced callouts and update the top progress rail.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var track = document.getElementById('heroTrack');
  var fill = document.getElementById('scrollFill');
  var callouts = Array.prototype.slice.call(document.querySelectorAll('.callout'));
  if (!track) return;

  // When motion is reduced we leave --melt at 0 (a still, frosted ice
  // sculpture) and skip the scroll-coupled melt + callouts. The device is
  // still revealed further down the page via the reveal-hero section.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    ticking = false;

    if (!reduceMotion) {
      // --- hero melt progress ---
      // The track is taller than the viewport; the stage is pinned for
      // (trackHeight - viewportHeight). Progress 0..1 over that scroll span.
      var rect = track.getBoundingClientRect();
      var scrollable = track.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      var melt = clamp01(scrollable > 0 ? scrolled / scrollable : 0);
      root.style.setProperty('--melt', melt.toFixed(4));

      // --- callouts that "go by" within the melt timeline ---
      for (var i = 0; i < callouts.length; i++) {
        var c = callouts[i];
        var from = parseFloat(c.getAttribute('data-from'));
        var to = parseFloat(c.getAttribute('data-to'));
        var on = melt >= from && melt <= to;
        if (on !== c.classList.contains('active')) c.classList.toggle('active', on);
      }
    }

    // --- overall page scroll rail ---
    if (fill) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      fill.style.width = pct.toFixed(2) + '%';
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
