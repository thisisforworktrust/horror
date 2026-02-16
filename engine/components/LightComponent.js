import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Component } from "../Component.js";

export class LightComponent extends Component {
  constructor({ color = 0xffddbb, intensity = 1, distance = 16 } = {}) {
    super("LightComponent");
    this.color = color;
    this.intensity = intensity;
    this.distance = distance;
    this.light = null;
  }

  onAttach() {
    this.light = new THREE.PointLight(this.color, this.intensity, this.distance, 2);
    this.light.castShadow = true;
    this.entity.object3D.add(this.light);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      color: this.color,
      intensity: this.intensity,
      distance: this.distance,
    };
  }

  static fromJSON(data) {
    return new LightComponent(data);
  }
}
