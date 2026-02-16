import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../core/Component.js";

export class ColliderComponent extends Component {
  constructor({ size = [1, 1, 1], isTrigger = false } = {}) {
    super("ColliderComponent");
    this.size = [...size];
    this.isTrigger = isTrigger;
    this.box = new THREE.Box3();
  }

  getAABB() {
    const [x, y, z] = this.entity.transform.position;
    const [sx, sy, sz] = this.size;
    this.box.min.set(x - sx / 2, y - sy / 2, z - sz / 2);
    this.box.max.set(x + sx / 2, y + sy / 2, z + sz / 2);
    return this.box;
  }

  toJSON() {
    return {
      type: this.type,
      size: [...this.size],
      isTrigger: this.isTrigger,
    };
  }

  static fromJSON(data = {}) {
    return new ColliderComponent(data);
  }
}
