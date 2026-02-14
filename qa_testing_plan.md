# Project BRUEGEL: Quality Assurance & Testing Plan

**Version:** 1.0.0
**Date:** February 14, 2026

---

## 1. Testing Strategy Overview

The goal of this QA plan is to ensure **Project BRUEGEL** delivers a premium, crash-free, and high-performance experience. As a precision drawing tutor, the application requires rigorous testing of both **logical correctness** (scoring accuracy) and **perceived performance** (input latency, frame rate).

### 1.1 Core Principles
1.  **"Golden Path" Stability**: The user journey from Level 1 to Level 20 must be unbreakable.
2.  **Performance First**: Drawing latency must stay below 16ms (60fps target).
3.  **Zero Progression Loss**: User progress (stars, unlocks) must never be lost unexpectedly.

---

## 2. Test Pyramid & Coverage

We will implement a 4-layer testing strategy:

### 2.1 Unit Testing (The Foundation)
*   **Focus**: Pure logic and math functions.
*   **Tools**: `Vitest` (fast, native Vite integration).
*   **Key Coverage Areas**:
    *   **`geometry.ts`**:
        *   Verify `calculateScore` returns 100 on perfect input.
        *   Verify penalty scaling (does a 10px deviation result in the expected score deduction?).
        *   Verify `simplifyPath` reduces point count without losing shape fidelity.
    *   **`tiers.ts` & `levelPaths.ts`**:
        *   Validate data integrity (no missing IDs, no NaN coordinates).
    *   **`useLevelLoader.ts`**:
        *   Verify it returns the correct structure for a given ID.

### 2.2 Component Testing
*   **Focus**: React components rendering correctly in isolation.
*   **Tools**: `Vitest` + `React Testing Library`.
*   **Key Coverage Areas**:
    *   **`DrawingCanvas`**:
        *   Does it render the canvas?
        *   Does it fire `onDrawStart` and `onDrawEnd` events?
    *   **`LevelMap`**:
        *   Does it render the correct number of nodes based on `TIERS` data?
        *   Do locked nodes effectively block interaction?
    *   **`Skeleton`**:
        *   Does it render without crashing when props are missing?

### 2.3 Integration Testing
*   **Focus**: Modules working together.
*   **Tools**: `Vitest` + `RenderHook`.
*   **Key Coverage Areas**:
    *   **Progression System**:
        *   Test `useProgressStore` + `LessonView`.
        *   Scenario: Complete Level 1 with 100% score -> Verify `progress` store updates -> Verify Level 2 unlocks.
    *   **Theme Engine**:
        *   Test `ThemeContext` + `LevelMap`.
        *   Scenario: Switch from Tier 1 to Tier 2 -> Verify CSS variables update.

### 2.4 End-to-End (E2E) Testing
*   **Focus**: Critical User Journeys (CUJ) in a real browser environment.
*   **Tools**: `Playwright`.
*   **Key Scenarios**:
    *   **CUJ-01: The First Steps**:
        1.  Open App (at Map).
        2.  Click Level 1.
        3.  Draw a line (simulate input events).
        4.  Verify Success Modal appears.
        5.  Click "Next Level".
        6.  Verify Level 2 loads.
    *   **CUJ-02: Persistence**:
        1.  Complete Level 1.
        2.  Reload Page.
        3.  Verify Level 1 is still marked as completed (green star).

---

## 3. Performance Benchmarks

Since this is a drawing app, standard web metrics (LCP, FID) are insufficient. We need **Interaction** metrics.

### 3.1 Metrics to Track
1.  **Input Latency**: Time from `pointermove` to `canvas.render`. Target: < 16ms.
2.  **Frame Rate Consistency**: No drops below 55fps during active drawing.
3.  **Memory Leak Check**: Memory usage should not grow linearly with each level load.

### 3.2 Automated Checks
*   **Lighthouse CI**: Run on every PR to catch regression in bundle size or initial load time.
*   **Playwright Tracing**: Capture performance traces during E2E runs to identify slow frames.

---

## 4. Accessibility (A11y) & Compatibility

*   **Keyboard Navigation**: All menus and the `LevelMap` must be navigable via Tab/Enter.
*   **Touch Targets**: All interactive elements (buttons, nodes) must be at least 44x44px.
*   **Screen Readers**: Images/Canvas must have `aria-label` describing the content (e.g., "Canvas: Draw a vertical line").
*   **Device Support**:
    *   Test on: Desktop (Chrome/Edge), Tablet (iPad Safari), Mobile (Android Chrome).

---

## 5. Implementation Roadmap

### Phase 6.1: Setup (Immediate)
- [ ] Install `vitest`, `jsdom`, `@testing-library/react`.
- [ ] Configure `vitest.config.ts`.
- [ ] Add `test` script to `package.json`.

### Phase 6.2: Critical Unit Tests
- [ ] Write `src/features/drawing/utils/__tests__/geometry.test.ts`.
- [ ] Write `src/data/__tests__/integrity.test.ts`.

### Phase 6.3: Integration & Store
- [ ] Write `src/store/__tests__/progress.test.ts`.

### Phase 6.4: E2E Setup
- [ ] Install `playwright`.
- [ ] Create `e2e/smoketest.spec.ts`.


---

## 6. Regression Testing (Known Critical Issues)

These specific scenarios address previously fixed high-severity bugs. They MUST be tested before every release.

### 6.1 The "Horizon" Alignment
*   **Target**: `LessonView` resizing logic.
*   **Scenario**:
    1.  Open Level 2 ("Horizon").
    2.  Resize the browser window violently (change aspect ratio from wide to tall).
    3.  **Pass Criteria**: The dotted line **remains perfectly centered** and never drifts off-screen.

### 6.2 Toolbar Clearance
*   **Target**: Level 3 ("The Corner") / Asymmetric Padding.
*   **Scenario**:
    1.  Open Level 3.
    2.  Draw the bottom-most horizontal line of the "L".
    3.  **Pass Criteria**: The line is drawn **above** the floating Toolbar. The mouse cursor does not trigger hover effects on the Toolbar buttons while drawing the path.

---

**Approved By:** ____________________ (QA Lead)
