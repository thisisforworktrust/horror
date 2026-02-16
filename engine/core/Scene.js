import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { Entity } from "./Entity.js";
import { TransformComponent } from "../components/TransformComponent.js";
import { MeshComponent } from "../components/MeshComponent.js";
import { ColliderComponent } from "../components/ColliderComponent.js";

const COMPONENT_TYPES = {
  TransformComponent,
  MeshComponent,
  ColliderComponent,
};

export class Scene {
  constructor(name = "Scene") {
    this.name = name;
    this.entities = [];
    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x0a0c10);
    this.threeScene.fog = new THREE.Fog(0x0a0c10, 8, 70);

    this.bootstrapLights();
  }

  bootstrapLights() {
    const ambient = new THREE.AmbientLight(0x334155, 0.4);
    const key = new THREE.DirectionalLight(0x88aaff, 0.35);
    key.position.set(4, 10, 5);
    key.castShadow = true;
    this.threeScene.add(ambient, key);
  }

  addEntity(entity, game = null) {
    this.entities.push(entity);
    entity.syncTransformToObject3D();
    this.threeScene.add(entity.object3D);

    for (const comp of entity.components) {
      if (!comp.__attached) {
        comp.onAttach(entity, this, game);
        comp.__attached = true;
      }
    }
  }

  createEntity(name = "Entity", game = null) {
    const entity = new Entity({ name });
    this.addEntity(entity, game);
    return entity;
  }

  removeEntity(id, game = null) {
    const idx = this.entities.findIndex((e) => e.id === id);
    if (idx < 0) return;

    const [entity] = this.entities.splice(idx, 1);
    for (const comp of entity.components) {
      if (comp.__attached) {
        comp.onDetach(entity, this, game);
        comp.__attached = false;
      }
    }
    this.threeScene.remove(entity.object3D);
  }

  update(delta, game) {
    for (const entity of this.entities) {
      entity.update(delta, this, game);
      entity.syncTransformToObject3D();
    }
  }

  toJSON() {
    return {
      name: this.name,
      entities: this.entities.map((entity) => entity.toJSON()),
    };
  }

  loadFromJSON(data = {}, game = null) {
    for (const entity of [...this.entities]) {
      this.removeEntity(entity.id, game);
    }

    this.name = data.name ?? "Scene";

    for (const entityData of data.entities ?? []) {
      const entity = new Entity({ id: entityData.id, name: entityData.name });
      entity.components = [];

      for (const compData of entityData.components ?? []) {
        const Klass = COMPONENT_TYPES[compData.type];
        if (!Klass) continue;
        entity.addComponent(Klass.fromJSON(compData));
      }

      if (!entity.getComponent("TransformComponent")) {
        entity.addComponent(new TransformComponent());
      }

      entity.syncTransformToObject3D();
      this.addEntity(entity, game);
    }
  }
}
