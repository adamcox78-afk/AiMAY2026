/* =====================================================================
   Real ice tunnel — WebGL (Three.js r128, UMD global THREE).
   A TubeGeometry path (winding + descending) wrapped on its INSIDE with a
   procedural ice texture (colour + bump). A head-lamp point light travels
   with the camera so the ice walls catch relief; FogExp2 gives cave depth.
   Scroll flies the camera FORWARD along the tube (smoothed). --p is exposed
   for the DOM info/HUD overlays. Falls back to the static section if WebGL
   or Three.js is unavailable, or under prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  var badge = document.getElementById('mtBadge');
  var canvas = document.getElementById('webgl');
  var track = document.getElementById('flyTrack');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fallback(msg) { root.classList.add('reduced'); console.warn('[tunnel] static fallback —', msg); }

  if (reduce) { fallback('prefers-reduced-motion'); return; }
  if (!window.THREE) { fallback('Three.js did not load'); return; }
  if (!canvas) { fallback('no #webgl canvas'); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    if (!renderer.getContext()) throw new Error('no context');
  } catch (e) { fallback('WebGL unavailable: ' + e.message); return; }

  console.log('%c[tunnel] ✅ WebGL ice tunnel live — Three.js r' + THREE.REVISION, 'color:#54e3d6;font-weight:bold');

  var FOG = 0x0a1c2e;
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(FOG, 0.03);
  renderer.setClearColor(FOG, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, 0.1, 1000);
  function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize, { passive: true });

  // winding, descending tunnel path
  var pts = [];
  for (var i = 0; i <= 26; i++) {
    pts.push(new THREE.Vector3(Math.sin(i * 0.45) * 7, -i * 2.1 + Math.cos(i * 0.33) * 3.5, -i * 16));
  }
  var curve = new THREE.CatmullRomCurve3(pts);

  // procedural ice texture (frost grains + cracks on a blue gradient)
  function iceTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#cfe8ff'); g.addColorStop(0.5, '#79a8cc'); g.addColorStop(1, '#3c6585');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 1200; i++) {
      x.globalAlpha = Math.random() * 0.1; x.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#21455f';
      x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 55 + 5, 0, 7); x.fill();
    }
    x.globalAlpha = 0.45; x.strokeStyle = 'rgba(233,247,255,0.8)'; x.lineWidth = 1.1;
    for (var j = 0; j < 50; j++) {
      x.beginPath(); var px = Math.random() * 512, py = Math.random() * 512; x.moveTo(px, py);
      for (var k = 0; k < 6; k++) { px += (Math.random() - 0.5) * 90; py += (Math.random() - 0.5) * 90; x.lineTo(px, py); }
      x.stroke();
    }
    x.globalAlpha = 1;
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 3);
    return t;
  }
  var mat = new THREE.MeshStandardMaterial({
    map: iceTexture(), bumpMap: iceTexture(), bumpScale: 0.45,
    side: THREE.BackSide, roughness: 0.62, metalness: 0.18, color: 0xdfefff
  });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 320, 6, 26, false), mat));

  // lighting: cool ambient + a head-lamp that travels with the camera + a teal accent ahead
  scene.add(new THREE.AmbientLight(0x33526e, 0.7));
  var lamp = new THREE.PointLight(0xdff3ff, 1.5, 60, 2); scene.add(lamp);
  var glow = new THREE.PointLight(0x54e3d6, 0.6, 55, 2); scene.add(glow);

  // scroll → forward progress (smoothed)
  function range() { return Math.max(1, (track ? track.offsetHeight : innerHeight * 7) - innerHeight); }
  var target = 0, curT = 0;
  function onScroll() { target = Math.min(1, Math.max(0, window.scrollY / range())); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // DOM overlays driven by progress
  var infos = Array.prototype.slice.call(document.querySelectorAll('.t-info'));
  var reveal = document.getElementById('deviceReveal');

  var pos = new THREE.Vector3(), look = new THREE.Vector3();
  var total = 0, fc = 0, fps = 0, last = performance.now();

  function frame(now) {
    total++; fc++;
    curT += (target - curT) * 0.06;                       // ease toward scroll target
    var t = Math.min(0.999, Math.max(0.001, curT));
    curve.getPointAt(t, pos);
    curve.getPointAt(Math.min(1, t + 0.012), look);
    camera.position.copy(pos);
    camera.lookAt(look);
    lamp.position.copy(pos);
    glow.position.copy(look);
    root.style.setProperty('--p', curT.toFixed(4));

    for (var i = 0; i < infos.length; i++) {
      var el = infos[i];
      var on = curT >= parseFloat(el.dataset.from) && curT <= parseFloat(el.dataset.to);
      if (on !== el.classList.contains('active')) el.classList.toggle('active', on);
    }
    if (reveal) reveal.style.opacity = Math.min(1, Math.max(0, (curT - 0.9) / 0.08));

    renderer.render(scene, camera);

    if (now - last >= 1000) {
      fps = fc; fc = 0; last = now;
      if (badge) badge.textContent = '⚙ WebGL ✓ · THREE r' + THREE.REVISION + ' · ' + fps + ' fps';
      console.log('[tunnel] 🎞️ frames running — ' + total + ' total, ' + fps + ' fps, forward ' + Math.round(curT * 100) + '%');
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  console.log('[tunnel] 🎞️ render loop started — scroll to fly the camera through the ice');
})();
