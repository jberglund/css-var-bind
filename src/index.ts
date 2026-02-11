/**
 * A custom element that binds input elements to a CSS variable.
 * It also syncs values between different inputs, like range and number.
 *
 * @element css-var-bind
 *
 * @attr {string} variable - **Required.** The CSS custom property name to bind to.
 *   Must start with `--` (e.g., `--scale`, `--primary-color`).
 *
 * @attr {string} [unit=""] - Optional unit to append to the value when setting the CSS variable.
 *   Common values: `px`, `%`, `em`, `rem`, `deg`, etc.
 *
 * @attr {string} [target] - CSS selector for the element on which to set the CSS variable.
 *   How this selector is resolved depends on the `strategy` attribute.
 *
 * @attr {"closest"|"global"|"self"} [strategy="closest"] - How to resolve the target selector.
 *   - `"closest"` — Uses `element.closest(target)` to find an ancestor (default).
 *   - `"global"` — Uses `document.querySelector(target)` for global lookup.
 *   - `"self"` — Ignores `target` and binds to the component itself.
 *
 * @example
 * ```html
 * <!-- Bind to a global element (document.querySelector) -->
 * <css-var-bind variable="--scale" unit="px" target=":root" strategy="global">
 *   <input type="range" min="0" max="100" />
 *   <input type="number" />
 * </css-var-bind>
 *
 * <!-- Bind to the closest ancestor with a class (default strategy) -->
 * <div class="card">
 *   <css-var-bind variable="--card-padding" unit="rem" target=".card">
 *     <input type="number" min="0" max="5" />
 *   </css-var-bind>
 * </div>
 *
 * <!-- Bind to the component itself -->
 * <css-var-bind variable="--opacity" strategy="self">
 *   <input type="range" min="0" max="1" step="0.1" />
 * </css-var-bind>
 * ```
 */

class CssVarBind extends HTMLElement {
  bindToElement: HTMLElement | null = null;
  cssVariableName: string = "";
  inputs: NodeListOf<HTMLInputElement> | null = null;
  unit: string = "";
  private boundHandleInput: (event: Event) => void;

  constructor() {
    super();
    this.boundHandleInput = this.handleInput.bind(this);
  }

  connectedCallback() {
    this.cssVariableName = this.getAttribute("variable") || "";
    this.unit = this.getAttribute("unit") || "";
    this.inputs = this.querySelectorAll("input");

    if (!this.cssVariableName.startsWith("--")) {
      console.error("CSS variable name must start with --");
      return;
    }

    if (!this.inputs.length) {
      console.warn("css-var-bind: No input elements found");
      return;
    }

    const target = this.getAttribute("target");
    const strategy = this.getAttribute("strategy") || "closest";

    switch (strategy) {
      case "global":
        this.bindToElement = target
          ? (document.querySelector(target) as HTMLElement)
          : null;
        break;
      case "self":
        this.bindToElement = this;
        break;
      default:
        this.bindToElement = target ? this.closest(target) : this;
        break;
    }

    if (!this.bindToElement) {
      console.warn(`css-var-bind: Target element "${target}" not found`);
      return;
    }

    this.inputs.forEach((input) => {
      this.setValueIfCSSPropertyExists();
      input.addEventListener("input", this.boundHandleInput);
    });
  }

  disconnectedCallback() {
    if (this.inputs) {
      this.inputs.forEach((input) => {
        input.removeEventListener("input", this.boundHandleInput);
      });
    }
  }

  private handleInput(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.handleSteppedInputs(event.target);
  }

  handleSteppedInputs(target: HTMLInputElement) {
    if (!this.bindToElement) return;

    this.bindToElement.style.setProperty(
      this.cssVariableName,
      target.value + this.unit,
    );

    this.syncInputs(target);
  }

  setValueIfCSSPropertyExists() {
    if (!this.bindToElement || !this.inputs) return;

    const root = getComputedStyle(this.bindToElement);

    this.inputs.forEach((input) => {
      if (input.type === "radio") return;
      if (input.type === "range") {
        const cssValue = root.getPropertyValue(this.cssVariableName);
        if (!cssValue) {
          console.warn(
            `css-var-bind: CSS variable ${this.cssVariableName} is not set on the target element`,
          );
        } else {
          input.value = cssValue;
        }
      }
      if (input.value) {
        // if input has a value already, set the css variable to that value
        this.bindToElement?.style.setProperty(
          this.cssVariableName,
          input.value + this.unit,
        );
      }
      if (input.value === "") {
        input.value = root.getPropertyValue(this.cssVariableName);
      }
    });
  }

  syncInputs(changedInput: HTMLInputElement) {
    if (!this.inputs) return;

    this.inputs.forEach((input) => {
      if (input !== changedInput) {
        input.value = changedInput.value;
      }
    });
  }
}

export default CssVarBind;

customElements.define("css-var-bind", CssVarBind);
