/* Real-time Three.js hero scene: floating, softly lit 3D forms.
   Loaded as a module so the original vanilla-JS portfolio remains unchanged. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

(() => {
  const host = document.querySelector("#hero-visual");
  if (!host || host.querySelector(".three-portfolio-canvas")) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.domElement.className = "three-portfolio-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(host.clientWidth || 420, host.clientHeight || 520, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, (host.clientWidth || 420) / (host.clientHeight || 520), 0.1, 100);
  camera.position.set(0, 0, 8.4);

  scene.add(new THREE.AmbientLight(0xb6d8ff, 1.45));
  const cyan = new THREE.PointLight(0x00eaff, 26, 16); cyan.position.set(2.8, 2.2, 4); scene.add(cyan);
  const violet = new THREE.PointLight(0x9666ff, 22, 14); violet.position.set(-3, -1.8, 2); scene.add(violet);
  const white = new THREE.DirectionalLight(0xffffff, 1.8); white.position.set(0, 3, 5); scene.add(white);

  const forms = new THREE.Group();
  scene.add(forms);
  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x08d9ed, metalness: 0.72, roughness: 0.22, clearcoat: 0.9, clearcoatRoughness: 0.16, emissive: 0x003d55, emissiveIntensity: 0.4 }),
    new THREE.MeshPhysicalMaterial({ color: 0x9d72ff, metalness: 0.65, roughness: 0.2, clearcoat: 1, emissive: 0x210047, emissiveIntensity: 0.45 }),
    new THREE.MeshPhysicalMaterial({ color: 0xdde9ff, metalness: 0.82, roughness: 0.18, clearcoat: 1 })
  ];
  const objects = [];
  function add(geometry, materialIndex, position, scale, speed, spin) {
    const mesh = new THREE.Mesh(geometry, materials[materialIndex]);
    mesh.position.set(...position); mesh.scale.setScalar(scale);
    mesh.userData = { baseY: position[1], speed, spin, phase: Math.random() * Math.PI * 2 };
    forms.add(mesh); objects.push(mesh);
  }
  add(new THREE.TorusKnotGeometry(0.56, 0.16, 100, 14, 2, 3), 0, [1.45, 1.12, 0.15], 0.9, 0.7, 0.34);
  add(new THREE.IcosahedronGeometry(0.62, 1), 1, [-1.48, 0.8, -0.4], 0.72, 0.55, 0.28);
  add(new THREE.TorusGeometry(0.56, 0.045, 12, 72), 2, [1.48, -1.28, 0.05], 1, 0.62, 0.22);
  add(new THREE.OctahedronGeometry(0.46, 0), 0, [-1.52, -1.42, -0.35], 0.72, 0.8, 0.42);
  add(new THREE.TorusGeometry(0.28, 0.055, 10, 48), 1, [0.15, 2.0, -0.8], 0.85, 0.45, 0.24);
  add(new THREE.DodecahedronGeometry(0.24, 0), 2, [1.9, 0.0, -0.7], 0.8, 0.9, 0.5);

  const starGeo = new THREE.BufferGeometry();
  const starCount = 150;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 7.2;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 7.2;
    starPositions[i * 3 + 2] = -1.5 - Math.random() * 4;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8beeff, size: 0.018, transparent: true, opacity: 0.7 }));
  scene.add(stars);

  let pointerX = 0, pointerY = 0, visible = true, frame = 0, disposed = false;
  const clock = new THREE.Clock();
  host.addEventListener("pointermove", event => {
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }, { passive: true });
  host.addEventListener("pointerleave", () => { pointerX = 0; pointerY = 0; }, { passive: true });

  function resize() {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize, { passive: true });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: 0.02 });
  observer.observe(host);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
    else if (!document.hidden) start();
  });
  function draw() {
    if (disposed || document.hidden || !visible) { frame = 0; return; }
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      forms.rotation.y += 0.0018;
      forms.rotation.x += 0.0007;
      forms.position.x += ((pointerX * 0.16) - forms.position.x) * 0.025;
      forms.position.y += ((-pointerY * 0.12) - forms.position.y) * 0.025;
      objects.forEach(mesh => {
        const d = mesh.userData;
        mesh.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.12;
        mesh.rotation.x += d.spin * 0.004;
        mesh.rotation.y += d.spin * 0.006;
      });
      stars.rotation.y = t * 0.006;
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(draw);
  }
  function start() {
    if (!frame && !disposed && visible && !document.hidden) {
      if (reduceMotion) { renderer.render(scene, camera); return; }
      frame = requestAnimationFrame(draw);
    }
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
  resize();
  start();
  window.addEventListener("pagehide", () => {
    disposed = true; observer.disconnect(); if (frame) cancelAnimationFrame(frame);
    scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); });
    materials.forEach(material => material.dispose()); renderer.dispose();
  }, { once: true });
})();
