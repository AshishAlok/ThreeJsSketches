import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
earthGroup.position.x = 15;
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});

// Create a Solar System Group
const solarSystemGroup = new THREE.Group();
scene.add(solarSystemGroup);
solarSystemGroup.add(earthGroup);

const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 8000});
scene.add(stars);

const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-2, 0.5, 1.5);
// scene.add(light);

// Create the Sun Group
const sunGroup = new THREE.Group();
solarSystemGroup.add(sunGroup);

// Sun Geometry & Material
const sunGeometry = new THREE.SphereGeometry(3.5, 32, 32); // Bigger than Earth
const sunMaterial = new THREE.MeshStandardMaterial({
  // map: loader.load("./textures/sun_texture.jpg"),
  emissive: 0xff5500,
  emissiveMap: loader.load("./textures/sun_texture.jpg"), // Helps make the texture "glow"
  emissiveIntensity: 3.0, // Increase intensity
});
const sunGlowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff8800,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
});
const sunGlowMesh = new THREE.Mesh(new THREE.SphereGeometry(3.7, 32, 32), sunGlowMaterial);
sunGroup.add(sunGlowMesh);

const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunGroup.add(sunMesh);

// Sun Light (PointLight instead of DirectionalLight)
const sunLight = new THREE.PointLight(0xffffff, 300, 1000, 1.7); // (color, intensity, distance, decay)
sunLight.position.set(0, 0, 0); // The light is inside the Sun
sunGroup.add(sunLight);



function animate() {
  requestAnimationFrame(animate);

  sunGroup.rotation.y += 0.001;
  earthGroup.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.001;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);