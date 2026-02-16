import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Scene } from "../engine/Scene.js";
import { Entity } from "../engine/Entity.js";
import { MeshComponent } from "../engine/components/MeshComponent.js";

const canvas = document.querySelector("#editor-canvas");
const hierarchy = document.querySelector("#hierarchy");
const inspector = document.querySelector("#inspector");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const viewScene = new THREE.Scene();
viewScene.background = new THREE.Color(0x090b0f);
viewScene.fog = new THREE.Fog(0x090b0f, 15, 90);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 300);
camera.position.set(8, 8, 8);
camera.lookAt(0, 0, 0);

const grid = new THREE.GridHelper(40, 40, 0x667788, 0x223344);
viewScene.add(grid);

const ambient = new THREE.AmbientLight(0xffffff, 0.45);
const directional = new THREE.DirectionalLight(0xdde8ff, 0.8);
directional.position.set(10, 16, 6);
viewScene.add(ambient, directional);

const editorScene = new Scene("New Scene");
let selectedEntityId = null;

function resize() {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener("resize", resize);
resize();

function rebuildViewport() {
  for (const child of [...viewScene.children]) {
    if (child.userData.engineEntity) {
      viewScene.remove(child);
    }
  }

  for (const entity of editorScene.entities) {
    entity.object3D.userData.engineEntity = true;
    viewScene.add(entity.object3D);
  }
}

function row(label, input) {
  const wrap = document.createElement("label");
  wrap.className = "row";
  const span = document.createElement("span");
  span.textContent = label;
  wrap.append(span, input);
  return wrap;
}

function numberInput(value, onInput) {
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  input.value = String(value);
  input.addEventListener("input", () => onInput(Number(input.value)));
  return input;
}

function rerenderHierarchy() {
  hierarchy.innerHTML = "";
  for (const entity of editorScene.entities) {
    const item = document.createElement("div");
    item.className = `hierarchy-item ${entity.id === selectedEntityId ? "selected" : ""}`;

    const pick = document.createElement("button");
    pick.textContent = entity.name;
    pick.addEventListener("click", () => {
      selectedEntityId = entity.id;
      rerenderAll();
    });

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      editorScene.removeEntityById(entity.id);
      if (selectedEntityId === entity.id) {
        selectedEntityId = editorScene.entities[0]?.id ?? null;
      }
      rerenderAll();
    });

    item.append(pick, del);
    hierarchy.append(item);
  }
}

function rerenderInspector() {
  inspector.innerHTML = "";
  const entity = editorScene.getEntityById(selectedEntityId);
  if (!entity) {
    inspector.textContent = "Select an entity.";
    return;
  }

  const transform = entity.getComponent("TransformComponent");

  const nameInput = document.createElement("input");
  nameInput.value = entity.name;
  nameInput.addEventListener("input", () => {
    entity.name = nameInput.value;
    entity.object3D.name = nameInput.value;
    rerenderHierarchy();
  });
  inspector.append(row("Name", nameInput));

  inspector.append(row("Pos X", numberInput(transform.position.x, (v) => (transform.position.x = v))));
  inspector.append(row("Pos Y", numberInput(transform.position.y, (v) => (transform.position.y = v))));
  inspector.append(row("Pos Z", numberInput(transform.position.z, (v) => (transform.position.z = v))));

  inspector.append(row("Rot X", numberInput(transform.rotation.x, (v) => (transform.rotation.x = v))));
  inspector.append(row("Rot Y", numberInput(transform.rotation.y, (v) => (transform.rotation.y = v))));
  inspector.append(row("Rot Z", numberInput(transform.rotation.z, (v) => (transform.rotation.z = v))));

  inspector.append(row("Scale X", numberInput(transform.scale.x, (v) => (transform.scale.x = v))));
  inspector.append(row("Scale Y", numberInput(transform.scale.y, (v) => (transform.scale.y = v))));
  inspector.append(row("Scale Z", numberInput(transform.scale.z, (v) => (transform.scale.z = v))));
}

function rerenderAll() {
  rerenderHierarchy();
  rerenderInspector();
  rebuildViewport();
}

function createEntityWithCube() {
  const entity = new Entity(`Cube ${editorScene.entities.length + 1}`);
  entity.addComponent(new MeshComponent({ primitive: "cube", dimensions: [1, 1, 1], color: 0x7c8ba0 }));

  const transform = entity.getComponent("TransformComponent");
  transform.position.y = 0.5;

  editorScene.addEntity(entity);
  selectedEntityId = entity.id;
  rerenderAll();
}

document.querySelector("#add-cube").addEventListener("click", createEntityWithCube);

function downloadJSON(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#export-scene").addEventListener("click", () => {
  const json = JSON.stringify(editorScene.toJSON(), null, 2);
  downloadJSON("scene.json", json);
  localStorage.setItem("horror-engine-scene", json);
});

document.querySelector("#save-runtime").addEventListener("click", () => {
  const json = JSON.stringify(editorScene.toJSON(), null, 2);
  localStorage.setItem("horror-engine-scene", json);
  document.querySelector("#status").textContent = "Saved to runtime slot in localStorage.";
});

document.querySelector("#import-scene").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  editorScene.loadFromJSON(JSON.parse(text));
  selectedEntityId = editorScene.entities[0]?.id ?? null;
  rerenderAll();
});

function animate() {
  requestAnimationFrame(animate);
  for (const entity of editorScene.entities) {
    entity.update(0, {});
  }
  renderer.render(viewScene, camera);
}

createEntityWithCube();
animate();
