# Aligning Lazy Mouse with Base Game FS25 Input & Autoscroll Behaviors

Align the Lazy Mouse stabilizer with native Farming Simulator 25 base game engine behaviors, eliminating custom camera/scrolling conflicts and ensuring the primary hardware mouse has instant 1:1 control over menus when idle.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your direction to **use base game behaviors and reduce conflict with engine code**:
> 1. **Primary Mouse Deactivation When Idle (Mouse Button UP)**: When moving the cursor without holding a click, the primary hardware mouse position `(posX, posY)` is tested against the menu boundaries. The exact pixel the primary mouse enters the menu, Lazy Mouse deactivates, passes raw input directly to GIANTS GUI, and snaps the brush anchor to `(posX, posY)` with zero leash drag.
> 2. **Base Game Autoscroll Preservation When Active (Mouse Button DOWN)**: When actively clicking/sculpting/painting, the stroke is allowed to continue naturally. GIANTS Engine's native viewport edge-panning/autoscroll operates unhindered without custom hooks or camera interference.
> 3. **Instant Release on Mouse UP**: As soon as the mouse button is released (`isUp`), the dragging flag is cleared immediately. If the cursor is over a menu item, it is freed instantly for crisp, zero-latency 1:1 clicking.

---

### 1. Architectural Strategy & Base Game Integration

#### Why Previous Logic Created the Halfway Overlap Sensation
In earlier revisions:
- If the deactivation check evaluated the delayed `lazyMouseX, lazyMouseY` position (or if the leash pulled the reticle behind the cursor), the primary hardware cursor was already deep inside the menu buttons while the trailing reticle was still in terrain.
- Conversely, if the stabilizer was unconditionally suppressed mid-stroke, drawing a long continuous road or terrace to the edge of the screen would abruptly abort or disrupt FS25's built-in camera edge-panning.

#### The Clean Base Game Solution
By cleanly separating the **Idle State** from the **Active Stroke State**:
1. **Idle State (`not self.isDragging`)**:
   - `posX, posY` (the primary hardware mouse) is tested against the whitelisted menu widgets and HUD-scale-aware margin.
   - If over the menu:
     - `origMouseEvent(screenSelf, posX, posY, isDown, isUp, button, eventUsed)` is called with 100% raw hardware coordinates.
     - `self.lazyMouseX = posX` and `self.lazyMouseY = posY` are continually synced.
     - The leash is hidden/paused so no visual tether stretches onto the UI.
2. **Active Stroke State (`self.isDragging`)**:
   - The smoothed position `(lazyMouseX, lazyMouseY)` drives the terrain brush, allowing the base game to handle stroke continuity and native edge autoscrolling.
   - The brush position is safely clamped at the terrain boundary so paint/sculpting does not spill underneath UI cards.
3. **Stroke End (`isUp`)**:
   - `self.isDragging = false`.
   - If the pointer is now over a menu element, it immediately switches to the Idle State with zero delay.

---

### 2. Implementation Steps

#### Step 1: Update Lua Mouse Event Handler in `src/lib/modGenerator.ts`
- In `ConstructionScreen.mouseEvent`:
  - Track `isDown` and `isUp` to maintain `self.isDragging`.
  - When `isUp` occurs, immediately set `self.isDragging = false`.
  - Before deciding whether to smooth, check if the **primary raw mouse** `(posX, posY)` is in the terrain viewport.
  - If `not self.isDragging` and the primary mouse is over the menu:
    - Immediately bypass smoothing.
    - Set `self.lazyMouseX = posX` and `self.lazyMouseY = posY`.
    - Pass raw `(posX, posY)` to base `origMouseEvent`.
  - If `self.isDragging`:
    - Clamp smoothed brush coordinates to the terrain boundary so brush actions stay in bounds while base game edge-autoscroll operates naturally.

#### Step 2: Update Web Preview Simulator in `src/components/InteractiveHudPreview.tsx`
- Mirror this exact dual-state behavior:
  - When mouse is UP: primary cursor deactivates the moment it crosses the menu boundary.
  - When mouse is DOWN: active trail continues to the edge, clamps cleanly at the boundary line, and demonstrates smooth stroke completion.
  - When mouse is released over the menu, 1:1 raw mouse mode is immediately restored.

#### Step 3: Verification & Compilation
- Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
