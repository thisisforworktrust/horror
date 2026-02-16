import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { TransformComponent } from "./components/TransformComponent.js";

let nextId = 1;

export class Entity {
  constructor(name = "Entity", id = null) {
    this.id = id ?? `entity-${nextId++}`;
    this.name = name;
    this.object3D = new THREE.Object3D();
    this.object3D.name = this.name;
    this.components = [];

    this.addComponent(new TransformComponent());
  }

  addComponent(component) {
    component.entity = this;
    this.components.push(component);
    component.onAttach?.();
    return component;
  }

  getComponent(type) {
    return this.components.find((component) => component.type === type);
  }

  removeComponent(type) {
    this.components = this.components.filter((component) => component.type !== type);
  }

  update(delta, context) {
    const transform = this.getComponent("TransformComponent");
    transform?.applyTo(this.object3D);

    for (const component of this.components) {
      if (component.enabled) {
        component.onUpdate?.(delta, context);
      }
    }

    transform?.readFrom(this.object3D);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      components: this.components.map((component) => component.toJSON()),
    };
  }
}
