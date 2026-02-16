export class PhysicsSystem {
  constructor() {
    this.collisions = [];
  }

  update(scene) {
    this.collisions = [];

    const colliders = scene.entities
      .map((entity) => ({ entity, collider: entity.getComponent("ColliderComponent") }))
      .filter((entry) => entry.collider);

    for (let i = 0; i < colliders.length; i += 1) {
      for (let j = i + 1; j < colliders.length; j += 1) {
        const a = colliders[i];
        const b = colliders[j];

        if (a.collider.getAABB().intersectsBox(b.collider.getAABB())) {
          this.collisions.push([a.entity, b.entity]);
        }
      }
    }
  }
}
