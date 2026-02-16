# DreadForge (Three.js Horror Engine Starter)

DreadForge is a lightweight browser game engine/editor inspired by Unity/Godot workflows, focused on making horror scenes quickly with Three.js.

## Features

- **Hierarchy panel** for scene objects.
- **Inspector panel** for transform editing (position/rotation/scale).
- **Play/Edit mode** toggle for testing behavior.
- **Horror-prefab entities**:
  - Room shell
  - Flickering point light
  - Stalker enemy that chases the player point in play mode
- **Scene Save/Load** via browser localStorage.

## Run

Use any static web server from this folder.

### Option A: Python

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

### Option B: VS Code Live Server

Open the project and launch Live Server on `index.html`.

## How to build your horror game

1. Click **Add Room** to create room blocks.
2. Click **Add Flicker Light** for unstable horror lighting.
3. Click **Add Stalker** for enemy pressure.
4. Select objects in **Hierarchy** and tweak transforms in **Inspector**.
5. Hit **Play** to run behavior, **Stop** to return to edit mode.
6. Use **Save Scene** and **Load Scene** as checkpoints.

## Extend it

- Add more entity factories in `src/engine.js`.
- Add new AI/animation scripts as behavior classes with an `update(entity, elapsed, engine)` method.
- Add post-processing effects (film grain, chromatic aberration, vignette) by integrating Three.js postprocessing passes.
- Add a custom audio manager for spatial ambience and scare cues.
