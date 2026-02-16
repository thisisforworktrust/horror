export const defaultSceneData = {
  name: "Starter Horror Scene",
  entities: [
    {
      id: "floor",
      name: "Floor",
      components: [
        {
          type: "TransformComponent",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          enabled: true,
        },
        {
          type: "MeshComponent",
          primitive: "plane",
          color: 0x11141a,
          dimensions: [24, 24, 1],
          receiveShadow: true,
          castShadow: false,
          enabled: true,
        },
        {
          type: "ColliderComponent",
          size: [24, 0.2, 24],
          offset: [0, -0.1, 0],
          isTrigger: false,
          enabled: true,
        },
      ],
    },
    {
      id: "crate",
      name: "Crate",
      components: [
        {
          type: "TransformComponent",
          position: [0, 0.5, -4],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          enabled: true,
        },
        {
          type: "MeshComponent",
          primitive: "cube",
          color: 0x3a3f47,
          dimensions: [1, 1, 1],
          receiveShadow: true,
          castShadow: true,
          enabled: true,
        },
        {
          type: "ColliderComponent",
          size: [1, 1, 1],
          offset: [0, 0, 0],
          isTrigger: false,
          enabled: true,
        },
      ],
    },
    {
      id: "warningTrigger",
      name: "Warning Trigger",
      components: [
        {
          type: "TransformComponent",
          position: [0, 1, -6],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          enabled: true,
        },
        {
          type: "ColliderComponent",
          size: [2, 2, 2],
          offset: [0, 0, 0],
          isTrigger: true,
          enabled: true,
        },
        {
          type: "TriggerComponent",
          message: "You feel like you're being watched...",
          enabled: true,
        },
      ],
    },
  ],
};
