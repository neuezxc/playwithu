# Water Balloon Character Popup — Design Spec

## Problem

The character image popup exists and works, but the open animation is instant and dragging feels rigid. Users want a more playful, organic interaction.

## Solution

Add three animation enhancements to `CharacterImagePopup.jsx`:
1. **Water balloon open animation** — spring-like bounce on mount
2. **Drag delay** — 200ms lag before popup follows cursor, with "press" feedback
3. **Jelly trail during drag** — velocity-based squash/stretch deformation

## Open Animation

**Mechanism:** CSS `@keyframes` defined inline via `<style>` tag in the component (no need to touch `globals.css`).

**Keyframes (`balloon-pop`):**
```css
@keyframes balloon-pop {
  0% { transform: scale(0) translateY(-30px); opacity: 0; }
  50% { transform: scale(1.15) translateY(5px); opacity: 1; }
  70% { transform: scale(0.95) translateY(-3px); }
  85% { transform: scale(1.03) translateY(1px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
```

**Duration:** 600ms
**Easing:** linear (the keyframe interpolation creates the spring feel)
**Applied:** via inline `style.animation` on the popup container when `isOpen` becomes true.
**Cleanup:** Animation class/style removed after `animationend` event to avoid interfering with drag transforms.

## Drag Delay (200ms)

**Mechanism:** Instead of setting `isDragging = true` on `mousedown`, start a 200ms `setTimeout`. Store cursor position at mousedown time. During the delay window:
- Track cursor movement for distance calculation
- Apply a "press" scale of 0.95 to the popup (squish feedback)
- Popup stays at original position

**After 200ms:**
- If mouse is still held down, set `isDragging = true`
- Calculate delta from *original* position (not current cursor) so there's no position jump
- Popup starts following normally

**If mouse released before 200ms:** Clear timeout, no drag occurs.

**State changes:**
- `dragStartTimeout` — ref holding the timeout ID
- `dragPending` — boolean flag for "waiting for delay" state
- `pendingOffset` — stores the cursor position at mousedown for delta calculation after delay

## Jelly Trail (Squash/Stretch During Drag)

**Mechanism:** Track drag velocity over short time windows using `requestAnimationFrame`.

**Calculation:**
- Each frame, compute `velocity = distance_moved_since_last_frame`
- Map velocity to a deformation factor: `squash = 1 - clamp(velocity * 0.02, 0, 0.15)`
- Apply as `scale(squash, 1/squash)` — squishes horizontally, stretches vertically
- When velocity drops below threshold (e.g., < 1px/frame), snap back to `scale(1, 1)`

**Applied via:** CSS `transform: scale(sx, sy)` on the popup container. Note: this must compose with the open animation transform. Since the open animation finishes before dragging starts (600ms < 200ms delay + drag), they don't conflict. During drag, the jelly scale is applied on top of the position offset.

**Performance:** Uses `requestAnimationFrame` for 60fps smooth updates. Velocity tracking uses a small rolling window (last 3 frames averaged).

## Implementation Details

**File changed:** Only `app/components/chat/CharacterImagePopup.jsx`

**New state:**
- `isAnimationComplete` — boolean, tracks when open animation ends
- `jellyScale` — `{ x: number, y: number }`, default `{ x: 1, y: 1 }`
- `isPressing` — boolean for the 200ms "press" feedback state

**New refs:**
- `dragStartTimeout` — `useRef(null)`, holds the setTimeout ID
- `lastFramePos` — `useRef({ x: 0, y: 0 })`, cursor pos at last frame
- `lastFrameTime` — `useRef(0)`, timestamp of last frame
- `velocityWindow` — `useRef([])`, rolling array of recent velocities
- `rafId` — `useRef(null)`, animation frame ID for cleanup

**New functions:**
- `handleMouseDown` — starts 200ms timeout instead of immediate drag, applies press scale
- `handleMouseUp` — clears timeout if drag didn't start, ends drag + jelly animation
- `calculateJellyScale(dx, dy, dt)` — computes squash/stretch from velocity
- `onAnimationEnd` — sets `isAnimationComplete = true`, enables drag transforms

**CSS:** Inline `<style>` tag rendered once in the component for `@keyframes balloon-pop`.

## User Experience Flow

1. User clicks avatar → popup appears with water balloon bounce (600ms)
2. User clicks and holds popup → popup squishes to 95% for up to 200ms
3. After 200ms → popup "picks up" and follows cursor with jelly wobble
4. User releases → popup stays at current position, snap back to `scale(1, 1)`
5. User can then drag again (full delay + jelly), resize, or close

## No other files change. No store changes. No new packages.
