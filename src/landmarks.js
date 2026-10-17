import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = id => document.getElementById(id);
const data = window.CityLandmarkData;
// 视角保存/打开校验与序列化在 dist/view.js 中独立实现；本模块仅通过 window 引用。
const V = window.CityView;
const MODEL_ID = 'eiffel-tower';
const PRESET_NAMES = { iso: '立体视角', front: '正面', top: '俯视', custom: '自定义视角' };
let active = false, loading = null, loaded = false, failed = false, spinning = false, frame = 0, renders = 0;
let renderer, scene, camera, controls, model, environment, canvas, distance = 24, view = 'iso', wireframe = false;
// 模型包围球半径（按放大后尺寸与居中后位置计算），用于运行时核对视角是否合理。
let modelExtent = 0;
// applyView() 设 true 后让 size() 跳过这次缩放，避免在恢复后被 OrbitControls 静默截断。
let viewJustApplied = false;
// 视角文件保存的距离上限：跨视口恢复时（例如移动端保存→桌面端打开），savedDistance 可能超过
// 当前 size() 算出的 maxDistance；OrbitControls.update() 每帧都会把 spherical.radius 钳制到
// [minDistance, maxDistance]，必须把 maxDistance 永久撑大，否则下一帧就把相机位置静默截回。
let rememberedMaxDistance = 0;
// 视角文件保存的远裁剪面上限，与 dist/view.js 中 `checkNumber('far', view.far, view.near + 0.1, 10000)`
// 保持一致：fitProjection 拉大 far 时不超过 10000，保证新保存的文件可以被同一套校验再次接受。
const FAR_LIMIT = 10000;
// 投影保护：让远裁剪面始终覆盖「当前相机到目标距离 + 模型包围 + 1 单位余量」，
// 并把 controls.maxDistance 收紧到「能完整看到模型的距离」，避免按钮 / 滚轮 / 双指 / 键盘 +/-
// 以及窗口变化后续缩小把模型越过远裁剪面。fitProjection 由 controls 'change' 监听统一触发，
// 覆盖所有缩放入口；保存端的 captureView 也走同一条规则，保证应用保存-打开往返一致。
function fitProjection(distanceFromCamera) {
  if (!loaded || !camera || !controls || failed || !modelExtent) return;
  const current = Number.isFinite(distanceFromCamera) ? distanceFromCamera : camera.position.distanceTo(controls.target);
  const required = current + modelExtent + 1;
  if (camera.far < required) {
    camera.far = Math.min(FAR_LIMIT, Math.max(camera.far, required));
    camera.updateProjectionMatrix();
  }
  const ceiling = Math.max(controls.minDistance + 0.5, Math.min(camera.far - modelExtent, FAR_LIMIT - modelExtent));
  if (controls.maxDistance > ceiling) controls.maxDistance = ceiling;
}
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
  if (loaded && previousDistance && !viewJustApplied) {
    const offset = camera.position.clone().sub(controls.target).multiplyScalar(distance / previousDistance);
    camera.position.copy(controls.target).add(offset);
  }
  viewJustApplied = false;
  // 若视角文件保存的距离比当前视口的最大距离大，则必须撑大 maxDistance。
  // 否则下一次 OrbitControls.update() 会把 spherical.radius 静默截回。
  controls.minDistance = 3; controls.maxDistance = Math.max(distance * 3, rememberedMaxDistance * 1.01);
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
  // 用户主动切换预设，把视角文件留下的 viewJustApplied 清掉，让后续拖动能再次标记为 custom。
  // 同时把极角上下限恢复到正常范围（applyView 期间已临时放宽），避免用户绕过默认视角。
  viewJustApplied = false;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2 - 0.015;
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
    controls.addEventListener('change', () => { fitProjection(); requestRender(); });
    controls.addEventListener('start', () => { spin(false); });
    // 用户拖动/平移/双指缩放结束后，相机不再匹配任何预设：标记为 custom 防止预览误称。
    // 视角文件刚应用后也可能触到 end，需要先把 viewJustApplied 清掉再标 custom，避免「打开视角后直接拖动
    // 预设仍停留在旧值」的情况。
    controls.addEventListener('end', () => {
      if (viewJustApplied) viewJustApplied = false;
      view = 'custom';
      document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view)));
    });
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
    // 重新计算一次包围盒以匹配最终位置；用半对角线作为模型包围球半径。
    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    modelExtent = Math.sqrt((finalSize.x * finalSize.x + finalSize.y * finalSize.y + finalSize.z * finalSize.z)) / 2;
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
        // 方向键、+/- 调整后已偏离最近一次预设；标记为 custom 防止预览误称。
        view = 'custom';
        document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view)));
      } else if (event.key === 'Home') preset('iso');
      else if (event.key === ' ') spin(!wasSpinning);
      else { zoom(event.key === '-' ? 1.18 : 1 / 1.18);
        view = 'custom';
        document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view)));
      }
    });
  } catch (failure) { error(failure.message || '浏览器未启用 WebGL 2'); }
}
function activate(value) {
  active = value;
  if (!value) { stop(); return; }
  if (!loading) loading = init();
  else if (loaded) { size(); requestRender(); }
}
function captureView() {
  if (!loaded || !camera || !controls || failed) throw new Error('模型未就绪，无法保存视角');
  const viewDistance = camera.position.distanceTo(controls.target);
  // 保存与打开走同一条规则：远裁剪面必须留出模型包围空间，否则文件级校验会拒绝，造成往返失败。
  if (modelExtent > 0 && camera.far < viewDistance + modelExtent) {
    throw new Error(`当前远裁剪面（${camera.far}）小于相机距离与模型包围球半径之和 ${(viewDistance + modelExtent).toFixed(2)}，请调整视角或等待投影保护同步后再保存`);
  }
  const value = V.createView(MODEL_ID, {
    view,
    camera: camera.position.toArray(),
    target: controls.target.toArray(),
    fov: camera.fov,
    near: camera.near,
    far: camera.far
  }, wireframe);
  return JSON.stringify(value, null, 2);
}
function describeView(result) {
  const preset = PRESET_NAMES[result.view.view] || '自定义视角';
  const distance = result.view.distance.toFixed(2);
  return `${preset} · 距离 ${distance} · FOV ${result.view.fov.toFixed(1)}° · ${result.wireframe ? '线框模式' : '实体模式'}`;
}
function applyView(result) {
  if (!loaded || failed) throw new Error('模型未就绪，无法打开视角');
  // 运行时核对：远裁剪面必须留出模型包围空间。
  // 合法文件保存的相机/目标/FOV/near/far 全部原样恢复，自动调整投影只用于后续缩放，
  // 不会在打开瞬间悄悄改参数。最小距离由 OrbitControls.minDistance 限制，不必再硬性下限。
  const fileDistance = result.view.distance;
  if (result.view.far < fileDistance + modelExtent) throw new Error(`视角远裁剪面（${result.view.far}）过小，需要至少 ${(fileDistance + modelExtent).toFixed(2)} 才能看到完整模型`);
  // 1. 关闭自动旋转；2. 暂时禁用阻尼并 update() 以清空 OrbitControls 残留的旋转/平移增量。
  spin(false);
  const previousDamping = controls.enableDamping;
  controls.enableDamping = false; controls.update(); controls.enableDamping = previousDamping;
  // 3. 临时放宽 OrbitControls 的缩放上下限与极角上下限，避免 update() 把保存位置
  //    截到当前视口的最大/最小距离或最大俯仰角度（极角钳位会调整 theta 让相机绕回）。
  const previousMin = controls.minDistance;
  const previousMinPolar = controls.minPolarAngle;
  const previousMaxPolar = controls.maxPolarAngle;
  controls.minDistance = 0;
  controls.maxDistance = Math.max(rememberedMaxDistance, fileDistance) * 1.01;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  camera.position.set(result.view.camera[0], result.view.camera[1], result.view.camera[2]);
  controls.target.set(result.view.target[0], result.view.target[1], result.view.target[2]);
  camera.fov = result.view.fov; camera.near = result.view.near; camera.far = result.view.far;
  camera.updateProjectionMatrix(); controls.update();
  // 4. 恢复缩放下限；记住本次距离用于跨视口恢复，但 maxDistance 由 controls.change 监听到的
  //    fitProjection() 收紧到「camera.far - modelExtent」以内，避免后续 +/- 把模型裁出远裁剪面。
  //    极角上下限都必须永久放宽以保留保存位置：OrbitControls.update() 每帧把 spherical.radius
  //    与 spherical.phi 钳到 [minDistance, maxDistance] 和 [minPolarAngle, maxPolarAngle]，
  //    恢复原限制会让保存的真实角度（恰好落在边界的 '正面' 视角）被自动旋转回去。
  //    允许用户拖动经过极点换来保存视角逐帧稳定，是合理的取舍。
  controls.minDistance = previousMin;
  rememberedMaxDistance = Math.max(rememberedMaxDistance, fileDistance);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  viewJustApplied = true;
  view = result.view.view;
  document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view)));
  setWireframe(result.wireframe); $('landmark-wireframe').checked = result.wireframe;
  requestRender();
}
const viewDialog = $('landmark-view-dialog');
let viewGeneration = 0, viewStage = null;
function clearViewPreview() { viewStage = null; $('apply-view-file').disabled = true; $('view-file-preview').textContent = ''; }
$('save-view').addEventListener('click', () => {
  if (!loaded || failed) { status('模型未就绪，无法保存视角'); return; }
  try {
    const json = captureView();
    save(new Blob([json], { type: 'application/json' }), '城市纹理-三维视角.json');
    status('视角已下载为 城市纹理-三维视角.json。请在同版本预览中点“打开三维视角”恢复。');
  } catch (failure) { status('保存视角失败：' + failure.message); }
});
$('open-view').addEventListener('click', () => {
  if (!loaded || failed) { status('请先准备好模型，再打开视角文件'); return; }
  viewGeneration++; clearViewPreview(); $('view-file-error').textContent = ''; $('view-file').value = '';
  viewDialog.showModal();
});
$('close-view-dialog').addEventListener('click', () => viewDialog.close());
viewDialog.addEventListener('close', () => { viewGeneration++; clearViewPreview(); });
$('view-file').addEventListener('change', async () => {
  const generation = ++viewGeneration, file = $('view-file').files[0]; clearViewPreview(); $('view-file-error').textContent = '';
  if (!file) return;
  $('view-file-preview').textContent = '正在检查视角文件…';
  try {
    if (file.size > V.MAX_BYTES) throw new Error(`视角文件不能超过 ${V.MAX_BYTES} 字节`);
    const input = await file.text(); if (generation !== viewGeneration) return;
    const result = V.parseView(input);
    if (result.modelId !== MODEL_ID) throw new Error('视角对应的模型与当前展台不一致');
    // 运行时核对：远裁剪面不足会让模型被裁；文件级校验后用真实模型包围球再校一次。
    // 最小距离交由 OrbitControls.minDistance 限制，不在这里再加额外下限，避免合法近距离视角被拒。
    if (modelExtent > 0 && result.view.far < result.view.distance + modelExtent) throw new Error(`视角远裁剪面（${result.view.far}）过小，需要至少 ${(result.view.distance + modelExtent).toFixed(2)} 才能显示完整模型`);
    viewStage = result;
    $('view-file-preview').textContent = describeView(result);
    $('apply-view-file').disabled = false;
  } catch (failure) { if (generation === viewGeneration) { clearViewPreview(); $('view-file-error').textContent = failure.message; } }
});
$('view-file-form').addEventListener('submit', event => {
  event.preventDefault(); if (!viewStage) return;
  try { applyView(viewStage); viewDialog.close(); status('已打开三维视角，恢复预设、距离、缩放和线框。'); }
  catch (failure) { $('view-file-error').textContent = failure.message; }
});
document.querySelectorAll('[data-observation]').forEach(button => button.addEventListener('click', () => {
  const three = button.dataset.observation === 'landmark';
  $('landmark-showcase').hidden = !three; $('map-workspace').hidden = three; document.querySelector('.notes').hidden = three;
  document.querySelectorAll('[data-observation]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); activate(three);
}));
document.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => { spin(false); preset(button.dataset.camera); }));
$('landmark-spin').addEventListener('click', () => spin(!spinning));
$('landmark-in').addEventListener('click', () => { zoom(1 / 1.18); view = 'custom'; document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view))); });
$('landmark-out').addEventListener('click', () => { zoom(1.18); view = 'custom'; document.querySelectorAll('[data-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view))); });
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
  visible: !document.hidden, controlState: controls?.state, pendingFrame: Boolean(frame),
  camera: camera?.position.toArray(), target: controls?.target.toArray(), triangles: data.triangles,
  // 三维投影相关字段：测试可以直接断言「距离 + modelExtent ≤ far」和「maxDistance ≤ far - modelExtent」，
  // 不必经过间接几何计算；同时与 fitProjection() 单一数据源保持一致。
  fov: camera?.fov, near: camera?.near, far: camera?.far,
  modelExtent, maxDistance: controls?.maxDistance,
  contextLost: renderer?.getContext().isContextLost() ?? true }) };
