# Usage Guide

## 1. Go to Definition

- **Action**: Ctrl+Click or F12 on `<my-component>`.  
- **Result**: Opens `my-component.tsx`.

## 2. Autocomplete

### Component Tags

- Type `<` → select a component → tag snippet.

### Props / Events / Slots / Methods

- Inside `<my-component ` → **Space** or **Ctrl+Space** → see grouped list:
  - **⸺ Props ⸺**  
    `foo="…"`
  - **⸺ Events ⸺**  
    `onBar="…"`
  - **⸺ Slots ⸺**  
    `name="slotName"`
  - **⸺ Methods ⸺**  
    `doSomething()`

## 3. Hover

- Hover over `<my-component>` → tooltip:
  ```html
  ```html
  <my-component>
  ```
  Component docs...
  **Path:** `src/components/my-component.tsx`
  ```

## 4. Document Links

- Hover near `<my-component>` → click link icon → jump to source.

## 5. Find Usages (CodeLens)

- Above component class:
  ```ts
  // 🔍 Find <my-component> usages
  ```
- Click to list all usage locations.

## 6. Outline Integration

- Open Outline pane → under “Stencil Navigator” → see Props, Events, Slots.
