import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { TransformComponent } from "../components/TransformComponent.js";

let ENTITY_ID_COUNTER = 1;

export class Entity {
  constructor({ id = null, name = "Entity" } = {}) {
    this.id = id ?? `entity-${ENTITY_ID_COUNTER++}`;
    this.name = name;
    this.object3D = new THREE.Object3D();
    this.components = [];

    this.transform = new TransformComponent();
    this.addComponent(this.transform);
  }

  addComponent(component, scene = null, game = null) {
    component.entity = this;
    component.__attached = false;
    this.components.push(component);

    if (scene) {
      component.onAttach(this, scene, game);
      component.__attached = true;
    }

    if (component.type === "TransformComponent") {
      this.transform = component;
      this.syncTransformToObject3D();
    }

    return component;
  }

  removeComponent(type, scene = null, game = null) {
    const index = this.components.findIndex((comp) => comp.type === type);
    if (index === -1) return;

    const [component] = this.components.splice(index, 1);
    if (component.__attached) {
      component.onDetach(this, scene, game);
      component.__attached = false;
    }
  }

  getComponent(type) {
    return this.components.find((comp) => comp.type === type) ?? null;
  }

  syncTransformToObject3D() {
    const t = this.transform;
    this.object3D.position.set(...t.position);
    this.object3D.rotation.set(...t.rotation);
    this.object3D.scale.set(...t.scale);
  }

  syncObject3DToTransform() {
    const p = this.object3D.position;
    const r = this.object3D.rotation;
    const s = this.object3D.scale;
    this.transform.position = [p.x, p.y, p.z];
    this.transform.rotation = [r.x, r.y, r.z];
    this.transform.scale = [s.x, s.y, s.z];
  }

  update(delta, scene, game) {
    for (const component of this.components) {
      component.update(delta, scene, game);
    }
  }

  toJSON() {
    this.syncObject3DToTransform();
    return {
      id: this.id,
      name: this.name,
      components: this.components.map((comp) => comp.toJSON()),
    };
  }
}
