import { Component } from "../Component.js";

export class TriggerComponent extends Component {
  constructor({ message = "You feel like you're being watched..." } = {}) {
    super("TriggerComponent");
    this.message = message;
    this.triggered = false;
  }

  onCollisionEnter(otherEntity, context) {
    if (this.triggered) {
      return;
    }

    this.triggered = true;
    context?.ui?.showMessage(this.message);
    context?.logger?.(`Trigger fired: ${this.entity.name} collided with ${otherEntity.name}`);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      message: this.message,
    };
  }

  static fromJSON(data) {
    return new TriggerComponent(data);
  }
}
