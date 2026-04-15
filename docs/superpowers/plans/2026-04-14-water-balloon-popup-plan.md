# Water Balloon Character Popup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add water balloon bounce animation on open, 200ms drag delay with press feedback, and velocity-based jelly squash/stretch during drag to the character image popup.

**Architecture:** Single-file modification to `CharacterImagePopup.jsx`. Add CSS keyframes via inline `<style>` tag. Add new state/refs for animation tracking, drag delay, and jelly deformation. Use `requestAnimationFrame` loop for velocity-based squash/stretch.

**Tech Stack:** React hooks (`useState`, `useRef`, `useEffect`), CSS `@keyframes`, `requestAnimationFrame`

---

### Task 1: Add Open Animation (Water Balloon Bounce)

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add new state and ref for animation tracking**

Add these to the component, right after the existing `aspectRatio` ref:

```js
const [isAnimating, setIsAnimating] = useState(false);
const [animationReady, setAnimationReady] = useState(false);
```

`isAnimating` — true when popup just opened, triggers the CSS animation.
`animationReady` — true after animation finishes, allows normal drag transforms.

- [ ] **Step 2: Trigger animation on `isOpen`**

In the existing `useEffect` that runs on `isOpen` (the one that calculates window dimensions), add `setIsAnimating(true)` and `setAnimationReady(false)` right after `setPosition(...)`:

```js
// Inside the existing useEffect, inside the `if (isOpen)` block,
// after the setPosition call:
setIsAnimating(true);
setAnimationReady(false);
```

- [ ] **Step 3: Add animation end handler**

Add this function after the `handleImageLoad` function:

```js
const handleAnimationEnd = () => {
    setIsAnimating(false);
    setAnimationReady(true);
};
```

- [ ] **Step 4: Add inline `<style>` for keyframes**

Add this at the top of the JSX return, before the main popup `<div>`, using a React fragment:

```jsx
if (!isOpen || !imageSrc) return null;

return (
    <>
        <style>{`
            @keyframes balloon-pop {
                0% { transform: scale(0) translateY(-30px); opacity: 0; }
                50% { transform: scale(1.15) translateY(5px); opacity: 1; }
                70% { transform: scale(0.95) translateY(-3px); }
                85% { transform: scale(1.03) translateY(1px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
        `}</style>
        <div
            className="fixed z-50 rounded-lg shadow-2xl flex flex-col"
            // ... rest of existing props
```

- [ ] **Step 5: Apply animation style to popup container**

Update the main popup `<div>` style object. Replace the existing `style={{...}}` on the container with:

```jsx
style={{
    left: position.x,
    top: position.y,
    width: imgSize.width,
    height: imgSize.height + 32,
    cursor: isDragging ? 'grabbing' : 'auto',
    backgroundColor: 'transparent',
    animation: isAnimating ? 'balloon-pop 600ms linear forwards' : 'none',
    transform: animationReady && (isDragging || isResizing)
        ? `scale(${jellyScale.x}, ${jellyScale.y})`
        : animationReady
            ? 'scale(1, 1)'
            : undefined,
}}
onAnimationEnd={handleAnimationEnd}
```

Note: `jellyScale` doesn't exist yet — it will be added in Task 3. For now, use `1, 1` as placeholders. The final code in Task 3 will fix this.

**Temporary fix for this task:** Change the transform line to:
```js
transform: animationReady ? 'scale(1, 1)' : undefined,
```

This will be updated in Task 3 when jellyScale is added.

- [ ] **Step 6: Reset animation state on close**

Add cleanup when popup closes. In the same `useEffect` that handles `isOpen`, add an else branch that resets animation state when `isOpen` is false:

```js
// Add at the bottom of the useEffect, after the if (isOpen) block:
return () => {
    setIsAnimating(false);
    setAnimationReady(false);
};
```

Wait — the useEffect doesn't have a cleanup function. Add it as the return value:

```js
useEffect(() => {
    if (isOpen) {
        // ... existing code ...
        setIsAnimating(true);
        setAnimationReady(false);
    }
    return () => {
        setIsAnimating(false);
        setAnimationReady(false);
    };
}, [isOpen]);
```

- [ ] **Step 7: Verify open animation works**

Run `npm run dev` and open the popup by clicking a character avatar. The popup should bounce in with the water balloon animation. The drag should work normally (no jelly yet, no delay yet).

- [ ] **Step 8: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add water balloon open animation to character popup"
```

---

### Task 2: Add Drag Delay with Press Feedback (200ms)

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add new refs for drag delay**

Add these after the existing refs:

```js
const dragStartTimeout = useRef(null);
const pendingDragStart = useRef({ x: 0, y: 0 });
const [isPressing, setIsPressing] = useState(false);
```

`dragStartTimeout` — holds the setTimeout ID for cleanup.
`pendingDragStart` — stores cursor position at mousedown for delta calculation.
`isPressing` — true during the 200ms "press" feedback window.

- [ ] **Step 2: Replace `handleStart` with delayed drag logic**

Replace the existing `handleStart` function with three new functions:

```js
const startDragDelay = (clientX, clientY) => {
    // Start the 200ms delay window
    pendingDragStart.current = { x: clientX, y: clientY };
    setIsPressing(true);

    dragStartTimeout.current = setTimeout(() => {
        // After 200ms, actually start dragging
        setIsPressing(false);
        setIsDragging(true);
        dragStartPos.current = { x: clientX, y: clientY };
        dragStartTimeout.current = null;
    }, 200);
};

const cancelDragDelay = () => {
    // Clear the timeout if mouse released before 200ms
    if (dragStartTimeout.current) {
        clearTimeout(dragStartTimeout.current);
        dragStartTimeout.current = null;
    }
    setIsPressing(false);
    setIsDragging(false);
};
```

Remove the old `handleStart` function's drag case. Keep the resize case (we'll handle resize separately).

- [ ] **Step 3: Update `handleMouseDown` to use delayed drag**

Replace the existing `handleMouseDown`:

```js
const handleMouseDown = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.close-button')) return;
    startDragDelay(e.clientX, e.clientY);
};
```

- [ ] **Step 4: Update `handleTouchStart` to use delayed drag**

Replace the existing `handleTouchStart`:

```js
const handleTouchStart = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.close-button')) return;
    const touch = e.touches[0];
    startDragDelay(touch.clientX, touch.clientY);
};
```

- [ ] **Step 5: Add mouseup/touchend handler for drag delay cancel**

The existing `handleEnd` function in the useEffect needs to also call `cancelDragDelay` when the drag was pending. Update the `handleEnd` function inside the main drag useEffect:

```js
const handleEnd = () => {
    cancelDragDelay();
    setIsDragging(false);
    setIsResizing(false);
};
```

- [ ] **Step 6: Add cleanup for drag timeout on unmount**

In the same useEffect that manages drag listeners, add cleanup for the timeout in the return function. The return already exists, add the clearTimeout to it:

```js
return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleEnd);
    cancelDragDelay();
};
```

- [ ] **Step 7: Add press scale visual feedback**

Update the popup container style to apply the 95% press scale during the delay window. Update the `transform` line in the style object:

```js
transform: isPressing
    ? 'scale(0.95, 0.95)'
    : animationReady && (isDragging || isResizing)
        ? `scale(${jellyScale.x}, ${jellyScale.y})`
        : animationReady
            ? 'scale(1, 1)'
            : undefined,
```

**Temporary fix for this task:** Use `1, 1` instead of `jellyScale` since it doesn't exist yet:

```js
transform: isPressing
    ? 'scale(0.95, 0.95)'
    : animationReady && (isDragging || isResizing)
        ? 'scale(1, 1)'
        : animationReady
            ? 'scale(1, 1)'
            : undefined,
```

This will be updated in Task 3.

- [ ] **Step 8: Verify drag delay works**

Run `npm run dev`. Open the popup. Click and hold — the popup should squish to 95% for ~200ms, then start following your cursor. Release before 200ms — nothing happens.

- [ ] **Step 9: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add 200ms drag delay with press feedback to character popup"
```

---

### Task 3: Add Jelly Trail (Velocity-Based Squash/Stretch)

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add jellyScale state and velocity tracking refs**

Add after existing state:

```js
const [jellyScale, setJellyScale] = useState({ x: 1, y: 1 });
const lastFramePos = useRef({ x: 0, y: 0 });
const lastFrameTime = useRef(0);
const velocityWindow = useRef([]);
const rafId = useRef(null);
```

- [ ] **Step 2: Add jelly scale calculation function**

Add this function after `handleAnimationEnd`:

```js
const updateJellyScale = (clientX, clientY) => {
    const now = performance.now();
    const dt = now - lastFrameTime.current;

    if (dt === 0) return;

    const dx = clientX - lastFramePos.current.x;
    const dy = clientY - lastFramePos.current.y;
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 16; // normalize to ~60fps

    // Rolling window of last 3 velocities
    velocityWindow.current.push(velocity);
    if (velocityWindow.current.length > 3) {
        velocityWindow.current.shift();
    }
    const avgVelocity = velocityWindow.current.reduce((a, b) => a + b, 0) / velocityWindow.current.length;

    // Map velocity to squash factor: clamp between 0.85 and 1.0
    const squash = 1 - Math.min(avgVelocity * 0.02, 0.15);
    const stretch = 1 / squash; // maintain volume

    setJellyScale({ x: squash, y: stretch });

    lastFramePos.current = { x: clientX, y: clientY };
    lastFrameTime.current = now;
};
```

- [ ] **Step 3: Add requestAnimationFrame loop for jelly during drag**

Modify the drag `useEffect`. Inside the `handleMove` function, when `isDragging` is true, call `updateJellyScale`:

```js
const handleMove = (clientX, clientY) => {
    if (isDragging) {
        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        setPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));
        dragStartPos.current = { x: clientX, y: clientY };

        // Update jelly scale based on velocity
        updateJellyScale(clientX, clientY);
    } else if (isResizing) {
        // ... existing resize code unchanged ...
    }
};
```

- [ ] **Step 4: Reset jelly scale when drag ends**

Update `handleEnd` to reset jelly scale smoothly when drag stops:

```js
const handleEnd = () => {
    cancelDragDelay();
    setIsDragging(false);
    setIsResizing(false);
    // Smoothly snap jelly back to normal
    setJellyScale({ x: 1, y: 1 });
    velocityWindow.current = [];
};
```

- [ ] **Step 5: Update transform to use jellyScale**

Update the popup container style `transform` to use the actual `jellyScale` values:

```js
transform: isPressing
    ? 'scale(0.95, 0.95)'
    : animationReady && (isDragging || isResizing)
        ? `scale(${jellyScale.x}, ${jellyScale.y})`
        : animationReady
            ? 'scale(1, 1)'
            : undefined,
```

- [ ] **Step 6: Clean up animation frame on unmount**

Add cleanup for `rafId` in the component. Since we're not using a separate rAF loop (we update jelly inline during drag events), we can remove the `rafId` ref — it's not needed with this approach. Remove the `rafId` ref declaration from Step 1.

Actually, the inline update approach in Step 3 is simpler and doesn't need rAF. Remove `rafId` from the refs added in Step 1.

- [ ] **Step 7: Verify jelly trail works**

Run `npm run dev`. Open the popup. Drag it quickly — the popup should squish and stretch based on movement speed. Stop moving — it stays at current scale. Release — it snaps back to `scale(1, 1)`.

- [ ] **Step 8: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add velocity-based jelly trail squash/stretch during drag"
```

---

### Task 4: Final Polish & Cleanup

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Ensure resize handle bypasses drag delay**

The resize handle should NOT have the 200ms delay — it should work immediately. Verify that `handleResizeMouseDown` still calls `handleStart` with type `'resize'` directly. Update it to:

```js
const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    // Resize bypasses drag delay
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    initialImgSize.current = { ...imgSize };
};
```

Similarly for touch:

```js
const handleResizeTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsResizing(true);
    resizeStartPos.current = { x: touch.clientX, y: touch.clientY };
    initialImgSize.current = { ...imgSize };
};
```

- [ ] **Step 2: Add cursor style for pressing state**

Update the `cursor` style on the popup container to give feedback during the press delay:

```js
cursor: isPressing ? 'grab' : isDragging ? 'grabbing' : 'auto',
```

- [ ] **Step 3: Verify no animation conflicts**

Test the full flow:
1. Open popup → water balloon bounce plays (600ms)
2. Wait for animation to finish
3. Click and hold → press scale (95%) for 200ms
4. Drag moves popup with jelly wobble
5. Release → snap back to normal scale
6. Resize handle works immediately without delay
7. Close and reopen → animation plays again fresh

- [ ] **Step 4: Run the dev server and do a full test**

Run `npm run dev`, open the app, and test the complete interaction flow.

- [ ] **Step 5: Final commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "fix: polish drag delay, resize bypass, and cursor styles"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Water balloon open animation → Task 1 (CSS keyframes, state, handler)
- ✅ Drag delay 200ms → Task 2 (timeout, press feedback, cancel on early release)
- ✅ Jelly trail during drag → Task 3 (velocity tracking, squash/stretch, reset on release)
- ✅ Resize bypass → Task 4 (resize handle skips delay)
- ✅ Cursor styles → Task 4 (press/drag/auto states)
- ✅ Animation reset on close → Task 1 (cleanup in useEffect return)

**2. Placeholder scan:**
- No TBDs, TODOs, or vague references
- All code blocks contain actual implementation code
- All function names and state variables are consistent across tasks

**3. Type/signature consistency:**
- `jellyScale` defined in Task 3 Step 1 as `{ x: number, y: number }`, used consistently in Steps 3, 5
- `isPressing` defined in Task 2 Step 1, used in Task 2 Step 7 and Task 4 Step 2
- `animationReady` defined in Task 1, used in Tasks 2, 3, 4
- `dragStartTimeout`, `pendingDragStart` — defined Task 2, used consistently
- Transform logic builds incrementally: Task 1 placeholder → Task 2 press scale → Task 3 jelly scale → Task 4 cursor polish

**4. No tasks reference undefined functions/types.**

Plan is ready for execution.
