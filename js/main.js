// NEXUS — compact academic layout JS
import * as THREE from "three";

// --- Particles ---
const canvas = document.getElementById("particle-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.z = 35;

const N = 180;
const geo = new THREE.BufferGeometry();
const pos = new Float32Array(N * 3);
const vel = new Float32Array(N * 3);
const col = new Float32Array(N * 3);
const ac = new THREE.Color("#00e5ff"), pu = new THREE.Color("#b388ff"), wh = new THREE.Color("#ffffff");

for (let i = 0; i < N; i++) {
  pos[i*3] = (Math.random() - 0.5) * 50;
  pos[i*3+1] = (Math.random() - 0.5) * 50;
  pos[i*3+2] = (Math.random() - 0.5) * 30;
  vel[i*3] = (Math.random() - 0.5) * 0.015;
  vel[i*3+1] = (Math.random() - 0.5) * 0.015;
  vel[i*3+2] = (Math.random() - 0.5) * 0.008;
  const m = Math.random(), c = new THREE.Color();
  if (m < 0.4) c.copy(ac).multiplyScalar(0.3 + Math.random() * 0.6);
  else if (m < 0.7) c.copy(pu).multiplyScalar(0.3 + Math.random() * 0.6);
  else c.copy(wh).multiplyScalar(0.2 + Math.random() * 0.4);
  col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
}
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.11, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }));
scene.add(pts);

const lMat = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.4 });
let lines;
const MAX_L = 400, CD = 6.5;
function bLines() {
  const p = geo.attributes.position.array, lp = [], lc = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (lp.length / 3 >= MAX_L * 2) break;
      const dx = p[i*3] - p[j*3], dy = p[i*3+1] - p[j*3+1], dz = p[i*3+2] - p[j*3+2];
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < CD) {
        const a = 1 - d / CD;
        lp.push(p[i*3], p[i*3+1], p[i*3+2], p[j*3], p[j*3+1], p[j*3+2]);
        lc.push(ac.r*a*0.2, ac.g*a*0.2, ac.b*a*0.2, ac.r*a*0.2, ac.g*a*0.2, ac.b*a*0.2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(lc, 3));
  return g;
}
lines = new THREE.LineSegments(bLines(), lMat);
scene.add(lines);

const mouse = new THREE.Vector2(), target = new THREE.Vector2();
addEventListener("mousemove", e => { mouse.x = (e.clientX/innerWidth)*2-1; mouse.y = -(e.clientY/innerHeight)*2+1; });

let t = 0;
(function anim() {
  requestAnimationFrame(anim); t += 0.005;
  const p = geo.attributes.position.array;
  for (let i = 0; i < N; i++) {
    p[i*3] += vel[i*3]; p[i*3+1] += vel[i*3+1]; p[i*3+2] += vel[i*3+2];
    if (Math.abs(p[i*3]) > 25) vel[i*3] *= -1;
    if (Math.abs(p[i*3+1]) > 25) vel[i*3+1] *= -1;
    if (Math.abs(p[i*3+2]) > 15) vel[i*3+2] *= -1;
  }
  geo.attributes.position.needsUpdate = true;
  if (Math.floor(t * 80) % 3 === 0) { scene.remove(lines); lines.geometry.dispose(); lines = new THREE.LineSegments(bLines(), lMat); scene.add(lines); }
  target.x += (mouse.x * 0.06 - target.x) * 0.03; target.y += (mouse.y * 0.06 - target.y) * 0.03;
  pts.rotation.y += target.x * 0.002; pts.rotation.x += target.y * 0.002;
  lines.rotation.y = pts.rotation.y; lines.rotation.x = pts.rotation.x;
  renderer.render(scene, camera);
})();
addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); });

// --- Typing ---
const tw = document.getElementById("typewriter");
const phrases = ["Hi, I am Hengyuan.", "Welcome to my site.", "I build AI systems.", "I research generative models.", "echo $WHOAMI"];
let pi = 0, ci = 0, del = false, sp = 80;
(function loop() {
  const cur = phrases[pi]; del ? ci-- : ci++; sp = del ? 35 : 80 + Math.random() * 40;
  tw.textContent = cur.substring(0, ci);
  if (!del && ci === cur.length) { sp = 2000; del = true; }
  else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; sp = 400; }
  setTimeout(loop, sp);
})();

// --- Language ---
let lang = "en";
document.getElementById("lang-toggle").addEventListener("click", () => {
  lang = lang === "en" ? "zh" : "en";
  document.getElementById("lang-toggle").textContent = lang === "en" ? "中文" : "EN";
  document.documentElement.lang = lang === "en" ? "en" : "zh";
  document.querySelectorAll("[data-en][data-zh]").forEach(el => el.innerHTML = el.getAttribute("data-" + lang));
});

// --- Scroll Reveal ---
const ro = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); ro.unobserve(e.target); } }), { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });
document.querySelectorAll(".reveal").forEach(el => ro.observe(el));

// --- GitHub Stars ---
async function fetchStars() {
  let total = 0;
  const badges = document.querySelectorAll(".star-count[data-repo]");

  try {
    const r = await fetch("https://api.github.com/users/Doby-Xu/repos?per_page=100");
    if (r.ok) {
      const repos = await r.json();
      total = repos.reduce((s, repo) => s + (repo.stargazers_count || 0), 0);
      repos.forEach(repo => {
        badges.forEach(b => { if (b.dataset.repo === "Doby-Xu/" + repo.name) b.textContent = repo.stargazers_count || ""; });
      });
    }
  } catch(e) {}

  for (const repo of ["Ammmob/PixelSmile", "XSafeAI/AI-safety-report"]) {
    try {
      const r = await fetch("https://api.github.com/repos/" + repo);
      if (r.ok) {
        const d = await r.json();
        total += d.stargazers_count || 0;
        badges.forEach(b => { if (b.dataset.repo === repo) b.textContent = "★ " + (d.stargazers_count || ""); });
      }
    } catch(e) {}
  }

  const el = document.getElementById("github-stars");
  if (el && total > 0) el.textContent = total >= 1000 ? (total/1000).toFixed(total<2000?1:0) + "K+" : total + "+";
}
fetchStars();

// --- Navbar ---
let ls = 0;
const nav = document.getElementById("navbar");
addEventListener("scroll", () => {
  const s = scrollY;
  nav.style.transform = s <= 0 ? "translateY(0)" : s > ls && s > 60 ? "translateY(-100%)" : "translateY(0)";
  nav.style.opacity = s <= 0 ? "1" : s > ls && s > 60 ? "0" : "1";
  ls = s;
});

// --- Nav highlight ---
addEventListener("scroll", () => {
  let cur = "";
  document.querySelectorAll("section[id]").forEach(s => { if (scrollY >= s.offsetTop - 80) cur = s.id; });
  document.querySelectorAll(".nav-links a").forEach(a => a.style.color = a.getAttribute("href") === "#" + cur ? "var(--accent)" : "");
});
