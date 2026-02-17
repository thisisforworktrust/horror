import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);
scene.fog = new THREE.FogExp2(0x020304, 0.09);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(1.5, 1.65, 1.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const clock = new THREE.Clock();

const hud = {
  objective: document.getElementById("objective"),
  totemCount: document.getElementById("totemCount"),
  sanityValue: document.getElementById("sanityValue"),
};

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startButton = document.getElementById("startButton");

const world = {
  walls: [],
  totems: [],
  collected: 0,
  sanity: 100,
  gameActive: false,
  gameOver: false,
  enemyAgro: 0,
};

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x14181e, roughness: 0.95, metalness: 0.05 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x20252c, roughness: 1 });
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x0d0f13, roughness: 1 });

const map = [
  "#############",
  "#S....#....E#",
  "#.##..#..##.#",
  "#..#.....#..#",
  "##.#.###.#.##",
  "#..#.#.#.#..#",
  "#....#.#....#",
  "#.####.####.#",
  "#......T....#",
  "#.##.#.#.##.#",
  "#..#..T..#..#",
  "#T...#...#..#",
  "#############",
];

const tileSize = 3;
let startPos = new THREE.Vector3(1.5, 1.65, 1.5);
let exitZone = new THREE.Vector3();

const ambient = new THREE.AmbientLight(0x263040, 0.15);
scene.add(ambient);

const moonLight = new THREE.DirectionalLight(0x4a6686, 0.12);
moonLight.position.set(10, 14, 8);
scene.add(moonLight);

const flashlight = new THREE.SpotLight(0xdde9ff, 2.2, 26, Math.PI / 7, 0.35, 2);
flashlight.position.set(0, 0, 0);
flashlight.castShadow = true;
flashlight.shadow.mapSize.set(1024, 1024);
flashlight.shadow.bias = -0.0001;
scene.add(flashlight);
scene.add(flashlight.target);
camera.add(flashlight);
camera.add(flashlight.target);
flashlight.target.position.set(0, 0, -10);

function buildWorld() {
  const width = map[0].length * tileSize;
  const depth = map.length * tileSize;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.position.set(width / 2 - tileSize / 2, 0, depth / 2 - tileSize / 2);
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(width / 2 - tileSize / 2, 3.2, depth / 2 - tileSize / 2);
  scene.add(ceiling);

  const wallGeo = new THREE.BoxGeometry(tileSize, 3.2, tileSize);
  const exitGeo = new THREE.BoxGeometry(tileSize * 0.6, 2.2, 0.2);
  const exitMaterial = new THREE.MeshStandardMaterial({ color: 0x8f0000, emissive: 0x640000, emissiveIntensity: 1.6 });

  map.forEach((row, z) => {
    [...row].forEach((cell, x) => {
      const worldX = x * tileSize;
      const worldZ = z * tileSize;

      if (cell === "#") {
        const wall = new THREE.Mesh(wallGeo, wallMaterial);
        wall.position.set(worldX, 1.6, worldZ);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
        world.walls.push(new THREE.Box3().setFromCenterAndSize(wall.position, new THREE.Vector3(tileSize, 3.2, tileSize)));
      }

      if (cell === "S") {
        startPos = new THREE.Vector3(worldX, 1.65, worldZ);
      }

      if (cell === "T") {
        const totem = new THREE.Mesh(
          new THREE.ConeGeometry(0.35, 1.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x7f3bff, emissive: 0x5a1ccf, emissiveIntensity: 1.2 })
        );
        totem.position.set(worldX, 0.9, worldZ);
        totem.castShadow = true;
        scene.add(totem);
        world.totems.push({ mesh: totem, collected: false });
      }

      if (cell === "E") {
        const exit = new THREE.Mesh(exitGeo, exitMaterial);
        exit.position.set(worldX, 1.4, worldZ - tileSize / 2 + 0.5);
        scene.add(exit);
        exitZone.set(worldX, 1.4, worldZ);
      }
    });
  });
}

buildWorld();
controls.getObject().position.copy(startPos);

const enemy = new THREE.Group();
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 6, 12), new THREE.MeshStandardMaterial({ color: 0x11060a }));
const face = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 18), new THREE.MeshStandardMaterial({ color: 0x22151a }));
face.position.y = 1.25;
const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff2020 }));
const rightEye = leftEye.clone();
leftEye.position.set(-0.12, 1.3, 0.35);
rightEye.position.set(0.12, 1.3, 0.35);
enemy.add(torso, face, leftEye, rightEye);
enemy.position.set(map[0].length * tileSize - tileSize * 1.5, 0.9, map.length * tileSize - tileSize * 1.5);
scene.add(enemy);

const keys = { forward: false, backward: false, left: false, right: false, sprint: false };
const playerRadius = 0.35;
const velocity = new THREE.Vector3();
const wishDir = new THREE.Vector3();

function canMoveTo(position) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(position.x - playerRadius, 0.1, position.z - playerRadius),
    new THREE.Vector3(position.x + playerRadius, 1.9, position.z + playerRadius)
  );
  return !world.walls.some((wallBox) => wallBox.intersectsBox(playerBox));
}

function showOverlay(title, text, buttonText, showButton = true) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  startButton.textContent = buttonText;
  startButton.style.display = showButton ? "inline-block" : "none";
  overlay.classList.remove("hidden");
}

function endGame(win) {
  world.gameActive = false;
  world.gameOver = true;
  controls.unlock();
  if (win) {
    showOverlay("You Survived", "The door slammed behind you. The thing in the corridor is still screaming... but you made it out.", "Play Again");
  } else {
    showOverlay("You Were Taken", "Darkness swallows your flashlight. Press play to challenge Corridor 13 again.", "Retry");
  }
}

function resetGame() {
  world.collected = 0;
  world.sanity = 100;
  world.enemyAgro = 0;
  world.gameOver = false;
  world.gameActive = true;
  hud.totemCount.textContent = "0";
  hud.sanityValue.textContent = "100";
  hud.objective.textContent = "Find 3 ritual totems and reach the exit.";

  world.totems.forEach((totem, index) => {
    totem.collected = false;
    totem.mesh.visible = true;
    totem.mesh.position.y = 0.9 + Math.sin(index) * 0.02;
  });

  controls.getObject().position.copy(startPos);
  enemy.position.set(map[0].length * tileSize - tileSize * 1.5, 0.9, map.length * tileSize - tileSize * 1.5);
}

startButton.addEventListener("click", () => {
  if (world.gameOver) {
    resetGame();
  }
  overlay.classList.add("hidden");
  controls.lock();
  world.gameActive = true;
});

controls.addEventListener("unlock", () => {
  if (world.gameActive && !world.gameOver) {
    world.gameActive = false;
    showOverlay("Paused", "The corridor breathes while you stand still.", "Resume");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyW") keys.forward = true;
  if (event.code === "KeyS") keys.backward = true;
  if (event.code === "KeyA") keys.left = true;
  if (event.code === "KeyD") keys.right = true;
  if (event.code === "ShiftLeft") keys.sprint = true;
});

document.addEventListener("keyup", (event) => {
  if (event.code === "KeyW") keys.forward = false;
  if (event.code === "KeyS") keys.backward = false;
  if (event.code === "KeyA") keys.left = false;
  if (event.code === "KeyD") keys.right = false;
  if (event.code === "ShiftLeft") keys.sprint = false;
});

function updatePlayer(delta) {
  const speed = keys.sprint ? 5.2 : 3.4;
  wishDir.set(0, 0, 0);

  if (keys.forward) wishDir.z -= 1;
  if (keys.backward) wishDir.z += 1;
  if (keys.left) wishDir.x -= 1;
  if (keys.right) wishDir.x += 1;

  if (wishDir.lengthSq() > 0) {
    wishDir.normalize();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    velocity.copy(forward.multiplyScalar(-wishDir.z).add(right.multiplyScalar(wishDir.x))).multiplyScalar(speed * delta);

    const currentPos = controls.getObject().position.clone();
    const nextX = currentPos.clone().add(new THREE.Vector3(velocity.x, 0, 0));
    const nextZ = currentPos.clone().add(new THREE.Vector3(0, 0, velocity.z));

    if (canMoveTo(nextX)) controls.getObject().position.x = nextX.x;
    if (canMoveTo(nextZ)) controls.getObject().position.z = nextZ.z;
  }
}

function updateTotems(elapsedTime) {
  const playerPos = controls.getObject().position;

  world.totems.forEach((totem, index) => {
    if (totem.collected) return;
    totem.mesh.position.y = 0.9 + Math.sin(elapsedTime * 2 + index) * 0.18;
    totem.mesh.rotation.y += 0.014;

    if (playerPos.distanceTo(totem.mesh.position) < 1.15) {
      totem.collected = true;
      totem.mesh.visible = false;
      world.collected += 1;
      world.enemyAgro += 0.45;
      hud.totemCount.textContent = String(world.collected);
      if (world.collected === 3) {
        hud.objective.textContent = "All totems collected. Reach the red exit now!";
      }
    }
  });
}

function updateEnemy(delta, elapsedTime) {
  const playerPos = controls.getObject().position;
  const target = playerPos.clone();
  const toPlayer = target.sub(enemy.position);
  toPlayer.y = 0;
  const distance = toPlayer.length();

  const chaseSpeed = 1.15 + world.enemyAgro * 1.05;
  if (distance > 0.1) {
    toPlayer.normalize();
    enemy.position.add(toPlayer.multiplyScalar(chaseSpeed * delta));
    enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
  }

  const pulse = 0.7 + Math.sin(elapsedTime * 8) * 0.25;
  leftEye.material.color.setRGB(1, pulse * 0.2, pulse * 0.2);
  rightEye.material.color.copy(leftEye.material.color);

  if (distance < 9) {
    world.sanity -= (1.8 + world.enemyAgro * 1.7) * delta;
  } else {
    world.sanity += 4 * delta;
  }

  world.sanity = Math.max(0, Math.min(100, world.sanity));
  hud.sanityValue.textContent = Math.round(world.sanity).toString();

  if (distance < 1.2 || world.sanity <= 0) {
    endGame(false);
  }
}

function checkWinCondition() {
  if (world.collected < 3) return;
  const playerPos = controls.getObject().position;
  if (playerPos.distanceTo(exitZone) < 1.5) {
    endGame(true);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  flashlight.intensity = 2 + Math.sin(elapsed * 20) * 0.05;

  if (world.gameActive && controls.isLocked) {
    updatePlayer(delta);
    updateTotems(elapsed);
    updateEnemy(delta, elapsed);
    checkWinCondition();
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
