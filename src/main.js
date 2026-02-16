import { HorrorEngine, THREE } from "./engine/HorrorEngine.js";
import { loadProject } from "./engine/projectLoader.js";
import { demoProject } from "./projects/demoProject.js";

const canvas = document.querySelector("#game-canvas");
const engine = new HorrorEngine(canvas);

const blockList = document.querySelector("#block-list");
const blockEditor = document.querySelector("#block-editor");
const exportOutput = document.querySelector("#export-output");
const codeConsole = document.querySelector("#code-console");
const codeLog = document.querySelector("#code-log");

const state = {
  blocks: [],
  selectedId: null,
  runtimeCode: `// Advanced code console\n// You get: engine, project, log(message), THREE\nlog("Custom code ready");`,
};

let blockId = 0;

function uid(type) {
  blockId += 1;
  return `${type}-${blockId}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fromProject(project) {
  const blocks = [];

  for (const room of project.rooms ?? []) {
    blocks.push({ id: uid("room"), type: "room", ...clone(room) });
  }
  for (const light of project.flickerLights ?? []) {
    blocks.push({ id: uid("light"), type: "light", ...clone(light) });
  }
  for (const monster of project.monsters ?? []) {
    blocks.push({ id: uid("monster"), type: "monster", ...clone(monster) });
  }
  for (const trigger of project.triggers ?? []) {
    blocks.push({ id: uid("trigger"), type: "trigger", ...clone(trigger) });
  }

  return blocks;
}

function toProject() {
  return {
    player: { position: engine.camera.position.toArray() },
    rooms: state.blocks.filter((b) => b.type === "room").map(stripMeta),
    flickerLights: state.blocks.filter((b) => b.type === "light").map(stripMeta),
    monsters: state.blocks.filter((b) => b.type === "monster").map(stripMeta),
    triggers: state.blocks.filter((b) => b.type === "trigger").map(stripMeta),
  };
}

function stripMeta(block) {
  const { id, type, ...rest } = block;
  return rest;
}

function addBlock(type) {
  const defaults = {
    room: {
      id: uid("room"),
      type: "room",
      name: "Room",
      size: [10, 5, 10],
      position: [0, 2.5, 0],
      color: 0x15171d,
    },
    light: {
      id: uid("light"),
      type: "light",
      name: "FlickerLight",
      position: [0, 4, 0],
      color: 0xffaa66,
      speed: 26,
    },
    monster: {
      id: uid("monster"),
      type: "monster",
      name: "Monster",
      speed: 1.2,
      points: [
        [2, 1.1, -3],
        [-2, 1.1, -3],
      ],
    },
    trigger: {
      id: uid("trigger"),
      type: "trigger",
      name: "Trigger",
      min: [-1, 0, -6],
      max: [1, 3, -4],
      onEnterType: "show_message",
    },
  };

  state.blocks.push(defaults[type]);
  state.selectedId = defaults[type].id;
  rerender();
  rebuildScene();
}

function selectedBlock() {
  return state.blocks.find((b) => b.id === state.selectedId);
}

function setLog(message) {
  codeLog.textContent = message;
}

function renderBlockList() {
  blockList.innerHTML = "";

  state.blocks.forEach((block) => {
    const row = document.createElement("div");
    row.className = `block-item ${state.selectedId === block.id ? "active" : ""}`;

    const left = document.createElement("button");
    left.textContent = `${iconFor(block.type)} ${block.name}`;
    left.addEventListener("click", () => {
      state.selectedId = block.id;
      rerender();
    });

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      state.blocks = state.blocks.filter((x) => x.id !== block.id);
      if (state.selectedId === block.id) state.selectedId = state.blocks[0]?.id ?? null;
      rerender();
      rebuildScene();
    });

    row.append(left, del);
    blockList.append(row);
  });
}

function iconFor(type) {
  if (type === "room") return "⬛";
  if (type === "light") return "💡";
  if (type === "monster") return "👹";
  return "⚠️";
}

function row(label, input) {
  const div = document.createElement("div");
  div.className = "editor-row";
  const name = document.createElement("label");
  name.textContent = label;
  div.append(name, input);
  return div;
}

function numberInput(value, onChange, step = "0.1") {
  const input = document.createElement("input");
  input.type = "number";
  input.step = step;
  input.value = String(value);
  input.addEventListener("input", () => onChange(Number(input.value)));
  return input;
}

function textInput(value, onChange) {
  const input = document.createElement("input");
  input.value = value;
  input.addEventListener("input", () => onChange(input.value));
  return input;
}

function selectInput(value, items, onChange) {
  const select = document.createElement("select");
  for (const item of items) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    if (item === value) option.selected = true;
    select.append(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function renderEditor() {
  blockEditor.innerHTML = "";
  const block = selectedBlock();
  if (!block) {
    blockEditor.textContent = "Add a block to start.";
    return;
  }

  const add = (...nodes) => nodes.forEach((node) => blockEditor.append(node));

  add(row("Name", textInput(block.name, (v) => (block.name = v))));

  if (block.type === "room") {
    add(row("Position X", numberInput(block.position[0], (v) => (block.position[0] = v))));
    add(row("Position Y", numberInput(block.position[1], (v) => (block.position[1] = v))));
    add(row("Position Z", numberInput(block.position[2], (v) => (block.position[2] = v))));
    add(row("Size X", numberInput(block.size[0], (v) => (block.size[0] = v))));
    add(row("Size Y", numberInput(block.size[1], (v) => (block.size[1] = v))));
    add(row("Size Z", numberInput(block.size[2], (v) => (block.size[2] = v))));
  }

  if (block.type === "light") {
    add(row("Position X", numberInput(block.position[0], (v) => (block.position[0] = v))));
    add(row("Position Y", numberInput(block.position[1], (v) => (block.position[1] = v))));
    add(row("Position Z", numberInput(block.position[2], (v) => (block.position[2] = v))));
    add(row("Flicker Speed", numberInput(block.speed, (v) => (block.speed = v))));
  }

  if (block.type === "monster") {
    add(row("Speed", numberInput(block.speed, (v) => (block.speed = v))));

    const pointsInput = document.createElement("textarea");
    pointsInput.rows = 4;
    pointsInput.value = JSON.stringify(block.points);
    pointsInput.addEventListener("change", () => {
      try {
        const parsed = JSON.parse(pointsInput.value);
        if (Array.isArray(parsed) && parsed.length > 1) {
          block.points = parsed;
          setLog("Monster points updated.");
        }
      } catch {
        setLog("Monster points must be JSON like [[1,1,1],[-1,1,1]].");
      }
    });

    add(row("Patrol points", pointsInput));
  }

  if (block.type === "trigger") {
    add(row("Min X", numberInput(block.min[0], (v) => (block.min[0] = v))));
    add(row("Min Y", numberInput(block.min[1], (v) => (block.min[1] = v))));
    add(row("Min Z", numberInput(block.min[2], (v) => (block.min[2] = v))));
    add(row("Max X", numberInput(block.max[0], (v) => (block.max[0] = v))));
    add(row("Max Y", numberInput(block.max[1], (v) => (block.max[1] = v))));
    add(row("Max Z", numberInput(block.max[2], (v) => (block.max[2] = v))));
    add(
      row(
        "On Enter",
        selectInput(block.onEnterType ?? "show_message", ["show_message", "fog_red", "flashlight_burst"], (v) => {
          block.onEnterType = v;
        })
      )
    );
  }

  const apply = document.createElement("button");
  apply.textContent = "Apply this block to scene";
  apply.addEventListener("click", () => {
    rebuildScene();
    rerender();
  });
  blockEditor.append(apply);
}

function runAdvancedCode(project) {
  engine.resetRuntimeCallbacks();
  try {
    const runner = new Function(
      "engine",
      "project",
      "log",
      "THREE",
      `${state.runtimeCode}\n//# sourceURL=nightforge-code-console.js`
    );
    runner(engine, project, setLog, THREE);
    setLog("Advanced code executed.");
  } catch (error) {
    setLog(`Code error: ${error.message}`);
  }
}

function rebuildScene() {
  const project = toProject();
  loadProject(engine, project);
  runAdvancedCode(project);
}

function rerender() {
  renderBlockList();
  renderEditor();
}

for (const button of document.querySelectorAll("[data-add]")) {
  button.addEventListener("click", () => {
    addBlock(button.dataset.add);
  });
}

document.querySelector("#rebuild-scene").addEventListener("click", rebuildScene);

document.querySelector("#export-project").addEventListener("click", () => {
  exportOutput.value = JSON.stringify(toProject(), null, 2);
});

document.querySelector("#lock-pointer").addEventListener("click", () => {
  canvas.requestPointerLock();
});

document.querySelector("#run-code").addEventListener("click", () => {
  state.runtimeCode = codeConsole.value;
  rebuildScene();
});

state.blocks = fromProject(demoProject);
state.selectedId = state.blocks[0]?.id ?? null;
codeConsole.value = state.runtimeCode;
rerender();
rebuildScene();
engine.start();
