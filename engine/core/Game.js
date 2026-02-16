import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { PhysicsSystem } from "../systems/PhysicsSystem.js";
import { UILayer } from "../systems/UILayer.js";

export class Game {
  constructor({ canvas, uiRoot }) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.activeScene = null;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
    this.camera.position.set(0, 2, 8);

    this.physics = new PhysicsSystem();
    this.ui = new UILayer(uiRoot);

    this._running = false;

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  setScene(scene) {
    this.activeScene = scene;
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  update(delta) {
    if (!this.activeScene) return;

    this.activeScene.update(delta, this);
    this.physics.update(this.activeScene);

    if (this.physics.collisions.length > 0) {
      const [a, b] = this.physics.collisions[0];
      this.ui.showMessage(`You bumped into: ${a.name} / ${b.name}`, 900);
    }
  }

  render() {
    if (!this.activeScene) return;
    this.renderer.render(this.activeScene.threeScene, this.camera);
  }

  start() {
    if (this._running) return;
    this._running = true;

    const frame = () => {
      if (!this._running) return;
      const delta = this.clock.getDelta();
      this.update(delta);
      this.render();
      requestAnimationFrame(frame);
    };

    frame();
  }

  stop() {
    this._running = false;
  }
}
