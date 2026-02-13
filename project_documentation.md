# Project BRUEGEL: Comprehensive Development Documentation

**Version:** 0.5.0 (The "Golden Path" Update)
**Date:** February 14, 2026
**Author:** Antigravity (AI Agent) & User

---

## 1. Executive Summary

This document details the extensive development work undertaken to transform the "AI Drawing Tutor" (Project BRUEGEL) from a technical prototype into a scalable, artistically polished educational game. 

Over the course of Phases 4 and 5, we have:
1.  **Refactored the core architecture** to a feature-based structure for scalability.
2.  **Implemented a scalable data layer**, moving from procedural generation to explicit, artist-curated content.
3.  **Built a professional Theme Engine**, allowing for dynamic, "hot-swappable" visual identities (Museum vs. Academy).
4.  **Optimized performance** for touch devices and ensured a 60fps drawing experience.
5.  **Expanded content** to 20 unique levels, defining the "Golden Path" curriculum.

---

## 2. Architectural Refactoring (Phase 4.1)

### 2.1 The Problem
The original codebase was a flat, monolithic structure. Components were tightly coupled, and business logic (level generation, scoring) was mixed with UI code. As we planned to add more tiers and complex mechanics, this structure became a bottleneck.

### 2.2 The Solution: Feature-Based Architecture
We adopted a **Feature-Sliced Design** approach. We reorganized `src/` into strictly defined domains:

*   **`src/features/`**:
    *   **`drawing/`**: Contains `DrawingCanvas`, `GhostOverlay`, and the core `geometry.ts` utilities. This isolates the "physics" of the game.
    *   **`navigation/`**: Contains `LevelMap`, handling the scrolling world and level selection.
    *   **`progression/`**: Contains `LessonView`, `GenerativeReward`, and the `useLevelLoader` hook. This manages the "meta-game" (winning, losing, advancing).
    *   **`theming/`**: A new feature for the visual system.

### 2.3 Challenges & Solutions
*   **Challenge**: Circular dependencies between `App.tsx` and the new feature modules.
*   **Solution**: We strictly defined `App.tsx` as the "Orchestrator" or "Router", ensuring it imports features but features do not import the App. We used cleaner interfaces (`Level`, `Tier`) to pass data.
*   **Challenge**: TypeScript path aliases.
*   **Solution**: We updated `tsconfig.json` and `vite.config.ts` to support `@/features` shortcuts, making imports cleaner and refactoring easier.

---

## 3. Scalable Data Layer (Phase 4.2)

### 3.1 The Pivot: Procedural vs. Static
Initially, the project relied on *procedural generation* to create infinite levels.
*   **The Problem**: Procedural levels felt generic, "soulless," and often buggy (impossible shapes). They hindered specific pedagogical goals (e.g., "teaching a perfect circle").
*   **The Decision**: We pivoted to **Static, Explicitly Defined Content**. We prioritized quality over quantity.

### 3.2 Implementation
We introduced a strict interface hierarchy in `src/types/level.ts`:
*   `Tier` (The major grouping, e.g., "Foundation") -> `SubTier` (e.g., "The Scratch") -> `Level` (The actual playable unit).

We created two key data files:
1.  **`src/data/levelPaths.ts`**: A massive purely mathematical file containing the normalized (0-1000 scale) coordinate data for every shape.
    *   *Why?* Separating geometry from metadata allows the renderer to be pure.
2.  **`src/data/tiers.ts`**: The metadata file. It maps IDs, Titles, Descriptions, and Difficulty Scores to the paths.

### 3.3 Automation
To avoid writing thousands of coordinates by hand, we wrote **Generator Scripts** (`scripts/generate_tier1_paths.ts`).
*   **How it works**: We used helper functions (parametric equations for lines, polygons, sine waves) to mathematically generate "perfect" shapes and write them to `levelPaths.ts`.
*   **Benefit**: We get the precision of a machine with the curation of a human.

---

## 4. Professional Theme Engine (Phase 4.3)

### 4.1 The Goal
The app needed to feel "premium." We wanted different stages of the game to feel like distinct worlds (e.g., a serene Museum vs. a technical Blueprint Academy).

### 4.2 The Implementation
We built a React Context-based engine (`features/theming/ThemeContext.tsx`).
*   **CSS Variables**: Instead of just distinct CSS classes, we mapped semantic names (e.g., `theme.colors.background`) to underlying Tailwind/CSS values.
*   **Hot-Swapping**: The `useTheme` hook allows any component to subscribe to theme changes.
*   **Dynamic Injection**: A simple `useEffect` in `LevelMap` and `LessonView` updates the theme based on the current `SubTier`.

### 4.3 Visual Identity
We defined two distinct visual languages:
1.  **Tier 1 (The Museum)**: 
    *   *Colors*: Stone, Amber, Warm Grey.
    *   *Font*: Serif (Playfair Display/Merriweather feel).
    *   *Vibe*: Classical, calm, paper-like.
2.  **Tier 2 (The Academy)**: 
    *   *Colors*: Slate Blue, White, Technical Grid.
    *   *Font*: Sans-Serif (Inter/Roboto).
    *   *Vibe*: Precision, engineering, blueprint.

---

## 5. Performance & Polish (Phase 4.4)

### 5.1 Optimization
*   **Touch Handling**: We verified `touch-action: none` to prevent the frustration of scrolling while trying to draw on mobile.
*   **Synchronous Loading**: We optimized `useLevelLoader`. Originally async (for future API support), we short-circuited it to load static JSON instantly, eliminating Layout Shift (CLS) and "loading flash."
*   **Visual Feedback**: We added a `Skeleton` loader component, ensuring that if we *do* load data later, the UI doesn't collapse.

---

## 6. Content Expansion (Phase 5)

### 6.1 The "Golden Path"
We defined the first 20 levels to take a user from zero to competency.

*   **Levels 01-10 (Tier I)**: Focus on *Straight Lines and Polygons*.
    *   Verticals, Horizontals, Squares, Triangles, Stars.
    *   *Lesson*: Coordination and stopping points.
*   **Levels 11-20 (Tier II)**: Focus on *Curves and Flow*.
    *   Arcs, S-Curves, Spirals, Circles.
    *   *Lesson*: Wrist rotation and continuous motion.

### 6.2 Difficulty Tuning
*   **The Scoring Algorithm (`geometry.ts`)**:
    *   We use a hybrid of **Precision** (distance from path) and **Coverage** (percentage of path points covered).
    *   *Problem*: The algorithm was too strict (3.0 penalty multiplier), failing users who drew decent spirals.
    *   *Fix*: We tuned the multiplier down to 2.5, creating a "fair but challenging" balance.

---

## 7. Known Issues & Future Work

*   **Mobile Testing**: While `touch-action` is set, true multi-device testing (various screen sizes/DPI) is pending.
*   **Sound**: Audio is currently placeholder (`playFrequency`). We need real assets.
*   **Persistence**: Currently using `localStorage` via Zustand. Ideally, this moves to a backend or IndexedDB for robustness.

---

**End of Documentation**
