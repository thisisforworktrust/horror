# Nightforge Engine v2 (Browser + Three.js + Voxel Map Editing)

Nightforge is a browser-only 3D horror engine starter with:

- Runtime engine (`index.html`) powered by Three.js.
- Scene editor (`editor.html`) with hierarchy, inspector, save/load JSON.
- Minecraft-style voxel map drawing controls for fast level blockout.

## File / Folder Structure

```text
index.html                # Runtime game page
editor.html               # Voxel scene editor page
styles.css                # Shared styling

engine/
  index.js
  core/
    Game.js               # renderer/camera/loop/active scene
    Scene.js              # entities + toJSON/loadFromJSON
    Entity.js             # id/name/transform/components
    Component.js          # component base class
  components/
    TransformComponent.js
    MeshComponent.js
    ColliderComponent.js
  systems/
    PhysicsSystem.js      # placeholder AABB overlap checks
    UILayer.js            # in-game text messages

editor/
  main.js                 # voxel builder + hierarchy + inspector + save/load

runtime/
  main.js                 # runtime loader for exported scene JSON
```

## Engine Core (implemented)

- `Game`: owns renderer, camera, loop, active scene, physics system, UI layer.
- `Scene`: owns entities + supports `toJSON()` and `loadFromJSON(data)`.
- `Entity`: has id, name, transform, object3D, and component list.
- Components:
  - `TransformComponent`
  - `MeshComponent` (box/plane)
  - `ColliderComponent` (AABB hook)

## Physics status

Physics is intentionally a placeholder in v2:

- `PhysicsSystem` only performs AABB overlap tests.
- No rigid-body solver yet.
- Structure is ready to swap in full physics later.

## Voxel map editor controls (Minecraft-like)

Open `editor.html`, then click **Enter Build Controls**:

- `WASD` = move
- `Mouse` = look
- `Space / Ctrl` = up/down fly
- `Left Click` = place voxel
- `Right Click` = remove voxel
- `Esc` = release cursor

Use the **Block** color picker before placing voxels.

## Save / Load flow

1. Build your map in `editor.html`.
2. Click **Export Scene** to download JSON.
3. Open `index.html`.
4. Choose JSON file and click **Load Scene JSON**.
5. Scene runs in runtime using the same engine classes.

## Notes

- Inspector still works for exact numeric edits.
- You can keep using hierarchy + inspector for non-voxel entities.
- Great for rough horror level blockouts before adding advanced systems.
