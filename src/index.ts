import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMSchema } from '@pixiv/three-vrm';

import * as CONFIG from './config.json';

const _v3A = new THREE.Vector3();

// == renderer =====================================================================================
const renderer = new THREE.WebGLRenderer();
renderer.setSize(CONFIG.width, CONFIG.height);
document.body.appendChild(renderer.domElement);

// == camera =======================================================================================
const camera = new THREE.PerspectiveCamera(
  CONFIG.perspective.fov,
  CONFIG.width / CONFIG.height,
  CONFIG.perspective.near,
  CONFIG.perspective.far
);

// == scene ========================================================================================
const scene = new THREE.Scene();

// == light ========================================================================================
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// == gltf =========================================================================================
async function loadGLTF(url: string): Promise<GLTF> {
  const loader = new GLTFLoader();
  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => { resolve(gltf); },
      undefined,
      (err) => { reject(err); }
    )
  });
}

// == vrm ==========================================================================================
async function loadVRM(gltf: GLTF): Promise<VRM> {
  return await VRM.from(gltf);
}

// == init =========================================================================================
let currentVrm: VRM | undefined;
async function init(url: string): Promise<void> {
  const gltf = await loadGLTF(url);
  const vrm = await loadVRM(gltf);
  scene.add(vrm.scene);
  currentVrm = vrm;

  const humanoid = vrm.humanoid;
  if (!humanoid) { console.error('Given VRM has no humanoid!'); return; }

  const hips = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips);
  if (!hips) { console.error('Given VRM has no hips!'); return; }
  const head = humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head);
  if (!head) { console.error('Given VRM has no head!'); return; }

  camera.position.set(
    0.0,
    head.getWorldPosition(_v3A).y,
    CONFIG.cameraZ
  );
}

// == update =======================================================================================
const clock = new THREE.Clock();
clock.start();

function update() {
  requestAnimationFrame(update);

  const delta = clock.getDelta();

  if (currentVrm) {
    const hips = currentVrm.humanoid!.getBoneNode(VRMSchema.HumanoidBoneName.Hips)!;
    hips.rotation.y += delta;

    currentVrm.update(delta);
  }

  renderer.render(scene, camera);
}
update();

// == dnd ==========================================================================================
renderer.domElement.addEventListener('dragover', ( event ) => {
  event.preventDefault();
});

renderer.domElement.addEventListener('drop', ( event ) => {
  event.preventDefault();

  // read given file then convert it to blob url
  const files = event.dataTransfer!.files;
  if (!files) return;

  const file = files[0];
  if (!file) return;

  const blob = new Blob([file], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  init(url);
});
