import { Entity } from "./Entity.js";
import { createComponentFromJSON } from "./componentRegistry.js";

export class Scene {
  constructor(name = "Scene") {
    this.name = name;
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntityById(id) {
    this.entities = this.entities.filter((entity) => entity.id !== id);
  }

  getEntityById(id) {
    return this.entities.find((entity) => entity.id === id);
  }

  update(delta, context) {
    for (const entity of this.entities) {
      entity.update(delta, context);
    }
  }

  toJSON() {
    return {
      name: this.name,
      entities: this.entities.map((entity) => entity.toJSON()),
    };
  }

  loadFromJSON(data) {
    this.name = data.name ?? "Scene";
    this.entities = [];

    for (const entityData of data.entities ?? []) {
      const entity = new Entity(entityData.name, entityData.id);
      entity.components = [];

      for (const componentData of entityData.components ?? []) {
        const component = createComponentFromJSON(componentData);
        entity.addComponent(component);
      }

      this.addEntity(entity);
    }
  }
}
