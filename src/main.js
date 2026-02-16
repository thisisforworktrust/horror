import {
  HorrorEngine,
  createRoom,
  createFlickerLight,
  createStalker,
  deserializeEntity
} from "./engine.js";

const canvas = document.getElementById("viewport");
const statusEl = document.getElementById("status");
const hierarchyEl = document.getElementById("hierarchy");
const inspector = document.getElementById("inspector");
const inspectorEmpty = document.getElementById("inspector-empty");

const engine = new HorrorEngine(canvas, statusEl);
seedScene();
renderHierarchy();
renderInspector();

function seedScene() {
  const room = createRoom();
  engine.addEntity(room);

  const light = createFlickerLight();
  light.object3D.position.set(0, 1.9, 0);
  engine.addEntity(light);

  const stalker = createStalker();
  engine.addEntity(stalker);
}

function renderHierarchy() {
  hierarchyEl.innerHTML = "";
  engine.entities.forEach((entity) => {
    const li = document.createElement("li");
    li.textContent = entity.name;
    li.classList.toggle("active", entity.id === engine.selectedId);
    li.onclick = () => {
      engine.selectEntity(entity.id);
      renderHierarchy();
      renderInspector();
    };
    hierarchyEl.appendChild(li);
  });
}

const fields = {
  name: document.getElementById("entity-name"),
  posX: document.getElementById("pos-x"),
  posY: document.getElementById("pos-y"),
  posZ: document.getElementById("pos-z"),
  rotX: document.getElementById("rot-x"),
  rotY: document.getElementById("rot-y"),
  rotZ: document.getElementById("rot-z"),
  scaleX: document.getElementById("scale-x"),
  scaleY: document.getElementById("scale-y"),
  scaleZ: document.getElementById("scale-z")
};

function renderInspector() {
  const entity = engine.selectedEntity;
  const hasSelection = Boolean(entity);
  inspector.hidden = !hasSelection;
  inspectorEmpty.hidden = hasSelection;
  if (!entity) return;

  fields.name.value = entity.name;
  fields.posX.value = entity.object3D.position.x.toFixed(2);
  fields.posY.value = entity.object3D.position.y.toFixed(2);
  fields.posZ.value = entity.object3D.position.z.toFixed(2);
  fields.rotX.value = radToDeg(entity.object3D.rotation.x).toFixed(1);
  fields.rotY.value = radToDeg(entity.object3D.rotation.y).toFixed(1);
  fields.rotZ.value = radToDeg(entity.object3D.rotation.z).toFixed(1);
  fields.scaleX.value = entity.object3D.scale.x.toFixed(2);
  fields.scaleY.value = entity.object3D.scale.y.toFixed(2);
  fields.scaleZ.value = entity.object3D.scale.z.toFixed(2);
}

for (const input of inspector.querySelectorAll("input")) {
  input.addEventListener("input", () => {
    const entity = engine.selectedEntity;
    if (!entity) return;

    entity.name = fields.name.value || entity.name;
    entity.object3D.position.set(num(fields.posX), num(fields.posY), num(fields.posZ));
    entity.object3D.rotation.set(degToRad(num(fields.rotX)), degToRad(num(fields.rotY)), degToRad(num(fields.rotZ)));
    entity.object3D.scale.set(num(fields.scaleX, 1), num(fields.scaleY, 1), num(fields.scaleZ, 1));
    renderHierarchy();
  });
}

document.getElementById("btn-play").onclick = () => {
  engine.setPlayMode(true);
  document.getElementById("btn-play").disabled = true;
  document.getElementById("btn-stop").disabled = false;
};

document.getElementById("btn-stop").onclick = () => {
  engine.setPlayMode(false);
  document.getElementById("btn-play").disabled = false;
  document.getElementById("btn-stop").disabled = true;
};

document.getElementById("btn-add-room").onclick = () => {
  const room = createRoom();
  room.object3D.position.x = Math.random() * 8 - 4;
  room.object3D.position.z = Math.random() * 8 - 4;
  engine.addEntity(room);
  renderHierarchy();
  renderInspector();
};

document.getElementById("btn-add-light").onclick = () => {
  const light = createFlickerLight();
  light.object3D.position.set(Math.random() * 6 - 3, 1.8, Math.random() * 6 - 3);
  engine.addEntity(light);
  renderHierarchy();
  renderInspector();
};

document.getElementById("btn-add-enemy").onclick = () => {
  const stalker = createStalker();
  stalker.object3D.position.set(Math.random() * 8 - 4, 0.75, Math.random() * 8 - 4);
  engine.addEntity(stalker);
  renderHierarchy();
  renderInspector();
};

document.getElementById("btn-save").onclick = () => {
  localStorage.setItem("dreadforge-scene", JSON.stringify(engine.serialize()));
  statusEl.textContent = "Scene saved locally.";
};

document.getElementById("btn-load").onclick = () => {
  const saved = localStorage.getItem("dreadforge-scene");
  if (!saved) {
    statusEl.textContent = "No saved scene found.";
    return;
  }

  const sceneData = JSON.parse(saved);
  engine.removeAllEntities();
  for (const item of sceneData) {
    const entity = deserializeEntity(item);
    if (entity) engine.addEntity(entity);
  }
  renderHierarchy();
  renderInspector();
  statusEl.textContent = "Scene loaded.";
};

function num(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}
