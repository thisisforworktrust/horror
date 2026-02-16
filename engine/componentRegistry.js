import { ColliderComponent } from "./components/ColliderComponent.js";
import { LightComponent } from "./components/LightComponent.js";
import { MeshComponent } from "./components/MeshComponent.js";
import { TransformComponent } from "./components/TransformComponent.js";
import { TriggerComponent } from "./components/TriggerComponent.js";

const factories = {
  TransformComponent,
  MeshComponent,
  ColliderComponent,
  LightComponent,
  TriggerComponent,
};

export function createComponentFromJSON(data) {
  const componentClass = factories[data.type];
  if (!componentClass) {
    throw new Error(`Unknown component type: ${data.type}`);
  }
  return componentClass.fromJSON(data);
}
