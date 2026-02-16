import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Scene, Entity, TransformComponent, MeshComponent, ColliderComponent } from "../engine/index.js";

const canvas = document.querySelector("#editor-canvas");
const hierarchy = document.querySelector("#hierarchy-list");
const inspector = document.querySelector("#inspector");
const sceneNameInput = document.querySelector("#scene-name");
const importInput = document.querySelector("#import-scene-file");
const voxelColorInput = document.querySelector("#voxel-color");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 300);
camera.position.set(6, 4, 10);

const scene = new Scene("VoxelScene");
const raycaster = new THREE.Raycaster();
const mouseCenter = new THREE.Vector2(0, 0);

let selectedId = null;
let pointerLocked = false;
const keys = new Set();
let yaw = 0;
let pitch = 0;

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize);
resize();

document.addEventListener("contextmenu", (event) => {
  if (pointerLocked && event.target === canvas) event.preventDefault();
});

function addGroundGrid() {
  const grid = new THREE.GridHelper(60, 60, 0x334155, 0x1e293b);
  scene.threeScene.add(grid);
}
addGroundGrid();

function getSelectedEntity() {
  return scene.entities.find((e) => e.id === selectedId) ?? null;
}

function colorToInt(hex) {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function gridKey(x, y, z) {
  return `${x},${y},${z}`;
}

function existingVoxelAt(x, y, z) {
  const key = gridKey(x, y, z);
  return scene.entities.find((entity) => entity.name === `Voxel_${key}`) ?? null;
}

function createVoxelEntity({ x, y, z, color = 0x7a2a2a }) {
  if (existingVoxelAt(x, y, z)) return null;

  const entity = new Entity({ name: `Voxel_${gridKey(x, y, z)}` });
  entity.removeComponent("TransformComponent");
  entity.addComponent(new TransformComponent({ position: [x, y, z] }));
  entity.addComponent(new MeshComponent({ geometry: "box", color }));
  entity.addComponent(new ColliderComponent({ size: [1, 1, 1] }));
  scene.addEntity(entity, null);
  return entity;
}

function createFloor() {
  if (scene.entities.some((entity) => entity.name === "Floor")) return;

  const floor = new Entity({ name: "Floor" });
  floor.removeComponent("TransformComponent");
  floor.addComponent(new TransformComponent({ position: [0, 0, 0], scale: [1, 1, 1] }));
  floor.addComponent(new MeshComponent({ geometry: "plane", color: 0x1b2430 }));
  floor.addComponent(new ColliderComponent({ size: [40, 0.2, 40], isTrigger: true }));
  scene.addEntity(floor, null);
}

function clearVoxels() {
  for (const entity of [...scene.entities]) {
    if (entity.name.startsWith("Voxel_")) {
      scene.removeEntity(entity.id, null);
    }
  }
  selectedId = scene.entities[0]?.id ?? null;
  rerenderPanels();
}

function worldMeshes() {
  const meshes = [];
  for (const entity of scene.entities) {
    const meshComp = entity.getComponent("MeshComponent");
    if (meshComp?.mesh) {
      meshComp.mesh.userData.entityId = entity.id;
      meshes.push(meshComp.mesh);
    }
  }
  return meshes;
}

function tryPlaceVoxel() {
  raycaster.setFromCamera(mouseCenter, camera);
  const hit = raycaster.intersectObjects(worldMeshes(), false)[0];

  if (!hit) {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const pos = camera.position.clone().add(direction.multiplyScalar(5));
    const gx = Math.round(pos.x);
    const gy = Math.max(0.5, Math.round(pos.y));
    const gz = Math.round(pos.z);
    const created = createVoxelEntity({ x: gx, y: gy, z: gz, color: colorToInt(voxelColorInput.value) });
    if (created) {
      selectedId = created.id;
      rerenderPanels();
    }
    return;
  }

  const point = hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.5));
  const gx = Math.round(point.x);
  const gy = Math.max(0.5, Math.round(point.y));
  const gz = Math.round(point.z);

  const created = createVoxelEntity({ x: gx, y: gy, z: gz, color: colorToInt(voxelColorInput.value) });
  if (created) {
    selectedId = created.id;
    rerenderPanels();
  }
}

function tryRemoveVoxel() {
  raycaster.setFromCamera(mouseCenter, camera);
  const hit = raycaster.intersectObjects(worldMeshes(), false)[0];
  if (!hit) return;

  const entityId = hit.object.userData.entityId;
  const entity = scene.entities.find((e) => e.id === entityId);
  if (!entity || !entity.name.startsWith("Voxel_")) return;

  scene.removeEntity(entity.id, null);
  selectedId = scene.entities[0]?.id ?? null;
  rerenderPanels();
}

function updateFlyControls(delta) {
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const velocity = new THREE.Vector3();

  if (keys.has("KeyW")) velocity.add(forward);
  if (keys.has("KeyS")) velocity.sub(forward);
  if (keys.has("KeyA")) velocity.sub(right);
  if (keys.has("KeyD")) velocity.add(right);
  if (keys.has("Space")) velocity.y += 1;
  if (keys.has("ControlLeft") || keys.has("ControlRight")) velocity.y -= 1;

  if (velocity.lengthSq() > 0) {
    velocity.normalize().multiplyScalar((keys.has("ShiftLeft") ? 11 : 6) * delta);
    camera.position.add(velocity);
  }

  camera.rotation.set(pitch, yaw, 0, "YXZ");
}

function rerenderHierarchy() {
  hierarchy.innerHTML = "";

  scene.entities.forEach((entity) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = entity.name;
    btn.className = selectedId === entity.id ? "active" : "";
    btn.addEventListener("click", () => {
      selectedId = entity.id;
      rerenderPanels();
    });
    li.append(btn);
    hierarchy.append(li);
  });
}

function numberField(labelText, value, onInput) {
  const row = document.createElement("label");
  row.className = "inspector-row";
  row.innerHTML = `<span>${labelText}</span>`;
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  input.value = value;
  input.addEventListener("input", () => onInput(Number(input.value)));
  row.append(input);
  return row;
}

function rerenderInspector() {
  inspector.innerHTML = "";
  const entity = getSelectedEntity();
  if (!entity) {
    inspector.textContent = "No entity selected.";
    return;
  }

  const nameRow = document.createElement("label");
  nameRow.className = "inspector-row";
  nameRow.innerHTML = "<span>Name</span>";
  const nameInput = document.createElement("input");
  nameInput.value = entity.name;
  nameInput.addEventListener("input", () => {
    entity.name = nameInput.value;
    rerenderHierarchy();
  });
  nameRow.append(nameInput);
  inspector.append(nameRow);

  const t = entity.transform;
  const fields = [
    ["Pos X", () => t.position[0], (v) => (t.position[0] = v)],
    ["Pos Y", () => t.position[1], (v) => (t.position[1] = v)],
    ["Pos Z", () => t.position[2], (v) => (t.position[2] = v)],
    ["Rot X", () => t.rotation[0], (v) => (t.rotation[0] = v)],
    ["Rot Y", () => t.rotation[1], (v) => (t.rotation[1] = v)],
    ["Rot Z", () => t.rotation[2], (v) => (t.rotation[2] = v)],
    ["Scale X", () => t.scale[0], (v) => (t.scale[0] = v)],
    ["Scale Y", () => t.scale[1], (v) => (t.scale[1] = v)],
    ["Scale Z", () => t.scale[2], (v) => (t.scale[2] = v)],
  ];

  fields.forEach(([label, getter, setter]) => {
    inspector.append(numberField(label, getter(), setter));
  });
}

function rerenderPanels() {
  sceneNameInput.value = scene.name;
  rerenderHierarchy();
  rerenderInspector();
}

function exportScene() {
  scene.name = sceneNameInput.value || "Scene";
  const json = JSON.stringify(scene.toJSON(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${scene.name.replace(/\s+/g, "_")}.scene.json`;
  a.click();
  URL.revokeObjectURL(a.href);

  document.querySelector("#scene-json").value = json;
}

async function importScene() {
  const file = importInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  scene.loadFromJSON(JSON.parse(text), null);
  selectedId = scene.entities[0]?.id ?? null;
  rerenderPanels();
}

sceneNameInput.addEventListener("input", () => {
  scene.name = sceneNameInput.value;
});

document.querySelector("#export-scene").addEventListener("click", exportScene);
document.querySelector("#import-scene").addEventListener("click", importScene);
document.querySelector("#add-floor").addEventListener("click", () => {
  createFloor();
  rerenderPanels();
});
document.querySelector("#clear-voxels").addEventListener("click", clearVoxels);

document.querySelector("#toggle-build").addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === canvas;
  document.querySelector("#toggle-build").textContent = pointerLocked
    ? "Build Controls Active"
    : "Enter Build Controls";
});

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

window.addEventListener("mousemove", (event) => {
  if (!pointerLocked) return;
  yaw -= event.movementX * 0.0025;
  pitch -= event.movementY * 0.0025;
  pitch = Math.max(-1.55, Math.min(1.55, pitch));
});

window.addEventListener("mousedown", (event) => {
  if (!pointerLocked || event.target !== canvas) return;
  if (event.button === 0) {
    tryPlaceVoxel();
  }
  if (event.button === 2) {
    tryRemoveVoxel();
  }
});

function frame() {
  updateFlyControls(1 / 60);
  scene.update(1 / 60, null);
  renderer.render(scene.threeScene, camera);
  requestAnimationFrame(frame);
}

createFloor();
selectedId = scene.entities[0]?.id ?? null;
rerenderPanels();
frame();
