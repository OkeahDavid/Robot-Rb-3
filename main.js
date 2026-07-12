import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import GUI from 'lil-gui';

// ---------------------------------------------------------------------------
// Renderer / scene / camera
// ---------------------------------------------------------------------------
const container = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);
scene.fog = new THREE.Fog(0x0b0e14, 14, 34);

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(10, 6.5, 11.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minDistance = 4;
controls.maxDistance = 24;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------------------------------------------------------------------------
// Post-processing (bloom)
// ---------------------------------------------------------------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.5, 0.7
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------------------
// Lights
// ---------------------------------------------------------------------------
const keyLight = new THREE.DirectionalLight(0xfff2e0, 2.6);
keyLight.position.set(6, 10, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.camera.far = 30;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x4d7cff, 1.2);
rimLight.position.set(-7, 4, -6);
scene.add(rimLight);

scene.add(new THREE.HemisphereLight(0x8899bb, 0x181a20, 0.55));

// ---------------------------------------------------------------------------
// Floor
// ---------------------------------------------------------------------------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(16, 64),
  new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.85, metalness: 0.25 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(32, 64, 0x2a3242, 0x1a2030);
grid.position.y = 0.002;
scene.add(grid);

// Warning ring painted around the work envelope
const ring = new THREE.Mesh(
  new THREE.RingGeometry(4.6, 4.8, 96),
  new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.004;
scene.add(ring);

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
const MAT = {
  orange: new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.35, metalness: 0.55 }),
  dark:   new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.5,  metalness: 0.7 }),
  steel:  new THREE.MeshStandardMaterial({ color: 0x9aa2ad, roughness: 0.3,  metalness: 0.9 }),
  accent: new THREE.MeshStandardMaterial({ color: 0x30d17c, roughness: 0.4,  metalness: 0.3, emissive: 0x0a3d22 }),
  crate:  new THREE.MeshStandardMaterial({ color: 0x4d7cff, roughness: 0.45, metalness: 0.35 }),
};

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// Robot — hierarchy of joint groups. Each segment extends along local +Y,
// pitch joints rotate about local Z, the base yaw rotates about Y.
// Proportions follow the original glaux model: base box -> column cylinder ->
// shoulder box -> twin-link arm -> elbow cylinder -> forearm box -> wrist ->
// cone end effector.
// ---------------------------------------------------------------------------
const robot = new THREE.Group();
scene.add(robot);

// Static pedestal
const basePlate = mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.18, 48), MAT.dark);
basePlate.position.y = 0.09;
robot.add(basePlate);

const baseBox = mesh(new THREE.BoxGeometry(2.3, 0.65, 1.7), MAT.orange);
baseBox.position.y = 0.18 + 0.325;
robot.add(baseBox);

// Joint 1 — base yaw
const yawJoint = new THREE.Group();
yawJoint.position.y = 0.83;
robot.add(yawJoint);

const turret = mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.85, 40), MAT.steel);
turret.position.y = 0.425;
yawJoint.add(turret);

const turretCap = mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 40), MAT.dark);
turretCap.position.y = 0.9;
yawJoint.add(turretCap);

// Joint 2 — shoulder pitch
const shoulderJoint = new THREE.Group();
shoulderJoint.position.y = 1.05;
yawJoint.add(shoulderJoint);

const shoulderHub = mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.15, 32), MAT.dark);
shoulderHub.rotation.x = Math.PI / 2;
shoulderJoint.add(shoulderHub);

// Twin parallel links (homage to the two auxWireCylinder arms in the original)
const L1 = 2.0; // upper arm length
for (const z of [-0.42, 0.42]) {
  const link = mesh(new THREE.BoxGeometry(0.34, L1, 0.2), MAT.orange);
  link.position.set(0, L1 / 2, z);
  shoulderJoint.add(link);
}
const brace = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.84, 20), MAT.steel);
brace.rotation.x = Math.PI / 2;
brace.position.y = L1 * 0.55;
shoulderJoint.add(brace);

// Joint 3 — elbow pitch
const elbowJoint = new THREE.Group();
elbowJoint.position.y = L1;
shoulderJoint.add(elbowJoint);

const elbowHub = mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.1, 32), MAT.dark);
elbowHub.rotation.x = Math.PI / 2;
elbowJoint.add(elbowHub);

const L2 = 1.7; // forearm length
const forearm = mesh(new THREE.BoxGeometry(0.44, L2, 0.5), MAT.orange);
forearm.position.y = L2 / 2;
elbowJoint.add(forearm);

const forearmStripe = mesh(new THREE.BoxGeometry(0.46, 0.18, 0.52), MAT.dark);
forearmStripe.position.y = L2 * 0.6;
elbowJoint.add(forearmStripe);

// Joint 4 — wrist pitch
const wristJoint = new THREE.Group();
wristJoint.position.y = L2;
elbowJoint.add(wristJoint);

const wristHub = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.62, 24), MAT.steel);
wristHub.rotation.x = Math.PI / 2;
wristJoint.add(wristHub);

// Joint 5 — tool roll + cone end effector (the original's auxWireCone)
const toolJoint = new THREE.Group();
wristJoint.add(toolJoint);

const toolCollar = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 24), MAT.dark);
toolCollar.position.y = 0.25;
toolJoint.add(toolCollar);

const cone = mesh(new THREE.ConeGeometry(0.34, 0.75, 32), MAT.accent);
cone.position.y = 0.75;
toolJoint.add(cone);

const TOOL_LEN = 1.15; // wrist center to tool tip
const tip = new THREE.Object3D();
tip.position.y = TOOL_LEN;
toolJoint.add(tip);

const tipGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.06, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x7dffb5 })
);
tipGlow.position.copy(tip.position);
toolJoint.add(tipGlow);

const SHOULDER_Y = 0.83 + 1.05; // world height of the shoulder pivot

// ---------------------------------------------------------------------------
// Pick & place props — two pallets and a crate the arm ferries between them
// ---------------------------------------------------------------------------
const PALLET_R = 3.2;
const PALLET_ANGLES = [40, -40]; // degrees around the base
const pallets = PALLET_ANGLES.map((deg) => {
  const a = deg * Math.PI / 180;
  const g = new THREE.Group();
  g.position.set(Math.cos(a) * PALLET_R, 0, Math.sin(a) * PALLET_R);
  const base = mesh(new THREE.BoxGeometry(1.15, 0.12, 1.15), MAT.dark);
  base.position.y = 0.06;
  g.add(base);
  const plate = mesh(new THREE.BoxGeometry(1.25, 0.03, 1.25), MAT.orange);
  plate.position.y = 0.135;
  g.add(plate);
  scene.add(g);
  return g;
});

const CRATE = 0.55;
const PALLET_TOP = 0.15;
const CRATE_REST_Y = PALLET_TOP + CRATE / 2;
const CRATE_TOP_Y = PALLET_TOP + CRATE;   // tip height when gripping
const HOVER_Y = CRATE_TOP_Y + 0.9;        // tip height when travelling

const crate = mesh(new THREE.BoxGeometry(CRATE, CRATE, CRATE), MAT.crate);
scene.add(crate);
let pickIdx = 0;   // pallet the crate currently sits on
let carrying = false;

function restCrate(idx) {
  scene.attach(crate);
  crate.position.set(pallets[idx].position.x, CRATE_REST_Y, pallets[idx].position.z);
  crate.rotation.set(0, 0, 0);
  carrying = false;
}
restCrate(pickIdx);

// ---------------------------------------------------------------------------
// Inverse kinematics — closed-form 2-link solver in the yaw plane, tool
// pointing straight down. Returns joint angles in degrees.
// ---------------------------------------------------------------------------
const DEG = Math.PI / 180;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function ikPose(tx, tipY, tz) {
  const R = Math.hypot(tx, tz);
  const yaw = Math.atan2(-tz, tx);
  const V = (tipY + TOOL_LEN) - SHOULDER_Y; // wrist height relative to shoulder
  const d = clamp(Math.hypot(R, V), 0.6, L1 + L2 - 0.02);
  const gamma = Math.atan2(R, V);
  const delta = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const k = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const aS = gamma - delta;      // upper arm from vertical (elbow-up solution)
  const aE = Math.PI - k;        // elbow bend
  const aW = Math.PI - aS - aE;  // keeps the tool vertical
  return {
    baseYaw: yaw / DEG,
    shoulder: -aS / DEG,
    elbow: -aE / DEG,
    wrist: -aW / DEG,
    toolRoll: 0,
  };
}

// ---------------------------------------------------------------------------
// Pick & place task — joint-space waypoints with eased interpolation
// ---------------------------------------------------------------------------
const JOINT_KEYS = ['baseYaw', 'shoulder', 'elbow', 'wrist', 'toolRoll'];
const task = { segs: [], i: 0, t: 0, from: null };

function palletTip(idx, y) {
  const p = pallets[idx].position;
  return ikPose(p.x, y, p.z);
}

function buildCycle() {
  const P = pickIdx, Q = 1 - pickIdx;
  task.segs = [
    { pose: palletTip(P, HOVER_Y), dur: 1.6 },
    { pose: palletTip(P, CRATE_TOP_Y), dur: 1.0, onArrive: grab },
    { pose: palletTip(P, CRATE_TOP_Y), dur: 0.35 },
    { pose: palletTip(P, HOVER_Y), dur: 0.9 },
    { pose: palletTip(Q, HOVER_Y), dur: 1.8 },
    { pose: palletTip(Q, CRATE_TOP_Y), dur: 1.0, onArrive: release },
    { pose: palletTip(Q, CRATE_TOP_Y), dur: 0.35 },
    { pose: palletTip(Q, HOVER_Y), dur: 0.9, onArrive: () => { pickIdx = Q; buildCycle(); } },
  ];
  task.i = 0;
  task.t = 0;
  task.from = null;
}

function grab() {
  toolJoint.attach(crate);
  carrying = true;
}

function release() {
  restCrate(1 - pickIdx);
}

function resetTask() {
  restCrate(pickIdx);
  buildCycle();
}

const ease = (u) => u * u * (3 - 2 * u);

function stepTask(dt) {
  if (task.i >= task.segs.length) return;
  const seg = task.segs[task.i];
  if (!task.from) task.from = JOINT_KEYS.reduce((o, k) => (o[k] = params[k], o), {});
  task.t += dt;
  const u = ease(clamp(task.t / seg.dur, 0, 1));
  for (const k of JOINT_KEYS) {
    params[k] = task.from[k] + (seg.pose[k] - task.from[k]) * u;
  }
  if (task.t >= seg.dur) {
    for (const k of JOINT_KEYS) params[k] = seg.pose[k];
    if (seg.onArrive) seg.onArrive();
    task.i++;
    task.t = 0;
    task.from = null;
  }
}

// ---------------------------------------------------------------------------
// Tool-tip trail
// ---------------------------------------------------------------------------
const TRAIL_MAX = 400;
const trailPositions = new Float32Array(TRAIL_MAX * 3);
const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
trailGeo.setDrawRange(0, 0);
const trail = new THREE.Line(
  trailGeo,
  new THREE.LineBasicMaterial({ color: 0x5ad18c, transparent: true, opacity: 0.7 })
);
trail.frustumCulled = false;
scene.add(trail);
let trailCount = 0;

const tipWorld = new THREE.Vector3();
function pushTrailPoint() {
  tip.getWorldPosition(tipWorld);
  if (trailCount < TRAIL_MAX) {
    trailPositions.set([tipWorld.x, tipWorld.y, tipWorld.z], trailCount * 3);
    trailCount++;
  } else {
    trailPositions.copyWithin(0, 3);
    trailPositions.set([tipWorld.x, tipWorld.y, tipWorld.z], (TRAIL_MAX - 1) * 3);
  }
  trailGeo.setDrawRange(0, trailCount);
  trailGeo.attributes.position.needsUpdate = true;
}

function clearTrail() {
  trailCount = 0;
  trailGeo.setDrawRange(0, 0);
}

// ---------------------------------------------------------------------------
// State + GUI
// ---------------------------------------------------------------------------
const MODES = ['pick & place', 'free cycle', 'manual'];

const params = {
  baseYaw: 0,
  shoulder: -28,
  elbow: 62,
  wrist: 45,
  toolRoll: 0,
  mode: 'pick & place',
  speed: 1.0,
  trail: true,
  bloom: true,
  wireframe: false,
  autoOrbit: false,
  resetPose() {
    Object.assign(params, { baseYaw: 0, shoulder: -28, elbow: 62, wrist: 45, toolRoll: 0 });
    setMode('manual');
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
    clearTrail();
  },
};

function setMode(m) {
  if (params.mode === 'pick & place' && m !== 'pick & place') restCrate(pickIdx);
  params.mode = m;
  if (m === 'pick & place') resetTask();
  clearTrail();
}

const gui = new GUI({ title: 'RB-3 CONTROL' });
const jointFolder = gui.addFolder('Joints (deg)');
const joints = [
  jointFolder.add(params, 'baseYaw', -180, 180, 1).name('J1 base yaw'),
  jointFolder.add(params, 'shoulder', -100, 100, 1).name('J2 shoulder'),
  jointFolder.add(params, 'elbow', -135, 135, 1).name('J3 elbow'),
  jointFolder.add(params, 'wrist', -120, 120, 1).name('J4 wrist'),
  jointFolder.add(params, 'toolRoll', -180, 180, 1).name('J5 tool roll'),
];
joints.forEach((c) => c.onChange(() => {
  if (params.mode !== 'manual') { setMode('manual'); modeCtrl.updateDisplay(); }
}));

const motionFolder = gui.addFolder('Motion');
const modeCtrl = motionFolder.add(params, 'mode', MODES).name('mode').onChange((m) => setMode(m));
motionFolder.add(params, 'speed', 0.2, 3, 0.1).name('speed');
motionFolder.add(params, 'resetPose').name('reset pose');

const viewFolder = gui.addFolder('View');
viewFolder.add(params, 'trail').name('tool trail').onChange((v) => { if (!v) clearTrail(); trail.visible = v; });
viewFolder.add(params, 'bloom').name('bloom');
viewFolder.add(params, 'wireframe').name('wireframe (1998 mode)').onChange((v) => {
  Object.values(MAT).forEach((m) => (m.wireframe = v));
});
viewFolder.add(params, 'autoOrbit').name('orbit camera');

if (window.innerWidth < 700) gui.close();

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
let t = 0;

const readout = document.getElementById('readout');

function applyPose() {
  yawJoint.rotation.y = params.baseYaw * DEG;
  shoulderJoint.rotation.z = params.shoulder * DEG;
  elbowJoint.rotation.z = params.elbow * DEG;
  wristJoint.rotation.z = params.wrist * DEG;
  toolJoint.rotation.y = params.toolRoll * DEG;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  const animating = params.mode !== 'manual';

  if (params.mode === 'free cycle') {
    t += dt * params.speed;
    const r = (x) => Math.round(x * 10) / 10;
    params.baseYaw = r(Math.sin(t * 0.35) * 70);
    params.shoulder = r(-30 + Math.sin(t * 0.8) * 22);
    params.elbow = r(60 + Math.sin(t * 0.6 + 1.3) * 35);
    params.wrist = r(40 + Math.sin(t * 1.1 + 0.6) * 30);
    params.toolRoll = r((t * 40) % 360 - 180);
  } else if (params.mode === 'pick & place') {
    stepTask(dt * params.speed);
  }
  if (animating) joints.forEach((c) => c.updateDisplay());

  applyPose();

  if (params.trail && animating) pushTrailPoint();
  if (params.autoOrbit) {
    const a = clock.elapsedTime * 0.12;
    camera.position.x = Math.sin(a) * 13;
    camera.position.z = Math.cos(a) * 13;
  }

  controls.update();
  if (params.bloom) composer.render();
  else renderer.render(scene, camera);

  tip.getWorldPosition(tipWorld);
  readout.textContent =
    `J1 ${params.baseYaw.toFixed(0).padStart(4)}°  ` +
    `J2 ${params.shoulder.toFixed(0).padStart(4)}°  ` +
    `J3 ${params.elbow.toFixed(0).padStart(4)}°  ` +
    `J4 ${params.wrist.toFixed(0).padStart(4)}°\n` +
    `TCP  x ${tipWorld.x.toFixed(2)}  y ${tipWorld.y.toFixed(2)}  z ${tipWorld.z.toFixed(2)}` +
    (carrying ? '   [CARRYING]' : '');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

buildCycle();
applyPose();
animate();
