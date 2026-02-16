import { Component } from "../core/Component.js";

export class TransformComponent extends Component {
  constructor({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = {}) {
    super("TransformComponent");
    this.position = [...position];
    this.rotation = [...rotation];
    this.scale = [...scale];
  }

  toJSON() {
    return {
      type: this.type,
      position: [...this.position],
      rotation: [...this.rotation],
      scale: [...this.scale],
    };
  }

  static fromJSON(data = {}) {
    return new TransformComponent(data);
  }
}
