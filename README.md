# Horror Engine v1 (Browser + Three.js)

This project is a **small, real, extendable browser-based 3D horror engine** built with:

- HTML + CSS + JavaScript ES modules
- Three.js (loaded from CDN)
- No build tools / no bundler

It includes two apps:

- `editor.html` → scene editor prototype
- `index.html` → runtime game player

---

## File / Folder Structure

```txt
index.html                # Runtime app
editor.html               # Web editor app
styles.css                # Shared styling

engine/
  Component.js            # Base component class
  Entity.js               # Entity container
  Scene.js                # Scene model + JSON serialization
  Game.js                 # Runtime loop, renderer, active scene
  UI.js                   # In-game message UI layer
  componentRegistry.js    # JSON -> component factory
  components/
    TransformComponent.js
    MeshComponent.js
    ColliderComponent.js
    LightComponent.js
    TriggerComponent.js
  systems/
    CollisionSystem.js    # AABB collision placeholder system

runtime/
  main.js                 # Runtime bootstrap + simple FPS controller

editor/
  app.js                  # Editor UI + hierarchy + inspector + save/load

scenes/
  defaultScene.js         # Fallback starter scene
```

---

## Runtime Architecture (v1)

### `Game`

Responsibilities:

- creates renderer/camera/main loop
- owns active scene
- runs per-frame updates
- runs collision checks
- renders the world

File: `engine/Game.js`.

### `Scene`

Responsibilities:

- holds `entities[]`
- `loadFromJSON(data)` to rebuild scene
- `toJSON()` to serialize scene

File: `engine/Scene.js`.

### `Entity + Component`

- `Entity`: `id`, `name`, `object3D`, `components[]`
- components are modular behavior/data units

Implemented v1 components:

- `TransformComponent`
- `MeshComponent`
- `ColliderComponent`
- `LightComponent`
- `TriggerComponent`

Files: `engine/Entity.js`, `engine/components/*`.

### Physics Hook (Placeholder)

`CollisionSystem` currently uses **AABB vs AABB** overlap checks (no rigid body physics).

This is intentionally simple, and is the extension point for plugging in a full physics engine later.

File: `engine/systems/CollisionSystem.js`.

### UI Layer

`UI` can show in-game message text overlays for narrative beats.

File: `engine/UI.js`.

---

## Editor Features (v1)

`editor.html` includes:

- 3D viewport (Three.js)
- hierarchy panel (list of entities)
- inspector panel (edit name, position, rotation, scale)
- add/delete entity
- add cube mesh
- export scene JSON
- import scene JSON
- save scene to runtime slot (`localStorage`) for quick testing in runtime app

---

## How To Use (Step-by-step)

## 1) Open the editor

Open `editor.html` in your browser.

## 2) Create a scene

- click **Add Cube Entity**
- select entities in **Scene Hierarchy**
- edit transform values in **Inspector**

## 3) Export the scene

- click **Export Scene JSON** to download `scene.json`

Optional quick path:

- click **Save To Runtime Slot** to store the scene in `localStorage`

## 4) Load and run in runtime game

Open `index.html`.

You can either:

- load `scene.json` using **Load Scene JSON**, or
- if you used **Save To Runtime Slot**, runtime auto-loads from localStorage

Controls:

- `WASD` move
- `Shift` sprint
- click viewport + move mouse to look around

---

## Notes on Simplifications

- Collision = AABB overlap only (placeholder system)
- No rigid body simulation yet
- No transform gizmos yet (numeric inspector only)
- No scene graph parenting UI yet

These are deliberate v1 constraints to keep architecture clear and extendable.
