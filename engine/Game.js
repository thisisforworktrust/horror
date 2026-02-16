import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";

export class Game {
  constructor({ canvas, ui, logger = console.log } = {}) {
    this.canvas = canvas;
    this.ui = ui;
    this.logger = logger;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 300);
    this.camera.position.set(0, 1.6, 8);

    this.threeScene = new THREE.Scene();
    this.threeScene.fog = new THREE.Fog(0x07090c, 10, 80);

    this.clock = new THREE.Clock();
    this.activeScene = null;

    this.collisionSystem = new CollisionSystem();

    this.worldRoot = new THREE.Group();
    this.threeScene.add(this.worldRoot);

    this.setupDefaultLights();
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setupDefaultLights() {
    const moon = new THREE.DirectionalLight(0x88aaff, 0.35);
    moon.position.set(8, 12, 5);
    moon.castShadow = true;
    this.threeScene.add(moon);

    const ambient = new THREE.AmbientLight(0x334455, 0.45);
    this.threeScene.add(ambient);
  }

  setActiveScene(scene) {
    this.activeScene = scene;
    this.rebuildThreeSceneGraph();
  }

  rebuildThreeSceneGraph() {
    this.worldRoot.clear();

    if (!this.activeScene) {
      return;
    }

    for (const entity of this.activeScene.entities) {
      this.worldRoot.add(entity.object3D);
    }
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  update(delta) {
    if (!this.activeScene) {
      return;
    }

    const context = {
      ui: this.ui,
      logger: this.logger,
      camera: this.camera,
      time: this.clock.elapsedTime,
    };

    this.activeScene.update(delta, context);
    this.collisionSystem.update(this.activeScene, context);
  }

  start() {
    const loop = () => {
      const delta = this.clock.getDelta();
      this.update(delta);
      this.renderer.render(this.threeScene, this.camera);
      requestAnimationFrame(loop);
    };

    loop();
  }
}
