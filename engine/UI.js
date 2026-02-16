export class UI {
  constructor(root) {
    this.root = root;
    this.message = root.querySelector("[data-ui-message]");
    this.clearTimer = null;
  }

  showMessage(text, durationMs = 2800) {
    this.message.textContent = text;
    this.message.classList.add("visible");

    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }

    this.clearTimer = setTimeout(() => {
      this.message.classList.remove("visible");
    }, durationMs);
  }
}
