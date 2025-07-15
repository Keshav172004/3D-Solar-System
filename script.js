// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 60, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.enableZoom = true;
controls.autoRotate = false;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
scene.add(pointLight);

// Texture Loader
const loader = new THREE.TextureLoader();
const fontLoader = new THREE.FontLoader();

// Background Stars
function addStars(count) {
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);
}
addStars(8000);

// Sun
const sunGeo = new THREE.SphereGeometry(5, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ map: loader.load('textures/sun.jpg') });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planets Data
const planetsData = [
  { name: "Mercury", size: 0.5, texture: 'textures/mercury.jpg', distance: 10, speed: 0.04 },
  { name: "Venus", size: 0.8, texture: 'textures/venus.jpg', distance: 15, speed: 0.015 },
  { name: "Earth", size: 1, texture: 'textures/earth.jpg', distance: 20, speed: 0.01 },
  { name: "Mars", size: 0.7, texture: 'textures/mars.jpg', distance: 25, speed: 0.008 },
  { name: "Jupiter", size: 2.5, texture: 'textures/jupiter.jpg', distance: 35, speed: 0.004 },
  { name: "Saturn", size: 2, texture: 'textures/saturn.jpg', distance: 45, speed: 0.003, ring: 'textures/saturn_ring.png' },
  { name: "Uranus", size: 1.5, texture: 'textures/uranus.jpg', distance: 55, speed: 0.002 },
  { name: "Neptune", size: 1.5, texture: 'textures/neptune.jpg', distance: 65, speed: 0.001 }
];

const planets = [];

// Create Planets + Labels + Sliders
planetsData.forEach(data => {
  // Planet
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: loader.load(data.texture) });
  const planet = new THREE.Mesh(geo, mat);
  planet.userData = { ...data, angle: 0 };
  scene.add(planet);

  // Ring (Saturn)
  if (data.ring) {
    const ringGeo = new THREE.RingGeometry(data.size + 0.6, data.size + 1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: loader.load(data.ring),
      side: THREE.DoubleSide,
      transparent: true
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
  }

  // Orbit Ring
  const orbitGeo = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 64);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Label
  fontLoader.load('fonts/helvetiker_bold.typeface.json', font => {
    const textGeo = new THREE.TextGeometry(data.name, { font, size: 0.5, height: 0.05 });
    const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const label = new THREE.Mesh(textGeo, textMat);
    label.position.set(0, data.size + 1.5, 0);
    planet.add(label);
    planet.userData.label = label;
  });

  planets.push(planet);

  // Speed Slider
  const controlsDiv = document.getElementById('speedControls');
  const label = document.createElement('label');
  label.innerText = `${data.name}: `;
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = data.speed;
  slider.className = 'slider';
  slider.oninput = () => { planet.userData.speed = parseFloat(slider.value); };
  controlsDiv.appendChild(label);
  controlsDiv.appendChild(slider);
  controlsDiv.appendChild(document.createElement('br'));
});

// Buttons
let paused = false;
document.getElementById('pauseResume').onclick = () => {
  paused = !paused;
  document.getElementById('pauseResume').innerText = paused ? "Resume" : "Pause";
};

let autoRotate = false;
document.getElementById('autoRotateBtn').onclick = () => {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  document.getElementById('autoRotateBtn').innerText = autoRotate ? "Stop Rotate" : "Auto Rotate";
};

let darkMode = true;
document.getElementById('toggleTheme').onclick = () => {
  darkMode = !darkMode;
  scene.background = new THREE.Color(darkMode ? 0x000000 : 0xffffff);
};

// Animate
function animate() {
  requestAnimationFrame(animate);

  if (!paused) {
    planets.forEach(planet => {
      planet.userData.angle += planet.userData.speed;
      planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
      planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
