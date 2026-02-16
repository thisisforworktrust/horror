import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

export class Entity {
  constructor(name, object3D = new THREE.Object3D()) {
    this.name = name;
    this.object3D = object3D;
    this.components = [];
  }

  addComponent(component) {
    component.entity = this;
    this.components.push(component);
    component.start?.();
    return component;
  }

  update(delta, context) {
    for (const component of this.components) {
      component.update?.(delta, context);
    }
  }
}

export class FlickerLightComponent {
  constructor(light, { speed = 30, min = 0.25, max = 1 } = {}) {
    this.light = light;
    this.speed = speed;
    this.min = min;
    this.max = max;
  }

  update(_delta, { time }) {
    const noise = Math.sin(time * this.speed) * 0.5 + 0.5;
    this.light.intensity = this.min + (this.max - this.min) * noise;
  }
}

export class PatrolComponent {
  constructor(points, speed = 1) {
    this.points = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    this.speed = speed;
    this.index = 0;
    this.forward = true;
  }

  update(delta) {
    if (!this.points.length) {
      return;
    }

    const target = this.points[this.index];
    const position = this.entity.object3D.position;
    const direction = target.clone().sub(position);
    const distance = direction.length();

    if (distance < 0.1) {
      if (this.forward) {
        this.index += 1;
        if (this.index >= this.points.length) {
          this.index = this.points.length - 2;
          this.forward = false;
        }
      } else {
        this.index -= 1;
        if (this.index < 0) {
          this.index = 1;
          this.forward = true;
        }
      }
      return;
    }

    direction.normalize();
    position.addScaledVector(direction, this.speed * delta);
    this.entity.object3D.lookAt(target);
  }
}

export class TriggerZoneComponent {
  constructor(box, onEnter) {
    this.box = box;
    this.onEnter = onEnter;
    this.triggered = false;
  }

  update(_delta, { playerPosition }) {
    if (this.triggered) {
      return;
    }

    if (this.box.containsPoint(playerPosition)) {
      this.triggered = true;
      this.onEnter?.();
    }
  }
}
