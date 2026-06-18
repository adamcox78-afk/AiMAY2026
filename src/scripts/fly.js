/* =====================================================================
   First-person fly-through engine.
   Scroll = forward travel: we map scroll through #flyTrack onto --p (0→1).
   Every object in the 3D world positions itself in DEPTH from --p (see
   fly.css), so scrolling flies the camera FORWARD through the scene rather
   than panning down a page. GSAP ScrollTrigger scrubs --p for smooth,
   eased motion; a requestAnimationFrame loop is the fallback.
   Console logs: GSAP loaded, ScrollTrigger active, frames running.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  var track = document.getElementById('flyTrack');
  var badge = document.getElementById('mtBadge');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var g = window.gsap, ST = window.ScrollTrigger;
  var hasG = !!g, stActive = false, gsapFrames = 0;

  function setP(p) { root.style.setProperty('--p', p.toFixed(4)); }

  console.log('%c[fly] init', 'color:#54e3d6;font-weight:bold');

  if (reduce) {
    root.classList.add('reduced');
    console.warn('[fly] reduced-motion → fly-through disabled, static fallback shown');
  }

  if (hasG) {
    console.log('[fly] ✅ GSAP loaded — v' + g.version);
    g.ticker.add(function () { gsapFrames++; });
  } else {
    console.warn('[fly] ⚠️ GSAP not loaded — using rAF fallback (motion still works)');
  }

  if (!reduce && track) {
    if (hasG && ST) {
      g.registerPlugin(ST);
      stActive = true;
      console.log('[fly] ✅ ScrollTrigger ACTIVE — scrubbing the camera forward');
      var lastp = -1;
      g.to(root, {
        '--p': 1, ease: 'none',
        scrollTrigger: {
          trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.8,
          onUpdate: function (self) {
            var p = Math.round(self.progress * 100);
            if (p !== lastp) { lastp = p; if (p % 10 === 0) console.log('[fly] ⟳ forward ' + p + '%'); }
          }
        }
      });
    } else {
      console.warn('[fly] ⚠️ ScrollTrigger absent — rAF camera fallback');
      var ticking = false;
      var calc = function () {
        ticking = false;
        var rect = track.getBoundingClientRect();
        var scrollable = track.offsetHeight - window.innerHeight;
        var p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        setP(p);
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(calc); } }, { passive: true });
      window.addEventListener('resize', calc, { passive: true });
      calc();
    }
  }

  // frame counter + live badge (proves frames are running, every browser)
  var total = 0, fc = 0, fps = 0, last = performance.now();
  function tick(now) {
    total++; fc++;
    if (now - last >= 1000) {
      fps = fc; fc = 0; last = now;
      if (badge) badge.textContent = '⚙ ' + (hasG ? 'GSAP ✓' : 'CSS') + (stActive ? ' · ST ✓' : '') + ' · ' + fps + ' fps';
      console.log('[fly] 🎞️ animation frames running — total ' + total + ', ' + fps + ' fps' + (hasG ? ', gsap ticker ' + gsapFrames : ''));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  console.log('[fly] 🎞️ requestAnimationFrame loop started');
})();
