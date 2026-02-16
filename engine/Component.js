export class Component {
  constructor(type) {
    this.type = type;
    this.entity = null;
    this.enabled = true;
  }

  onAttach() {}

  onStart() {}

  onUpdate(_delta, _context) {}

  toJSON() {
    return {
      type: this.type,
      enabled: this.enabled,
    };
  }
}
