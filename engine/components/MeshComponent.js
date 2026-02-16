import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../core/Component.js";

export class MeshComponent extends Component {
  constructor({ geometry = "box", color = 0x808080, castShadow = true, receiveShadow = true } = {}) {
    super("MeshComponent");
    this.geometry = geometry;
    this.color = color;
    this.castShadow = castShadow;
    this.receiveShadow = receiveShadow;
    this.mesh = null;
  }

  buildMesh() {
    let geo;
    if (this.geometry === "plane") {
      geo = new THREE.PlaneGeometry(10, 10);
    } else {
      geo = new THREE.BoxGeometry(1, 1, 1);
    }

    const mat = new THREE.MeshStandardMaterial({ color: this.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = this.castShadow;
    mesh.receiveShadow = this.receiveShadow;

    if (this.geometry === "plane") {
      mesh.rotation.x = -Math.PI / 2;
    }

    return mesh;
  }

  onAttach(entity) {
    this.mesh = this.buildMesh();
    entity.object3D.add(this.mesh);
  }

  onDetach(entity) {
    if (this.mesh) {
      entity.object3D.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }

  toJSON() {
    return {
      type: this.type,
      geometry: this.geometry,
      color: this.color,
      castShadow: this.castShadow,
      receiveShadow: this.receiveShadow,
    };
  }

  static fromJSON(data = {}) {
    return new MeshComponent(data);
  }
}
