# Nightforge Lite (Beginner Horror Game Builder)

Nightforge Lite is a browser game builder for making horror games with Three.js **without starting from raw code**.

It has two modes:

1. **Beginner Block Builder (Scratch-style feel):** click buttons to add Rooms, Lights, Monsters, and Triggers.
2. **Code Console (Advanced):** write real JavaScript for custom systems once you need deeper control.

## Run it

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Beginner workflow (recommended)

1. Click **+ Room / + Flicker Light / + Patrol Monster / + Trigger Zone**.
2. Pick a block in the list.
3. Edit values in **Selected block**.
4. Click **Apply this block to scene** (or **Rebuild Scene**).
5. Move around with **WASD + mouse**.
6. Export your game with **Export Project JSON**.

This is designed so beginners can iterate visually first, then learn code later.

## Advanced workflow (real coding)

Use **Code Console (Advanced)** in the right panel.

Your script gets:

- `engine` → full runtime object
- `project` → current generated project JSON
- `log(message)` → prints to UI log
- `THREE` → Three.js module

Example:

```js
log("Adding custom ambient pulse");

engine.onLoop((delta, ctx) => {
  const pulse = Math.sin(ctx.time * 2) * 0.5 + 0.5;
  engine.ambient.intensity = 0.2 + pulse * 0.2;
});
```

Click **Run Code** to apply.

## Trigger options for beginners

`On Enter` dropdown supports:

- `show_message`
- `fog_red`
- `flashlight_burst`

## Main files

- `index.html` – beginner builder UI + advanced code console.
- `styles.css` – editor layout and visual style.
- `src/main.js` – block editor logic, project generation, runtime glue.
- `src/engine/HorrorEngine.js` – Three.js runtime/game loop.
- `src/engine/components.js` – reusable component behaviors.
- `src/engine/projectLoader.js` – converts project data into scene entities.
- `src/projects/demoProject.js` – starter data.

## For building real games

This scaffold is intentionally simple, but not a toy. You can extend it with:

- inventory systems
- dialogue events
- audio manager
- save/load
- enemy state machines
- post-processing

Start in blocks, then move systems into the code console and engine files as your project grows.
