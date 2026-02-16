import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../Component.js";

export class TransformComponent extends Component {
  constructor({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = {}) {
    super("TransformComponent");
    this.position = new THREE.Vector3(...position);
    this.rotation = new THREE.Euler(...rotation, "XYZ");
    this.scale = new THREE.Vector3(...scale);
  }

  applyTo(object3D) {
    object3D.position.copy(this.position);
    object3D.rotation.copy(this.rotation);
    object3D.scale.copy(this.scale);
  }

  readFrom(object3D) {
    this.position.copy(object3D.position);
    this.rotation.copy(object3D.rotation);
    this.scale.copy(object3D.scale);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      position: this.position.toArray(),
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
      scale: this.scale.toArray(),
    };
  }

  static fromJSON(data) {
    return new TransformComponent(data);
  }
}
