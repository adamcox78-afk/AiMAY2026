/* =====================================================================
   Motion test / diagnostics. Proves the animation pipeline in YOUR browser:
   - pure CSS keyframes always animate (no JS needed)
   - GSAP + ScrollTrigger drive extra motion when the CDN loads
   - graceful pure-CSS fallback if GSAP is unavailable
   - console logs: GSAP loaded, ScrollTrigger active, frames running
   - on-page status readout + a fixed badge (no devtools required)
   ===================================================================== */
(function () {
  'use strict';
  function set(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }

  var g = window.gsap, ST = window.ScrollTrigger;
  var hasGsap = !!g, stActive = false, gsapFrames = 0;

  console.log('%c[motion-test] init', 'color:#54e3d6;font-weight:bold');

  // ---- GSAP loaded? ----
  if (hasGsap) {
    console.log('[motion-test] ✅ GSAP loaded — v' + g.version);
    set('mtGsap', 'GSAP v' + g.version + ' loaded ✓');
    g.ticker.add(function () { gsapFrames++; });
  } else {
    console.warn('[motion-test] ⚠️ GSAP NOT loaded — pure-CSS fallback active (motion still visible)');
    set('mtGsap', 'GSAP not loaded — CSS fallback ✓');
    var sec = document.querySelector('.motion-test');
    if (sec) sec.classList.add('no-gsap');
  }

  // ---- ScrollTrigger active? ----
  if (hasGsap && ST) {
    try {
      g.registerPlugin(ST);
      stActive = true;
      console.log('[motion-test] ✅ ScrollTrigger registered & ACTIVE');
      set('mtST', 'ScrollTrigger active ✓');

      // continuous GSAP motion (spin + slide)
      g.to('#gsapBox', { rotation: 360, duration: 3, repeat: -1, ease: 'none' });
      g.to('#gsapBox', { x: 120, duration: 1.4, repeat: -1, yoyo: true, ease: 'power1.inOut' });

      // scroll-driven scrub: fill a bar as the section passes through the viewport
      var fires = 0;
      g.to('#mtScrubFill', {
        width: '100%', ease: 'none',
        scrollTrigger: {
          trigger: '.motion-test', start: 'top 85%', end: 'bottom 15%', scrub: true,
          onEnter: function () { fires++; set('mtFires', 'ScrollTrigger fired: ' + fires + ' (enter)'); console.log('[motion-test] ▶️ ScrollTrigger ENTER'); },
          onEnterBack: function () { fires++; set('mtFires', 'ScrollTrigger fired: ' + fires + ' (enterBack)'); console.log('[motion-test] ◀️ ScrollTrigger ENTER-BACK'); },
          onUpdate: function (self) {
            var p = Math.round(self.progress * 100);
            if (p !== window.__mtP) { window.__mtP = p; if (p % 20 === 0) console.log('[motion-test] ⟳ ScrollTrigger scrub ' + p + '%'); }
          }
        }
      });
    } catch (e) {
      console.error('[motion-test] ScrollTrigger error', e);
      set('mtST', 'ScrollTrigger error (see console)');
    }
  } else if (hasGsap) {
    console.warn('[motion-test] ⚠️ ScrollTrigger NOT loaded');
    set('mtST', 'ScrollTrigger not loaded');
  } else {
    set('mtST', 'ScrollTrigger n/a (CSS fallback)');
  }

  // ---- requestAnimationFrame counter — proves frames are running (always on) ----
  var total = 0, fc = 0, lastFps = 0, last = performance.now();
  function tick(now) {
    total++; fc++;
    set('mtFrames', 'Frames: ' + total + ' · ' + lastFps + ' fps' + (hasGsap ? ' · gsap ' + gsapFrames : ''));
    if (now - last >= 1000) {
      lastFps = fc; fc = 0; last = now;
      set('mtBadge', '⚙ ' + (hasGsap ? 'GSAP ✓' : 'CSS') + (stActive ? ' · ST ✓' : '') + ' · ' + lastFps + ' fps');
      console.log('[motion-test] 🎞️ animation frames running — total ' + total + ', ' + lastFps + ' fps' + (hasGsap ? ', gsap ticker ' + gsapFrames : ''));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  console.log('[motion-test] 🎞️ requestAnimationFrame loop started');
})();
