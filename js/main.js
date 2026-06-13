// Three.js Particle Network (only)
import * as THREE from "three";

const canvas = document.getElementById("particle-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.z = 35;

const N = 180, geo = new THREE.BufferGeometry();
const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), col = new Float32Array(N * 3);
const ac = new THREE.Color("#00e5ff"), pu = new THREE.Color("#b388ff"), wh = new THREE.Color("#ffffff");

for (let i = 0; i < N; i++) {
  pos[i*3] = (Math.random() - 0.5) * 50; pos[i*3+1] = (Math.random() - 0.5) * 50; pos[i*3+2] = (Math.random() - 0.5) * 30;
  vel[i*3] = (Math.random() - 0.5) * 0.015; vel[i*3+1] = (Math.random() - 0.5) * 0.015; vel[i*3+2] = (Math.random() - 0.5) * 0.008;
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
function bLines() {
  const p = geo.attributes.position.array, lp = [], lc = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (lp.length / 3 >= 800) break;
      const dx = p[i*3] - p[j*3], dy = p[i*3+1] - p[j*3+1], dz = p[i*3+2] - p[j*3+2];
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < 6.5) {
        const a = 1 - d / 6.5;
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
