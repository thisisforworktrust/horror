import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

export class HorrorEntity {
  constructor(name, object3D, behavior = null) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.object3D = object3D;
    this.behavior = behavior;
  }
}

export class FlickerBehavior {
  constructor(base = 1.7, variance = 0.8) {
    this.base = base;
    this.variance = variance;
  }

  update(entity, elapsed) {
    const light = entity.object3D;
    light.intensity = this.base + Math.sin(elapsed * 19) * this.variance + Math.random() * 0.18;
  }
}

export class StalkerBehavior {
  constructor(speed = 0.35) {
    this.speed = speed;
  }

  update(entity, elapsed, engine) {
    const target = engine.playerPoint;
    const dir = new THREE.Vector3().subVectors(target, entity.object3D.position).setY(0);
    if (dir.lengthSq() > 0.04) {
      dir.normalize();
      entity.object3D.position.addScaledVector(dir, this.speed * engine.deltaTime);
      entity.object3D.lookAt(target.x, entity.object3D.position.y, target.z);
    }
    entity.object3D.position.y = 0.75 + Math.sin(elapsed * 4) * 0.12;
  }
}

export class HorrorEngine {
  constructor(canvas, status) {
    this.canvas = canvas;
    this.status = status;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#020204");
    this.scene.fog = new THREE.Fog("#050507", 8, 30);

    this.camera = new THREE.PerspectiveCamera(70, 2, 0.1, 100);
    this.camera.position.set(0, 4.2, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    this.entities = [];
    this.selectedId = null;
    this.isPlaying = false;
    this.playerPoint = new THREE.Vector3(0, 0, 0);

    this.#installAtmosphere();
    this.#animate();
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  #installAtmosphere() {
    const ambient = new THREE.AmbientLight("#4f5060", 0.4);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight("#8992ff", 0.6);
    moon.position.set(-4, 9, -1);
    moon.castShadow = true;
    this.scene.add(moon);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(55, 55),
      new THREE.MeshStandardMaterial({ color: "#0f1118", roughness: 0.92 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  resize() {
    const { clientWidth, clientHeight } = this.canvas;
    if (!clientWidth || !clientHeight) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  }

  addEntity(entity) {
    this.entities.push(entity);
    this.scene.add(entity.object3D);
    this.selectEntity(entity.id);
  }

  removeAllEntities() {
    for (const entity of this.entities) {
      this.scene.remove(entity.object3D);
    }
    this.entities = [];
    this.selectedId = null;
  }

  selectEntity(id) {
    this.selectedId = id;
  }

  get selectedEntity() {
    return this.entities.find((e) => e.id === this.selectedId) ?? null;
  }

  setPlayMode(on) {
    this.isPlaying = on;
    this.status.textContent = on
      ? "Play mode active: stalkers and lights are live."
      : "Edit mode: place props and shape your scare scene.";
  }

  serialize() {
    return this.entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.object3D.userData.type,
      behavior: entity.object3D.userData.behavior,
      position: entity.object3D.position.toArray(),
      rotation: [entity.object3D.rotation.x, entity.object3D.rotation.y, entity.object3D.rotation.z],
      scale: entity.object3D.scale.toArray()
    }));
  }

  #animate() {
    requestAnimationFrame(() => this.#animate());
    const elapsed = this.clock.getElapsedTime();
    this.deltaTime = this.clock.getDelta();
    if (this.isPlaying) {
      this.playerPoint.set(Math.sin(elapsed * 0.25) * 4, 0, Math.cos(elapsed * 0.21) * 4);
      for (const entity of this.entities) {
        entity.behavior?.update(entity, elapsed, this);
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}

export function createRoom() {
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.8, 4),
    new THREE.MeshStandardMaterial({ color: "#151723", metalness: 0.1, roughness: 0.85, side: THREE.BackSide })
  );
  room.castShadow = true;
  room.receiveShadow = true;
  room.position.y = 1.4;
  room.userData.type = "room";
  room.userData.behavior = null;
  return new HorrorEntity("Room", room);
}

export function createFlickerLight() {
  const light = new THREE.PointLight("#af6b5b", 2, 14);
  light.castShadow = true;
  light.position.set(0, 1.8, 0);
  light.userData.type = "light";
  light.userData.behavior = "flicker";
  return new HorrorEntity("Flicker Light", light, new FlickerBehavior());
}

export function createStalker() {
  const stalker = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.35, 1, 6, 14),
    new THREE.MeshStandardMaterial({ color: "#2b2d33", roughness: 0.58, metalness: 0.02 })
  );
  stalker.position.set(3, 0.75, 3);
  stalker.castShadow = true;
  stalker.userData.type = "stalker";
  stalker.userData.behavior = "stalker";
  return new HorrorEntity("Stalker", stalker, new StalkerBehavior());
}

export function deserializeEntity(item) {
  let entity;
  if (item.type === "room") entity = createRoom();
  if (item.type === "light") entity = createFlickerLight();
  if (item.type === "stalker") entity = createStalker();
  if (!entity) return null;

  entity.id = item.id;
  entity.name = item.name;
  entity.object3D.position.fromArray(item.position);
  entity.object3D.rotation.set(...item.rotation);
  entity.object3D.scale.fromArray(item.scale);
  return entity;
}
