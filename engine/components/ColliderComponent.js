import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../Component.js";

export class ColliderComponent extends Component {
  constructor({ size = [1, 1, 1], offset = [0, 0, 0], isTrigger = false } = {}) {
    super("ColliderComponent");
    this.size = new THREE.Vector3(...size);
    this.offset = new THREE.Vector3(...offset);
    this.isTrigger = isTrigger;
  }

  computeWorldAABB() {
    const center = this.entity.object3D.position.clone().add(this.offset);
    const half = this.size.clone().multiplyScalar(0.5);
    return new THREE.Box3(center.clone().sub(half), center.clone().add(half));
  }

  toJSON() {
    return {
      ...super.toJSON(),
      size: this.size.toArray(),
      offset: this.offset.toArray(),
      isTrigger: this.isTrigger,
    };
  }

  static fromJSON(data) {
    return new ColliderComponent(data);
  }
}
