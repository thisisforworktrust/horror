import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Entity } from "./components.js";

export class HorrorEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x020205, 8, 60);

    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 200);
    this.camera.position.set(0, 1.65, 8);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.keys = new Set();

    this.entities = [];
    this.worldObjects = [];
    this.loopCallbacks = [];
    this.time = 0;

    this.pointerLocked = false;
    this.yaw = 0;
    this.pitch = 0;

    this.flashlight = new THREE.SpotLight(0xffffff, 4, 30, Math.PI / 8, 0.4, 1);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.target.position.set(0, 0, -2);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    this.scene.add(this.camera);

    this.setupInput();
    this.setupLighting();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setupLighting() {
    this.moon = new THREE.DirectionalLight(0x99bbff, 0.35);
    this.moon.position.set(8, 14, 4);
    this.moon.castShadow = true;
    this.scene.add(this.moon);

    this.ambient = new THREE.AmbientLight(0x334155, 0.35);
    this.scene.add(this.ambient);
  }

  setupInput() {
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyE") {
        this.flashlight.visible = !this.flashlight.visible;
        return;
      }
      this.keys.add(event.code);
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(event.code);
    });

    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.pointerLocked) return;
      this.yaw -= event.movementX * 0.002;
      this.pitch -= event.movementY * 0.002;
      this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch));
    });
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  clearWorld() {
    for (const entity of this.entities) {
      this.scene.remove(entity.object3D);
    }
    this.entities = [];

    for (const object of this.worldObjects) {
      this.scene.remove(object);
    }
    this.worldObjects = [];
  }

  addWorldObject(object3D) {
    this.worldObjects.push(object3D);
    this.scene.add(object3D);
  }

  addEntity(entity) {
    if (!(entity instanceof Entity)) {
      throw new Error("addEntity expects Entity instance");
    }
    this.entities.push(entity);
    this.scene.add(entity.object3D);
  }

  resetRuntimeCallbacks() {
    this.loopCallbacks = [];
  }

  onLoop(callback) {
    this.loopCallbacks.push(callback);
  }

  updatePlayer(delta) {
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    this.playerDirection.set(0, 0, 0);
    if (this.keys.has("KeyW")) this.playerDirection.add(forward);
    if (this.keys.has("KeyS")) this.playerDirection.sub(forward);
    if (this.keys.has("KeyA")) this.playerDirection.sub(right);
    if (this.keys.has("KeyD")) this.playerDirection.add(right);

    const sprint = this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
    const speed = sprint ? 6.4 : 3.4;

    if (this.playerDirection.lengthSq() > 0) {
      this.playerDirection.normalize();
      this.playerVelocity.copy(this.playerDirection).multiplyScalar(speed);
    } else {
      this.playerVelocity.set(0, 0, 0);
    }

    this.camera.position.addScaledVector(this.playerVelocity, delta);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  serializeScene() {
    return {
      player: { position: this.camera.position.toArray() },
      entities: this.entities.map((entity) => ({
        name: entity.name,
        position: entity.object3D.position.toArray(),
        rotation: entity.object3D.rotation.toArray(),
        scale: entity.object3D.scale.toArray(),
      })),
    };
  }

  start() {
    const tick = () => {
      const delta = this.clock.getDelta();
      this.time += delta;
      this.updatePlayer(delta);

      const context = { time: this.time, playerPosition: this.camera.position };

      for (const entity of this.entities) {
        entity.update(delta, context);
      }

      for (const callback of this.loopCallbacks) {
        callback(delta, context);
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };

    tick();
  }
}

export { THREE, Entity };
