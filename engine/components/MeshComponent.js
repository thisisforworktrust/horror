import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../Component.js";

function buildGeometry(primitive, dimensions) {
  if (primitive === "plane") {
    return new THREE.PlaneGeometry(dimensions[0], dimensions[1]);
  }
  return new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
}

export class MeshComponent extends Component {
  constructor({ primitive = "cube", color = 0x7f8ea3, dimensions = [1, 1, 1], receiveShadow = true, castShadow = true } = {}) {
    super("MeshComponent");
    this.primitive = primitive;
    this.color = color;
    this.dimensions = dimensions;
    this.receiveShadow = receiveShadow;
    this.castShadow = castShadow;
    this.mesh = null;
  }

  onAttach() {
    this.rebuildMesh();
  }

  rebuildMesh() {
    if (this.mesh) {
      this.entity.object3D.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    const geometry = buildGeometry(this.primitive, this.dimensions);
    const material = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.85 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = this.receiveShadow;
    mesh.castShadow = this.castShadow;

    if (this.primitive === "plane") {
      mesh.rotation.x = -Math.PI / 2;
    }

    this.mesh = mesh;
    this.entity.object3D.add(mesh);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      primitive: this.primitive,
      color: this.color,
      dimensions: this.dimensions,
      receiveShadow: this.receiveShadow,
      castShadow: this.castShadow,
    };
  }

  static fromJSON(data) {
    return new MeshComponent(data);
  }
}
