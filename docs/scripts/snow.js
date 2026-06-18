/* =====================================================================
   Falling snow — lightweight canvas particle field.
   Uses a pre-rendered soft sprite (cheap) + depth parallax + drifting wind.
   Honors prefers-reduced-motion and pauses when the tab is hidden.
   ===================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('snow');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var flakes = [];
  var wind = 0;
  var running = true;

  // Soft round snowflake sprite, drawn once into an offscreen canvas.
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  (function buildSprite() {
    var s = sprite.getContext('2d');
    var g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.35, 'rgba(233,246,255,0.7)');
    g.addColorStop(1, 'rgba(191,230,255,0)');
    s.fillStyle = g;
    s.beginPath();
    s.arc(16, 16, 16, 0, Math.PI * 2);
    s.fill();
  })();

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    // density scales with screen area, but stays sane on big monitors / phones
    var target = Math.round(Math.min(180, Math.max(40, (W * H) / 10000)));
    if (reduceMotion) target = 0;
    flakes = [];
    for (var i = 0; i < target; i++) flakes.push(makeFlake(true));
  }

  function makeFlake(anywhere) {
    var depth = Math.random();            // 0 = far, 1 = near
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -10,
      r: 1 + depth * 3.2,                 // near flakes are bigger
      vy: 0.35 + depth * 1.5,             // and fall faster
      sway: 0.4 + depth * 1.1,
      phase: Math.random() * Math.PI * 2,
      spin: 0.002 + Math.random() * 0.01,
      alpha: 0.35 + depth * 0.6
    };
  }

  function tick(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    wind = Math.sin(t * 0.0002) * 0.8;    // slow lateral breeze

    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.phase += f.spin;
      f.y += f.vy;
      f.x += Math.sin(f.phase) * f.sway + wind * (f.r / 3);

      if (f.y - f.r > H) { f.y = -f.r; f.x = Math.random() * W; }
      if (f.x > W + 20) f.x = -20;
      else if (f.x < -20) f.x = W + 20;

      var d = f.r * 2;
      ctx.globalAlpha = f.alpha;
      ctx.drawImage(sprite, f.x - f.r, f.y - f.r, d, d);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  // pause when hidden to save battery / CPU
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden && !reduceMotion;
    if (running) requestAnimationFrame(tick);
  });

  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!reduceMotion) requestAnimationFrame(tick);
})();
