export class CollisionSystem {
  constructor() {
    this.collidingPairs = new Set();
  }

  pairKey(a, b) {
    const ids = [a.id, b.id].sort();
    return `${ids[0]}::${ids[1]}`;
  }

  update(scene, context) {
    const entitiesWithCollider = scene.entities.filter((entity) => entity.getComponent("ColliderComponent"));
    const seenThisFrame = new Set();

    for (let i = 0; i < entitiesWithCollider.length; i += 1) {
      for (let j = i + 1; j < entitiesWithCollider.length; j += 1) {
        const a = entitiesWithCollider[i];
        const b = entitiesWithCollider[j];

        const colliderA = a.getComponent("ColliderComponent");
        const colliderB = b.getComponent("ColliderComponent");

        const boxA = colliderA.computeWorldAABB();
        const boxB = colliderB.computeWorldAABB();

        if (boxA.intersectsBox(boxB)) {
          const key = this.pairKey(a, b);
          seenThisFrame.add(key);

          if (!this.collidingPairs.has(key)) {
            this.collidingPairs.add(key);

            a.components.forEach((component) => component.onCollisionEnter?.(b, context));
            b.components.forEach((component) => component.onCollisionEnter?.(a, context));
          }
        }
      }
    }

    this.collidingPairs = seenThisFrame;
  }
}
