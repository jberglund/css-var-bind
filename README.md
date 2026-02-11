# css-var-bind

A lightweight web component that binds HTML input elements to CSS custom properties (variables).

## 🎨 [View Interactive Demos](https://jberglund.github.io/css-var-bind/)

## Installation

```bash
npm install css-var-bind
```

## Usage

```html
<css-var-bind variable="--scale" unit="px" target=":root" strategy="global">
  <input type="range" min="0" max="100" value="50" />
  <input type="number" min="0" max="100" value="50" />
</css-var-bind>
```

The component automatically:

- Updates the CSS variable when inputs change
- Syncs values between multiple inputs
- Applies the unit to the value

## Attributes

| Attribute  | Required | Default     | Description                                                     |
| ---------- | -------- | ----------- | --------------------------------------------------------------- |
| `variable` | Yes      | -           | CSS custom property name (must start with `--`)                 |
| `unit`     | No       | `""`        | Unit to append (e.g., `px`, `rem`, `%`, `deg`)                  |
| `target`   | No       | -           | CSS selector for the element to set the variable on             |
| `strategy` | No       | `"closest"` | How to resolve the target: `"closest"`, `"global"`, or `"self"` |

### Strategy Options

- **`closest`** (default): Finds the nearest ancestor matching the `target` selector
- **`global`**: Uses `document.querySelector(target)` for global lookup
- **`self`**: Sets the variable on the component itself (ignores `target`)

## Examples

**Color picker:**

```html
<css-var-bind target="body" variable="--bg-color">
  <input type="color" value="#b4d455" />
</css-var-bind>
```

**Scoped to ancestor:**

```html
<div class="card">
  <css-var-bind variable="--card-padding" unit="rem" target=".card">
    <input type="number" min="0" max="5" value="2" />
  </css-var-bind>
</div>
```

**Self-binding:**

```html
<css-var-bind variable="--opacity" strategy="self">
  <input type="range" min="0" max="1" step="0.1" value="1" />
</css-var-bind>
```

## License

MIT
