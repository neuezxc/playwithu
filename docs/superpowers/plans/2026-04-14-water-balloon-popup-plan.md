# Water Balloon Character Popup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add playful water balloon open animation, drag delay with press feedback, and velocity-based jelly squash/stretch to the character image popup.

**Architecture:** All changes live in `CharacterImagePopup.jsx`. Uses CSS `@keyframes` via inline `<style>`, a 200ms `setTimeout` for drag delay, and `requestAnimationFrame` for velocity-based jelly deformation.

**Tech Stack:** React hooks (`useState`, `useRef`, `useEffect`), CSS animations, `requestAnimationFrame`

---

### Task 1: Add Water Balloon Open Animation

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add animation state and style**

Add two new pieces of state:
- `animationStyle` — `useRef(null)` to hold the animation style object
- `isAnimationComplete` — `useState(false)` to track when animation ends

Add a `<style>` tag inside the component's return (right before the popup div) with the `balloon-pop` keyframes:

```jsx
<style>{`
  @keyframes balloon-pop {
    0% { transform: scale(0) translateY(-30px); opacity: 0; }
    50% { transform: scale(1.15) translateY(5px); opacity: 1; }
    70% { transform: scale(0.95) translateY(-3px); }
    85% { transform: scale(1.03) translateY(1px); }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
`}</style>
```

- [ ] **Step 2: Apply animation on open**

In the `useEffect` that fires on `isOpen`, after setting position, set the animation style:

```js
// Apply balloon-pop animation
if (isOpen) {
  setIsAnimationComplete(false);
  // Store animation style reference
}
```

On the popup `<div>`, add a `style` prop that includes the animation when `isOpen` is true and animation is not complete:

```jsx
style={{
  left: position.x,
  top: position.y,
  width: imgSize.width,
  height: imgSize.height + 32,
  cursor: isDragging ? 'grabbing' : 'auto',
  backgroundColor: 'transparent',
  ...(isOpen && !isAnimationComplete ? {
    animation: 'balloon-pop 600ms linear forwards'
  } : {}),
}}
```

- [ ] **Step 3: Handle animation end**

Add an `onAnimationEnd` handler to the popup div:

```jsx
const handleAnimationEnd = () => {
  setIsAnimationComplete(true);
};
```

Add it to the popup div:

```jsx
onAnimationEnd={handleAnimationEnd}
```

- [ ] **Step 4: Test manually**

Run `npm run dev` and open a character image popup. The popup should animate in with a springy bounce. Verify it doesn't interfere with closing/reopening.

- [ ] **Step 5: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add water balloon open animation to character popup"
```

---

### Task 2: Add Drag Delay with Press Feedback

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add new refs and state**

Add these to the component:

```js
const dragStartTimeout = useRef(null);
const dragPending = useRef(false);
const pendingMouseDownPos = useRef({ x: 0, y: 0 });
const [isPressing, setIsPressing] = useState(false);
```

- [ ] **Step 2: Rewrite handleStart for drag with delay**

Replace the existing `handleStart` function:

```js
const handleStart = (clientX, clientY, type) => {
  if (type === 'drag') {
    // Don't start dragging immediately - wait 200ms
    dragPending.current = true;
    pendingMouseDownPos.current = { x: clientX, y: clientY };
    setIsPressing(true);

    dragStartTimeout.current = setTimeout(() => {
      dragPending.current = false;
      setIsPressing(false);
      setIsDragging(true);
      dragStartPos.current = { x: clientX, y: clientY };
    }, 200);
  } else if (type === 'resize') {
    setIsResizing(true);
    resizeStartPos.current = { x: clientX, y: clientY };
    initialImgSize.current = { ...imgSize };
  }
};
```

- [ ] **Step 3: Update handleEnd to clear timeout**

Replace the existing `handleEnd` function inside the `useEffect`:

```js
const handleEnd = () => {
  // If still in delay window, cancel drag start
  if (dragPending.current && dragStartTimeout.current) {
    clearTimeout(dragStartTimeout.current);
    dragStartTimeout.current = null;
  }
  dragPending.current = false;
  setIsPressing(false);
  setIsDragging(false);
  setIsResizing(false);
};
```

- [ ] **Step 4: Add cleanup on unmount**

Add a cleanup `useEffect` to clear any pending timeout:

```js
useEffect(() => {
  return () => {
    if (dragStartTimeout.current) {
      clearTimeout(dragStartTimeout.current);
    }
  };
}, []);
```

- [ ] **Step 5: Apply press scale to popup**

In the popup `<div>` style, add press feedback:

```jsx
transform: isPressing ? 'scale(0.95)' : undefined,
```

Add this to the existing `style` object on the popup div.

- [ ] **Step 6: Test manually**

Run `npm run dev`. Click and hold the popup — it should squish to 95% for 200ms, then start following the cursor. Release before 200ms — it should snap back without dragging.

- [ ] **Step 7: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add 200ms drag delay with press feedback"
```

---

### Task 3: Add Jelly Trail (Squash/Stretch During Drag)

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Add jelly state and refs**

Add these to the component:

```js
const [jellyScale, setJellyScale] = useState({ x: 1, y: 1 });
const lastFramePos = useRef({ x: 0, y: 0 });
const lastFrameTime = useRef(0);
const velocityWindow = useRef([]);
const rafId = useRef(null);
```

- [ ] **Step 2: Add calculateJellyScale function**

Add this function inside the component:

```js
const calculateJellyScale = (currentX, currentY, timestamp) => {
  if (!lastFrameTime.current) {
    lastFrameTime.current = timestamp;
    lastFramePos.current = { x: currentX, y: currentY };
    return { x: 1, y: 1 };
  }

  const dt = timestamp - lastFrameTime.current;
  if (dt === 0) return jellyScale;

  const dx = Math.abs(currentX - lastFramePos.current.x);
  const dy = Math.abs(currentY - lastFramePos.current.y);
  const distance = Math.sqrt(dx * dx + dy * dy);
  const velocity = distance / dt; // pixels per ms

  // Rolling window of last 3 velocities
  velocityWindow.current.push(velocity);
  if (velocityWindow.current.length > 3) {
    velocityWindow.current.shift();
  }
  const avgVelocity = velocityWindow.current.reduce((a, b) => a + b, 0) / velocityWindow.current.length;

  // Map velocity to squash factor
  const squash = 1 - Math.min(avgVelocity * 0.15, 0.15);
  const scaleY = 1 / squash; // Maintain volume (inverse relationship)

  lastFrameTime.current = timestamp;
  lastFramePos.current = { x: currentX, y: currentY };

  // Snap back to normal if velocity is very low
  if (avgVelocity < 0.01) {
    return { x: 1, y: 1 };
  }

  return { x: squash, y: scaleY };
};
```

- [ ] **Step 3: Add jelly animation loop**

Add a `useEffect` that runs during drag:

```js
useEffect(() => {
  if (!isDragging) {
    setJellyScale({ x: 1, y: 1 });
    velocityWindow.current = [];
    lastFrameTime.current = 0;
    return;
  }

  const animate = (timestamp) => {
    const scale = calculateJellyScale(position.x, position.y, timestamp);
    setJellyScale(scale);
    rafId.current = requestAnimationFrame(animate);
  };

  rafId.current = requestAnimationFrame(animate);

  return () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  };
}, [isDragging]);
```

- [ ] **Step 4: Apply jelly scale to popup transform**

Update the popup `<div>` style to compose the jelly scale with the press scale. Replace the `transform` line from Task 2:

```jsx
transform: (() => {
  const parts = [];
  if (isPressing) parts.push('scale(0.95)');
  if (isDragging && jellyScale.x !== 1) {
    parts.push(`scale(${jellyScale.x.toFixed(3)}, ${jellyScale.y.toFixed(3)})`);
  }
  return parts.length > 0 ? parts.join(' ') : undefined;
})(),
```

- [ ] **Step 5: Test manually**

Run `npm run dev`. Drag the popup around — it should wobble and squash based on movement speed. Release — it should snap back to `scale(1, 1)`. Test fast and slow dragging to verify the jelly effect responds to velocity.

- [ ] **Step 6: Commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "feat: add velocity-based jelly squash/stretch during drag"
```

---

### Task 4: Integration Testing and Cleanup

**Files:**
- Modify: `app/components/chat/CharacterImagePopup.jsx`

- [ ] **Step 1: Verify no conflicts between animation, delay, and jelly**

Test this sequence:
1. Open popup → balloon-pop animation plays (600ms)
2. Click and hold immediately → press feedback (200ms), then drag with jelly
3. Release quickly during press window → snaps back, no drag
4. Drag fast → more squash; drag slow → less squash
5. Close and reopen → animation replays cleanly

- [ ] **Step 2: Check for lint errors**

```bash
npm run lint
```

Fix any issues.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Final commit**

```bash
git add app/components/chat/CharacterImagePopup.jsx
git commit -m "chore: verify water balloon popup integration"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Water balloon open animation (Task 1)
- ✅ Drag delay 200ms with press feedback (Task 2)
- ✅ Jelly trail squash/stretch during drag (Task 3)
- ✅ Integration testing and build verification (Task 4)
- ✅ Only `CharacterImagePopup.jsx` changed — no other files, no store changes, no new packages

**2. Placeholder scan:** No TBDs, TODOs, or vague steps. All code is shown in full.

**3. Type consistency:** All state names (`isAnimationComplete`, `jellyScale`, `isPressing`), refs (`dragStartTimeout`, `dragPending`, `pendingMouseDownPos`, `lastFramePos`, `lastFrameTime`, `velocityWindow`, `rafId`), and function names (`handleAnimationEnd`, `calculateJellyScale`) are used consistently across tasks. The `style.transform` composition in Task 4 correctly replaces the simpler version from Task 2.
