import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Game } from "../engine/Game.js";
import { Scene } from "../engine/Scene.js";
import { UI } from "../engine/UI.js";
import { Entity } from "../engine/Entity.js";
import { ColliderComponent } from "../engine/components/ColliderComponent.js";
import { TransformComponent } from "../engine/components/TransformComponent.js";
import { defaultSceneData } from "../scenes/defaultScene.js";

const canvas = document.querySelector("#game-canvas");
const ui = new UI(document.querySelector("#game-ui"));
const game = new Game({
  canvas,
  ui,
  logger: (message) => {
    document.querySelector("#runtime-log").textContent = message;
  },
});

const runtimeScene = new Scene("Runtime Scene");

function createPlayerEntity() {
  const player = new Entity("Player", "__player__");
  player.components = [];
  player.addComponent(
    new TransformComponent({
      position: [game.camera.position.x, game.camera.position.y - 0.9, game.camera.position.z],
      scale: [1, 1, 1],
    })
  );
  player.addComponent(new ColliderComponent({ size: [0.6, 1.8, 0.6], isTrigger: false }));
  return player;
}

function loadSceneData(data) {
  runtimeScene.loadFromJSON(data);
  runtimeScene.addEntity(createPlayerEntity());
  game.setActiveScene(runtimeScene);
  ui.showMessage(`Loaded scene: ${runtimeScene.name}`, 1600);
}

function sceneDataFromStorage() {
  try {
    const raw = localStorage.getItem("horror-engine-scene");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

loadSceneData(sceneDataFromStorage() ?? defaultSceneData);

const keys = new Set();
let yaw = 0;
let pitch = 0;
let pointerLocked = false;

window.addEventListener("keydown", (event) => keys.add(event.code));
window.addEventListener("keyup", (event) => keys.delete(event.code));
canvas.addEventListener("click", () => canvas.requestPointerLock());
document.addEventListener("pointerlockchange", () => {
  pointerLocked = document.pointerLockElement === canvas;
});
window.addEventListener("mousemove", (event) => {
  if (!pointerLocked) return;
  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;
  pitch = Math.max(-1.35, Math.min(1.35, pitch));
});

function syncPlayerCollider() {
  const player = runtimeScene.getEntityById("__player__");
  if (!player) return;
  const transform = player.getComponent("TransformComponent");
  transform.position.set(game.camera.position.x, game.camera.position.y - 0.9, game.camera.position.z);
}

function isPositionBlocked(candidate) {
  const playerHalf = new THREE.Vector3(0.3, 0.9, 0.3);
  const center = candidate.clone().add(new THREE.Vector3(0, -0.9, 0));
  const playerBox = new THREE.Box3(center.clone().sub(playerHalf), center.clone().add(playerHalf));

  for (const entity of runtimeScene.entities) {
    if (entity.id === "__player__") continue;
    const collider = entity.getComponent("ColliderComponent");
    if (!collider || collider.isTrigger) continue;
    if (playerBox.intersectsBox(collider.computeWorldAABB())) return true;
  }

  return false;
}

function updatePlayer(delta) {
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const dir = new THREE.Vector3();

  if (keys.has("KeyW")) dir.add(forward);
  if (keys.has("KeyS")) dir.sub(forward);
  if (keys.has("KeyA")) dir.sub(right);
  if (keys.has("KeyD")) dir.add(right);
  if (dir.lengthSq() > 0) dir.normalize();

  const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 6 : 3;
  const candidate = game.camera.position.clone().add(dir.multiplyScalar(speed * delta));
  if (!isPositionBlocked(candidate)) {
    game.camera.position.copy(candidate);
  }

  game.camera.rotation.set(pitch, yaw, 0, "YXZ");
  syncPlayerCollider();
}

const originalUpdate = game.update.bind(game);
game.update = (delta) => {
  updatePlayer(delta);
  originalUpdate(delta);
};

document.querySelector("#load-json").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  loadSceneData(JSON.parse(text));
});

game.start();
