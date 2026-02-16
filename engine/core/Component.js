export class Component {
  constructor(type) {
    this.type = type;
    this.entity = null;
  }

  onAttach(_entity, _scene, _game) {}

  onDetach(_entity, _scene, _game) {}

  update(_delta, _scene, _game) {}

  toJSON() {
    return { type: this.type };
  }
}
