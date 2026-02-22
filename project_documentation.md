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


## 8. Critical Refinements (Phase 7: The "Horizon" Fixes)

### 8.1 Auto-Framing Engine
**The Problem:**
Moving to the "Museum Frame" design introduced inconsistent canvas aspect ratios (e.g., 4:3 vs 16:9 vs Mobile). Hardcoded scaling (assuming 1000x1000 input) caused drawings to be misaligned, either disappearing or rendering off-center.

**The Solution (`LessonView.tsx`):**
We implemented a robust **Auto-Framing Algorithm**:
1.  **Analyze Content**: It calculates the exact Bounding Box `(minX, maxX, minY, maxY)` of the level's path data.
2.  **Dynamic Scaling**: It computes the maximum possible scale factor that fits this bounding box within the current container `dimensions`, while respecting safety margins.
3.  **Centering**: It mathematically centers the scaled path within the container.

### 8.2 Asymmetric Padding (UI Safety Zones)
**The Problem:**
Users could not draw the bottom parts of shapes (like the "L" in Level 3) because the floating Toolbar was intercepting touch/mouse events.

**The Solution:**
We updated the Auto-Framing logic to support **Asymmetric Padding**:
*   **Top**: 15% (for Header)
*   **Sides**: 10% (for Frame)
*   **Bottom**: **35%** (reserved specifically for Toolbar clearance)

This guarantees that *no matter the screen size*, the interactive specific drawing path is always lifted above the UI controls.

---

## 9. Tier 1: The Sketchpad Implementation (Phase 8)

### 9.1 The Concept
To make the introduction to drawing feel less intimidating, we created **"The Sketchpad"** tier. This environment is designed to feel warm, organic, and forgiving—like sketching on paper at a wooden desk—contrasting with the clinical "Academy" tier.

### 9.2 Key Features
*   **Visual Identity**:
    *   **Background**: A custom noise-generated paper texture (`bg-[#f0f0f0]`) replaces the stark white.
    *   **UI Elements**: User interface elements use warm amber/wood tones (`#d97706`).
    *   **Nodes**: Level nodes are rendered as **Circles** (organic) rather than Rectangles (technical), featuring a pencil icon for completion.
*   **Curriculum (30 Levels)**:
    *   Expanded from 10 to 30 unique levels across 3 sub-tiers: "First Marks", "Simple Shapes", and "Combining Shapes".
    *   **Composite Shapes**: Enabled drawing of complex objects (e.g., houses, snowmen) by supporting **discontinuous paths**.

### 9.3 Technical Implementation
*   **Sentinel Value Logic (`geometry.ts`)**:
    *   To support "lifting the pen" within a single level data structure, we implemented `[-1, -1]` as a Sentinel Value (a "MoveTo" command).
    *   The `DrawingCanvas` and `GhostOverlay` renderers were updated to break the stroke whenever this value is encountered.
*   **Particle Systems (`DrawingCanvas.tsx`)**:
    *   **Dust Particles**: A subtle particle system follows the brush tip, adding friction and "life" to the drawing experience.
    *   **Magic Glow**: Upon level completion, the stroke emits a visual glow using CSS filters/Shadows.
*   **Theme Engine Updates**:
    *   Added `effects` flags (`dust`, `glow`, `splat`) to `ThemeConfig`.
    *   Added `nodeShape` property to control UI morphology per tier.

---

---

## 10. 3D Effects Integration (Phase 9: "The Magic Layer")

### 10.1 The Goal
To increase user engagement and provide delightful feedback, we integrated lightweight **3D visual effects** into the "Sketchpad" tier. The goal was to make the app feel "alive" without compromising the 2D drawing performance.

### 10.2 The Implementation (`src/features/effects3d/`)
We utilized **React Three Fiber (R3F)** to create an interactive 3D layer that sits *behind* the 2D drawing canvas.

*   **Scene Composition (`Scene3D.tsx`)**: The main container orchestrates the 3D world, camera, and lighting. It reacts to game state (`isDrawing`, `isLevelComplete`) passed from `LessonView`.
*   **Performance First**:
    *   **Instanced Rendering**: used `instancedMesh` for particles (`Particles.tsx`), trails (`TrailParticles.tsx`), and confetti (`Confetti.tsx`) to render hundreds of objects with single draw calls.
    *   **Ref-Based Updates**: To maintain 60fps drawing, we bypassed React state for high-frequency brush updates. `DrawingCanvas` writes directly to a mutable `brushRef`, which `TrailParticles` reads inside its `useFrame` loop.

### 10.3 Key Components
1.  **Ambient Atmosphere**:
    *   `Particles.tsx`: Dust motes floating in the background.
    *   `SunRays.tsx`: A custom shader-based rotating light effect.
2.  **Mascot (`PencilMascot.tsx`)**:
    *   A procedural low-poly pencil character.
    *   **Animations**: "Wiggles" when drawing, "Spins" on victory.
3.  **Feedback**:
    *   `TrailParticles.tsx`: Golden spheres follow the brush path.
    *   `Confetti.tsx`: A custom physics simulation (gravity, velocity, rotation) that triggers on level success.

---

## 11. The Great Pivot: From React to Godot (Phase 10 — February 22, 2026)

### 11.1 The Crisis

After months of iterative development on the React + React Three Fiber stack, the user reached a breaking point. The application — despite having dozens of components, particle systems, audio engines, scoring algorithms, and 3D effects — **looked and felt like a broken prototype**. Key observations:

- **Drawing strokes were nearly invisible** — thin, low-contrast lines on a transparent 3D plane
- **UI elements overlapped chaotically** — score displays, titles, and buttons stacking on each other
- **The "wooden desk" was flat and untextured** — a single brown box with no visual depth
- **Particles and confetti were not visually triggering** despite the physics code being present
- **Audio was a synthesized oscillator buzz** instead of musical notes or sound effects
- **Bloom/post-processing effects were non-functional** — invisible or overpowering
- **The entire experience felt "dead"** — no responsiveness, no juice, no engagement

### 11.2 Root Cause Analysis: Why React Was the Wrong Tool

The core problem was identified: **React + Three.js is fundamentally the wrong tool for building a game with Candy Crush-level juice.** The analysis:

| What a game engine provides natively | What React forced us to reinvent |
|---|---|
| Particle System (drag emitter, set curves, preview) | 185+ lines of manual `instancedMesh` management + physics simulation |
| Animation Timeline (keyframe any property, set easing) | `useState` + CSS transitions, or manual interpolation in `useFrame` |
| Audio Mixer (drag clips to events, set volumes, crossfade) | Raw `OscillatorNode` creation producing unappealing synthesized tones |
| Screen Shake (attach component, set trauma/decay) | Manual shake math in `useFrame` with hardcoded random offsets |
| Sprite/Texture handling (import, auto-atlas, one-click assign) | Manual `CanvasTexture` projection, UV mapping, fighting transparency |

**The "Frankenstein" Problem**: Each feature was technically implemented (code existed, logic was correct), but the results felt completely dead because React provides **features** while game engines provide **systems** — coordinated pipelines with depth sorting, alpha blending, lighting interaction, and automatic culling that make things feel alive.

### 11.3 Tech Stack Evaluation

A comprehensive evaluation of alternative stacks was conducted against the project's requirements:

| Requirement | React + R3F | Phaser.js | Godot | Unity |
|---|---|---|---|---|
| 2D drawing game quality | ❌ Poor — fighting the framework | ✅ Good — built for 2D web games | ✅ Excellent — 2D-first engine | ✅ Good but overengineered |
| "Candy Crush-level" juice | ❌ Requires reinventing every system | ⚠️ Decent — built-in tweens, particles | ✅ Built-in particles, tweens, shaders, audio | ✅ Best-in-class |
| Mobile export (native) | ❌ Web only (Capacitor wrapper) | ❌ Web only (Capacitor wrapper) | ✅ Native Android/iOS export | ✅ Native everything |
| AI-assisted development | ⚠️ Code-only, no visual feedback | ⚠️ Code-only | ✅ Text-based scenes (.tscn), MCP integration | ❌ Heavily editor-dependent |
| Learning curve | ✅ Already known | ✅ Same TS/JS | ⚠️ New (GDScript ≈ Python) | ❌ Steep — editor-heavy |
| Cost | ✅ Free | ✅ Free | ✅ Free (MIT license, forever) | ⚠️ Free under $200K, then fees |

### 11.4 The Decision: Godot 4.6.1

**Godot was chosen** as the new engine for the following reasons:

1. **Text-based scene files** (`.tscn`) — Unlike Unity's binary scenes, Godot scenes are human-readable text. This means AI assistants can create, edit, and debug scenes just like source code files.
2. **MCP Integration** — The Model Context Protocol enables AI assistants (Claude/Antigravity) to directly interact with the Godot editor: creating scenes, adding nodes, writing GDScript, reading debug output, and running projects. This closed the feedback loop that was missing in the React approach.
3. **2D-first architecture** — Godot was originally built as a 2D engine and added 3D later. For a drawing game, this means first-class support for canvases, line rendering, input handling, and 2D particles.
4. **Built-in juice systems** — Tweens, particle emitters, AudioStreamPlayer, Camera2D effects (shake, zoom), and AnimationPlayer are all native, tested, and tunable without code.
5. **Native export** — One codebase compiles to Web (HTML5/WASM), Android (APK/AAB), iOS (IPA), Windows, Mac, and Linux.
6. **MIT License** — No revenue sharing, no subscription, no corporate risk (unlike Unity's licensing history).

### 11.5 Unity AI Landscape Research

Before committing to Godot, the state of Unity's AI integration was thoroughly researched:

- **Unity AI Beta (GDC March 12, 2026)** — Unity announced a text-to-game system using OpenAI GPT + Meta Llama models, capable of generating "full casual games from natural language prompts." This is entering public beta 3 weeks from the pivot date.
- **Unity AI Suite** — Includes an in-editor AI assistant for scripting, debugging, UI creation, animation controllers, and optimization. Available in Unity 6.2 beta.
- **Unity AI Generators** — Generate sprites, textures, sounds, materials, and animations from text prompts.

**Why Unity was NOT chosen despite its AI investment:**
- Unity's AI tools are first-party but **require Unity's visual editor** for maximum effectiveness. Current external AI assistants (like Claude) cannot operate Unity's Inspector, Shader Graph, or Animation Timeline.
- Unity's proprietary ecosystem introduces vendor lock-in risks.
- For the specific use case (2D drawing game), Godot + MCP provides a more immediate and controllable AI-assisted workflow.
- **Future flexibility**: If Unity's text-to-game system proves superior, the game's design (levels, scoring, progression) can be ported. The intellectual work transfers regardless of engine.

### 11.6 MCP Integration Setup

The following MCP infrastructure was established:

- **Server**: [Coding-Solo/godot-mcp](https://github.com/Coding-Solo/godot-mcp) (free, open-source)
- **Location**: `C:\Users\MT\Projects\godot-mcp`
- **Capabilities**: 14 tools — `launch_editor`, `run_project`, `get_debug_output`, `stop_project`, `get_godot_version`, `list_projects`, `get_project_info`, `create_scene`, `add_node`, `load_sprite`, `export_mesh_library`, `save_scene`, `get_uid`, `update_project_uids`
- **Config**: Stored in `C:\Users\MT\.gemini\antigravity\mcp_config.json`
- **Godot Path**: `E:\UNITY\Godot_v4.6.1-stable_win64.exe\Godot_v4.6.1-stable_win64.exe`
- **Project**: `C:\Users\MT\Projects\drawing-game` (Godot 4.6.1, Compatibility renderer)

**Persistence**: The MCP connection is configured at the IDE level, persisting across all future chat sessions. New sessions automatically have access to Godot tools; only project context (what's being built) needs a brief reminder.

### 11.7 What Carries Over vs. What's Abandoned

| Carries over (reusable) | Abandoned (React-specific) |
|---|---|
| Level path coordinate data (`levelPaths.ts`) | All `.tsx` React components |
| Scoring algorithm concepts (precision + coverage) | Three.js/R3F scene setup |
| Tier/SubTier curriculum structure | Web Audio API oscillator code |
| "Dopamine Engine" design document | Zustand store management |
| Game design decisions (streak mechanics, variable rewards) | CSS/Tailwind styling |
| User research (ADHD-focused engagement patterns) | `package.json` dependencies |

### 11.8 New Development Workflow

The pivot establishes a fundamentally different AI-assisted game development workflow:

- **AI (Antigravity/Claude)**: Implementation. Create scenes, write GDScript, configure particle systems, set up audio, debug errors — all through MCP tools and direct file editing.
- **User**: Design direction and QA. Play the game, evaluate feel, provide feedback: "This confetti is too weak," "The chime needs to come 0.2 seconds earlier," "The screen shake is too long." User's ADHD-calibrated "is this boring?" detector serves as the ultimate quality gate.

---

**End of Documentation**
