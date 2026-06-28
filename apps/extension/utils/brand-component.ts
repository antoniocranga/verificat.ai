export class BrandName extends HTMLElement {
  connectedCallback() {
    this.innerHTML =
      'verificat<span style="color: var(--color-accent)">.xyz</span>';
  }
}

export function registerBrandComponent() {
  if (!customElements.get("brand-name")) {
    customElements.define("brand-name", BrandName);
  }
}
