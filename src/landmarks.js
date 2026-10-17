import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = id => document.getElementById(id);
const data = window.CityLandmarkData;
let active = false, loading = null, loaded = false, failed = false, spinning = false, frame = 0, renders = 0;
let renderer, scene, camera, controls, model, environment, canvas, distance = 24, view = 'iso', wireframe = false;
let glbBuffer;

async function modelBytes() {
  if (!glbBuffer) {
    if (typeof DecompressionStream !== 'function') throw new Error('请使用支持离线解压的新版 Chrome 或 Edge');
    const compressed = Uint8Array.from(atob(data.data), char => char.charCodeAt(0));
    glbBuffer = await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    if (glbBuffer.byteLength !== data.glbBytes) throw new Error('内置模型长度不一致');
  }
  return glbBuffer;
}

function status(message) { $('landmark-status').textContent = message; }
function requestRender() {
  if (frame || !active || !loaded || document.hidden || failed) return;
  frame = requestAnimationFrame(() => {
    frame = 0; if (!active || !loaded || document.hidden || failed) return;
    controls.update(); renderer.render(scene, camera); renders++;
    if (spinning) requestRender();
  });
}
function stop() { cancelAnimationFrame(frame); frame = 0; }
function size() {
  if (!renderer || !active || failed) return;
  const box = $('landmark-stage').getBoundingClientRect();
  if (!box.width || !box.height) return;
  renderer.setSize(Math.round(box.width), Math.round(box.height), false);
  camera.aspect = box.width / box.height; camera.updateProjectionMatrix();
  const halfFov = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
  const previousDistance = distance;
  distance = 7 / Math.sin(halfFov) * 1.13;
  if (loaded && previousDistance) camera.position.copy(controls.target).add(camera.position.clone().sub(controls.target).multiplyScalar(distance / previousDistance));
  controls.minDistance = 3; controls.maxDistance = distance * 3;
  requestRender();
}
function angle(phi, theta, radius = camera.position.distanceTo(controls.target)) {
  const damping = controls.enableDamping; controls.enableDamping = false; controls.update(); controls.enableDamping = damping;
  const spherical = new THREE.Spherical(radius, phi, theta).makeSafe();
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
  controls.update(); requestRender();
}
function preset(name) {
  if (!loaded || failed) return;
  view = name; controls.target.set(0, 5.6, 0);
  angle(name === 'top' ? 0.035 : name === 'front' ? Math.PI / 2 : 1.08, name === 'front' ? 0 : Math.PI / 4, distance);
  document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === name)));
}
function spin(value) {
  spinning = value; if (controls) controls.autoRotate = value;
  $('landmark-spin').setAttribute('aria-pressed', String(value));
  $('landmark-spin').textContent = value ? '暂停旋转' : '自动旋转'; requestRender();
}
function setWireframe(value) {
  wireframe = value;
  model?.traverse(object => {
    if (object.isMesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) { material.wireframe = value; material.needsUpdate = true; }
  }); requestRender();
}
function zoom(factor) {
  if (!loaded || failed) return;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(offset); controls.update(); requestRender();
}
function save(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function error(message) {
  failed = true; loaded = false; stop(); spin(false);
  $('landmark-stage').dataset.state = 'error'; $('landmark-retry').hidden = false;
  $('landmark-controls').querySelectorAll('button,input').forEach(element => { element.disabled = true; });
  status('三维展台暂时无法显示：' + message + '。可以重试，或回到城区比较继续使用。');
}
function dispose() {
  stop(); loaded = false;
  controls?.dispose();
  scene?.traverse(object => {
    if (object.isMesh) { object.geometry.dispose(); for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose(); }
  });
  environment?.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
  renderer = controls = scene = camera = model = environment = null;
}
async function init() {
  failed = false; $('landmark-retry').hidden = true; $('landmark-stage').dataset.state = 'loading'; status('正在准备三维模型…');
  const old = $('landmark-canvas'); canvas = old.cloneNode(false); old.replaceWith(canvas);
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); scene.background = new THREE.Color('#ecefe7');
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 180);
    controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.12;
    controls.maxPolarAngle = Math.PI / 2 - 0.015; controls.autoRotateSpeed = 0.7; controls.autoRotate = spinning;
    controls.addEventListener('change', requestRender); controls.addEventListener('start', () => { spin(false); });
    const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
    environment = pmrem.fromScene(room, 0.04).texture; scene.environment = environment; room.dispose(); pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdce8ff, 0xb5aa8e, 2.3));
    const sun = new THREE.DirectionalLight(0xffedcf, 4.5); sun.position.set(10, 22, 14); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = sun.shadow.camera.bottom = -11; sun.shadow.camera.right = sun.shadow.camera.top = 11;
    sun.shadow.camera.far = 60; sun.shadow.bias = -0.0005; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xe2edff, 2); fill.position.set(-13, 10, -9); scene.add(fill);
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 7.4, 0.16, 80), new THREE.MeshStandardMaterial({ color: '#e3e8db', roughness: 0.95 }));
    ground.position.y = -0.09; ground.receiveShadow = true; scene.add(ground);
    const gltf = await new GLTFLoader().parseAsync(await modelBytes(), ''); model = gltf.scene;
    const bounds = new THREE.Box3().setFromObject(model), dimensions = bounds.getSize(new THREE.Vector3());
    const scale = 12 / Math.max(dimensions.x, dimensions.y, dimensions.z);
    model.scale.multiplyScalar(scale); const scaled = new THREE.Box3().setFromObject(model), center = scaled.getCenter(new THREE.Vector3());
    model.position.sub(new THREE.Vector3(center.x, scaled.min.y, center.z));
    model.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } }); scene.add(model);
    setWireframe(wireframe); loaded = true; $('landmark-stage').dataset.state = 'ready';
    $('landmark-controls').querySelectorAll('button,input').forEach(element => { element.disabled = false; });
    status(`${data.triangles.toLocaleString('zh-CN')} 个三角面 · 模型已加载，可拖动旋转`);
    size(); preset('iso'); requestRender();
    canvas.addEventListener('webglcontextlost', event => { if (event.target !== canvas) return; event.preventDefault(); error('图形上下文已中断'); });
    canvas.addEventListener('keydown', event => {
      if (!loaded || failed) return;
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home', ' ']; if (!keys.includes(event.key)) return;
      event.preventDefault(); const wasSpinning = spinning; spin(false);
      const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if (event.key.startsWith('Arrow')) {
        const phi = THREE.MathUtils.clamp(spherical.phi + (event.key === 'ArrowUp' ? -0.12 : event.key === 'ArrowDown' ? 0.12 : 0), 0.03, Math.PI / 2 - 0.02);
        angle(phi, spherical.theta + (event.key === 'ArrowLeft' ? -0.16 : event.key === 'ArrowRight' ? 0.16 : 0));
      } else if (event.key === 'Home') preset('iso');
      else if (event.key === ' ') spin(!wasSpinning);
      else zoom(event.key === '-' ? 1.18 : 1 / 1.18);
    });
  } catch (failure) { error(failure.message || '浏览器未启用 WebGL 2'); }
}
function activate(value) {
  active = value;
  if (!value) { stop(); return; }
  if (!loading) loading = init();
  else if (loaded) { size(); requestRender(); }
}
document.querySelectorAll('[data-observation]').forEach(button => button.addEventListener('click', () => {
  const three = button.dataset.observation === 'landmark';
  $('landmark-showcase').hidden = !three; $('map-workspace').hidden = three; document.querySelector('.notes').hidden = three;
  document.querySelectorAll('[data-observation]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); activate(three);
}));
document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => { spin(false); preset(button.dataset.camera); }));
$('landmark-spin').addEventListener('click', () => spin(!spinning));
$('landmark-in').addEventListener('click', () => zoom(1 / 1.18)); $('landmark-out').addEventListener('click', () => zoom(1.18));
$('landmark-reset').addEventListener('click', () => { spin(false); $('landmark-wireframe').checked = false; setWireframe(false); preset('iso'); });
$('landmark-wireframe').addEventListener('change', event => setWireframe(event.target.checked));
$('landmark-retry').addEventListener('click', () => { dispose(); loading = init(); });
$('landmark-download').addEventListener('click', async () => {
  try { save(new Blob([await modelBytes()], { type: 'model/gltf-binary' }), 'eiffel-tower-SDC-CC-BY-4.0.glb'); }
  catch (failure) { status('模型下载失败：' + failure.message); }
});
$('landmark-export').addEventListener('click', () => {
  if (!loaded || failed) return;
  spin(false); renderer.render(scene, camera);
  const output = document.createElement('canvas'); output.width = 1600; output.height = 1200; const ctx = output.getContext('2d');
  ctx.fillStyle = '#f6f5ef'; ctx.fillRect(0, 0, 1600, 1200); ctx.fillStyle = '#253b34'; ctx.font = '34px sans-serif'; ctx.fillText('城市纹理 / 经典建筑 3D', 60, 65);
  ctx.font = '21px sans-serif'; ctx.fillText('埃菲尔铁塔 · 巴黎', 60, 104);
  const factor = Math.min(1480 / canvas.width, 900 / canvas.height), w = canvas.width * factor, h = canvas.height * factor;
  ctx.drawImage(canvas, (1600 - w) / 2, 125 + (900 - h) / 2, w, h);
  ctx.font = '16px sans-serif'; ctx.fillStyle = '#67766c'; ctx.fillText('模型：SDC · ( FREE ) La tour Eiffel · CC BY 4.0 · 已统一展示缩放，不用于测量。', 60, 1062);
  ctx.fillText(data.source, 60, 1096, 1480); ctx.fillText('https://sketchfab.com/3Duae · https://creativecommons.org/licenses/by/4.0/', 60, 1130);
  ctx.fillText('城市纹理 v0.7 · https://github.com/LouHC0814/city-texture', 60, 1164);
  output.toBlob(blob => { if (blob) save(blob, '城市纹理-埃菲尔铁塔3D.png'); }, 'image/png');
});
new ResizeObserver(() => { size(); }).observe($('landmark-stage'));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else requestRender(); });
window.addEventListener('pagehide', stop);
window.CityLandmarks = { getState: () => ({ active, loaded, failed, spinning, wireframe, view, renders,
  camera: camera?.position.toArray(), target: controls?.target.toArray(), triangles: data.triangles,
  contextLost: renderer?.getContext().isContextLost() ?? true }) };
