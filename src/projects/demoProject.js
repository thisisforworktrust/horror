export const demoProject = {
  player: {
    position: [0, 1.65, 8],
  },
  rooms: [
    { name: "MainHall", size: [22, 6, 36], position: [0, 3, 0], color: 0x14151a },
    { name: "SideRoom", size: [10, 5, 10], position: [-8, 2.5, -10], color: 0x101216 },
  ],
  flickerLights: [
    { name: "HallLamp01", position: [0, 4.8, -8], color: 0xffb36b, speed: 32 },
    { name: "HallLamp02", position: [0, 4.8, 10], color: 0xff6a5f, speed: 21 },
  ],
  monsters: [
    {
      name: "Watcher",
      speed: 1.35,
      points: [
        [4, 1.1, -12],
        [-4, 1.1, -12],
        [-4, 1.1, 3],
        [4, 1.1, 3],
      ],
    },
  ],
  triggers: [
    {
      name: "JumpscareGate",
      min: [-1, 0, -18],
      max: [1, 3, -16],
      onEnterType: "show_message",
    },
  ],
};
