import { Game, Scene, Entity, TransformComponent, MeshComponent, ColliderComponent } from "../engine/index.js";

const canvas = document.querySelector("#game-canvas");
const uiRoot = document.querySelector("#game-ui");
const game = new Game({ canvas, uiRoot });
const scene = new Scene("RuntimeScene");

game.setScene(scene);

const importInput = document.querySelector("#scene-file");
const loadButton = document.querySelector("#load-scene");
const loadDemoButton = document.querySelector("#load-demo");

function createDefaultScene() {
  const floor = new Entity({ name: "Floor" });
  floor.removeComponent("TransformComponent");
  floor.addComponent(new TransformComponent({ position: [0, 0, 0], scale: [1, 1, 1] }));
  floor.addComponent(new MeshComponent({ geometry: "plane", color: 0x171b22 }));
  floor.addComponent(new ColliderComponent({ size: [10, 0.2, 10] }));
  scene.addEntity(floor, game);

  const crate = new Entity({ name: "Crate" });
  crate.removeComponent("TransformComponent");
  crate.addComponent(new TransformComponent({ position: [0, 0.5, 0], scale: [1, 1, 1] }));
  crate.addComponent(new MeshComponent({ geometry: "box", color: 0x8b1a1a }));
  crate.addComponent(new ColliderComponent({ size: [1, 1, 1] }));
  scene.addEntity(crate, game);

  game.ui.showMessage("Default horror test scene loaded.", 1500);
}

function loadSceneFromJSONText(text) {
  try {
    const data = JSON.parse(text);
    scene.loadFromJSON(data, game);
    game.ui.showMessage(`Scene loaded: ${scene.name}`, 1500);
  } catch (error) {
    game.ui.showMessage(`Load failed: ${error.message}`, 2000);
  }
}

loadButton.addEventListener("click", async () => {
  const file = importInput.files?.[0];
  if (!file) {
    game.ui.showMessage("Choose a JSON file first.", 1500);
    return;
  }
  loadSceneFromJSONText(await file.text());
});

loadDemoButton.addEventListener("click", () => {
  scene.loadFromJSON({ name: "Empty" }, game);
  createDefaultScene();
});

game.start();
createDefaultScene();
