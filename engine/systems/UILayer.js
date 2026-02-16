export class UILayer {
  constructor(container) {
    this.container = container;
    this.messageEl = container.querySelector("[data-ui='message']");
    this.messageTimer = null;
  }

  showMessage(text, durationMs = 2500) {
    this.messageEl.textContent = text;
    this.messageEl.classList.add("visible");

    if (this.messageTimer) clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => {
      this.messageEl.classList.remove("visible");
    }, durationMs);
  }
}
