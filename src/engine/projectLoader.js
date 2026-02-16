import { Entity, THREE } from "./HorrorEngine.js";
import { FlickerLightComponent, PatrolComponent, TriggerZoneComponent } from "./components.js";

function defaultTriggerAction(type, engine) {
  if (type === "fog_red") {
    engine.scene.fog.color.setHex(0x120304);
    return;
  }

  if (type === "flashlight_burst") {
    engine.flashlight.intensity = 8;
    setTimeout(() => {
      engine.flashlight.intensity = 4;
    }, 500);
    return;
  }

  if (type === "show_message") {
    const overlay = document.createElement("div");
    overlay.textContent = "YOU ARE NOT ALONE";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      display: "grid",
      placeItems: "center",
      background: "rgba(0,0,0,0.7)",
      color: "#ff7060",
      fontSize: "3rem",
      letterSpacing: "0.2rem",
      textShadow: "0 0 16px #ff2211",
      zIndex: "9999",
    });

    document.body.append(overlay);
    setTimeout(() => overlay.remove(), 1000);
  }
}

export function loadProject(engine, project) {
  engine.clearWorld();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x111217, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  engine.addWorldObject(floor);

  for (const room of project.rooms ?? []) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(room.size[0], room.size[1], room.size[2]),
      new THREE.MeshStandardMaterial({
        color: room.color,
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.BackSide,
      })
    );
    mesh.position.set(room.position[0], room.position[1], room.position[2]);
    mesh.receiveShadow = true;

    engine.addEntity(new Entity(room.name, mesh));
  }

  for (const lightData of project.flickerLights ?? []) {
    const holder = new THREE.Object3D();
    holder.position.set(lightData.position[0], lightData.position[1], lightData.position[2]);

    const light = new THREE.PointLight(lightData.color, 1.1, 14, 2);
    light.castShadow = true;
    holder.add(light);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: lightData.color })
    );
    holder.add(bulb);

    const entity = new Entity(lightData.name, holder);
    entity.addComponent(new FlickerLightComponent(light, { speed: lightData.speed }));
    engine.addEntity(entity);
  }

  for (const monsterData of project.monsters ?? []) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 1.1, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x151515, emissive: 0x220000 })
    );
    mesh.castShadow = true;
    mesh.position.fromArray(monsterData.points[0]);

    const entity = new Entity(monsterData.name, mesh);
    entity.addComponent(new PatrolComponent(monsterData.points, monsterData.speed));
    engine.addEntity(entity);
  }

  for (const triggerData of project.triggers ?? []) {
    const box = new THREE.Box3(
      new THREE.Vector3(...triggerData.min),
      new THREE.Vector3(...triggerData.max)
    );

    const helper = new THREE.Box3Helper(box, 0x660000);
    helper.visible = false;
    engine.addWorldObject(helper);

    const entity = new Entity(triggerData.name, new THREE.Object3D());
    entity.addComponent(
      new TriggerZoneComponent(box, () => {
        if (typeof triggerData.onEnter === "function") {
          triggerData.onEnter(engine);
        } else {
          defaultTriggerAction(triggerData.onEnterType ?? "show_message", engine);
        }
      })
    );
    engine.addEntity(entity);
  }

  if (project.player?.position) {
    engine.camera.position.fromArray(project.player.position);
  }
}
