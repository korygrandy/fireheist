# FireHeist

FireHeist is a browser-based arcade runner built around momentum, timing, and progression. Players guide a stick-figure runner through obstacles, collect energy and cash, unlock powerful abilities, and experiment with dozens of skill combinations to push deeper runs and climb the leaderboard.

This repository contains both the game itself and the end-to-end testing workflow used to validate gameplay settings, controls, progression systems, persistence, and UI behavior.

## Play the Game

**Live game:** https://www.kgenterprises.com/fireheist/

---

## What FireHeist Is

At its core, FireHeist is an endless-runner style game with a light economic and RPG progression layer:

- **Dodge obstacles** and survive as long as possible
- **Collect energy and rewards** during each run
- **Unlock and equip skills** from the Armory
- **Customize the experience** with different personae, themes, and gameplay settings
- **Take on daily challenges** and track long-term progress
- **Compete for leaderboard placement** and improve your best run

The project is designed to be fun to play, but also easy to extend from a development standpoint. Most game systems are broken into focused modules, which makes the repo approachable for adding new skills, UI features, balancing changes, or test coverage.

---

## Key Features

### Gameplay

- **43 unlockable skills** across a multi-tier progression system
- **Three difficulty modes** with different pacing and tuning
- **Daily challenge system** for repeatable goals and replayability
- **Cash and multiplier loops** that reward skilled play and build planning
- **Persistent player data** stored locally in the browser

### Controls and Accessibility

- **Keyboard support** for desktop play
- **Touch gestures** for mobile interaction
- **Gamepad support** for console-style play
- **Responsive UI** built for both smaller and larger screens

### Presentation

- **HTML5 canvas gameplay** with modular rendering logic
- **Theme-based visuals** and environmental effects
- **Tone.js-powered audio** for game feedback, skill triggers, and ambient sound

---

## Tech Stack

### Runtime

- JavaScript with **ES6 modules**
- **HTML5 Canvas** for game rendering
- **Tailwind CSS** for layout and UI styling
- **Tone.js** for audio playback and effects

### Tooling and Development

- Minimal frontend setup with **direct browser-loaded modules**
- No JavaScript bundling step required for day-to-day game development
- CSS can be regenerated with Tailwind when needed

### Testing

- **Playwright** for end-to-end browser testing
- TypeScript-based test tooling and scripts
- Test commands for smoke, config, settings, controls, persistence, audio, armory, and leaderboard flows

---

## Local Development

### Prerequisites

- Node.js 16+
- npm 8+
- A modern browser

### Install and Run

```bash
npm install
npm run build:css
npm start
```

This starts a local static server and watches the CSS build.

If you want to serve the project without the parallel watcher workflow:

```bash
npm run serve
```

### Fast Iteration Workflow

FireHeist is intentionally lightweight to work on:

- Changes in the JavaScript modules are loaded directly by the browser
- Styling can be rebuilt with Tailwind using the included scripts
- There is no frontend bundler standing between the code and the game loop

Useful commands:

```bash
npm run watch:css
npm run serve
npm test
npm run test:ui
npm run report
```

---

## Project Structure

```text
fireheist/
├── index.html                # App shell and UI structure
├── style.css                 # Generated CSS output
├── package.json              # Scripts and test tooling
├── js/
│   ├── main.js               # Main entry point
│   ├── constants.js          # Game tuning, costs, difficulty values
│   ├── dom-elements.js       # Centralized DOM lookup registry
│   ├── audio.js              # Tone.js audio system
│   ├── game-modules/         # Core gameplay systems
│   │   ├── state-manager.js  # Centralized state mutations
│   │   ├── game-controller.js
│   │   ├── lifecycle.js
│   │   ├── collision.js
│   │   ├── spawning.js
│   │   ├── score.js
│   │   ├── effects.js
│   │   ├── drawing/          # Renderer and overlay logic
│   │   └── skills/           # Individual skill modules
│   └── ui-modules/           # UI handlers and settings logic
└── e2e.tests/                # Playwright test assets and commands
```

---

## Architecture Overview

One of the strengths of FireHeist is that the project separates game concerns clearly.

### 1. Modular Composition

The game logic is organized into focused modules instead of one large script:

- **Core gameplay systems** live under the game modules area
- **UI behavior** is handled separately in UI-specific modules
- **Rendering** is isolated from progression and state logic
- **Skills** are implemented as self-contained units

That separation makes it easier to change visuals without breaking game rules, or to add a new mechanic without rewriting the input system.

### 2. Centralized State Management

State changes flow through a single manager instead of being scattered everywhere. That is important because the game has energy costs, cooldown behavior, progression, multipliers, and difficulty tuning that all need to stay consistent.

A typical pattern looks like this:

```javascript
import { gameState, consumeEnergy } from './js/game-modules/state-manager.js';

if (consumeEnergy(gameState, 'fireball')) {
  // Activate the skill only if the player has enough energy
}
```

This approach helps with:

- balancing and tuning
- consistent energy accounting
- easier debugging
- skill upgrade scaling

### 3. Skill-Driven Design

Skills are treated as small, reusable modules. Each one owns its own configuration and behavior.

```javascript
export const fireballSkill = {
  config: { name: 'fireball', energyCost: 10 },
  activate(state) {
    // trigger skill
  },
  update(state, deltaTime) {
    // advance timers or effects
  },
  draw(ctx, state) {
    // optional visuals
  }
};
```

This keeps the Armory and gameplay systems extensible. Adding a new skill does not require rewriting the whole game loop.

### 4. Input Abstraction

The same gameplay actions can be triggered from:

- keyboard input
- touch gestures
- gamepad polling

That means the player experience remains consistent across device types, while the code stays maintainable.

### 5. UI Handler Pattern

UI modules each own a single responsibility, such as:

- theme selection
- persona selection
- armory interactions
- leaderboard display
- save/load and persistence

This reduces coupling between interface code and gameplay code.

---

## Core Development Concepts

### Difficulty and Balancing

FireHeist uses centralized constants for difficulty values, energy tuning, obstacle frequency, and upgrade progression. This keeps balancing changes predictable and easier to test.

### Progression and Economy

The game includes a layered progression loop:

- skills have unlock paths
- tiers influence value and power
- cash and energy management shape decision-making
- daily challenges encourage repeat play

### Persistence

Local storage is used to preserve player settings and progression across sessions. This makes the game feel persistent without requiring a backend-heavy architecture.

### Audio as a Gameplay System

Audio is not just decorative. It reinforces timing, skill use, transitions, and state changes. The Tone.js integration gives the game a more responsive feel while staying lightweight enough for browser delivery.

---

## Test Framework

FireHeist includes a Playwright-driven end-to-end testing setup for validating the experience from the player’s perspective.

### What the Tests Cover

The test workflow is designed to catch regressions in areas like:

- initial page load
- player configuration
- gameplay settings
- keyboard and gamepad controls
- save/load behavior and persistence
- audio controls
- armory and unlock flows
- leaderboard interactions

### Why Playwright

Playwright is a strong fit for this project because the game is browser-native and highly interactive. It can validate actual user flows instead of isolated unit behavior.

### Available Test Commands

```bash
npm test
npm run test:smoke
npm run test:config
npm run test:settings
npm run test:controls
npm run test:data
npm run test:audio
npm run test:armory
npm run test:leaderboard
npm run test:ui
npm run test:debug
npm run report
```

### Test Philosophy

The testing approach is aimed at real behavior:

- verify that the game loads and responds correctly in a browser
- exercise actual controls and settings flows
- protect player-facing features from regressions
- keep contributor changes safer to merge

---

## Why the Codebase Is Easy to Extend

FireHeist is a good repository for iterative feature work because of a few strong patterns:

1. **Centralized state** keeps game data coherent
2. **Skill modules** let new mechanics be added incrementally
3. **UI modules** separate presentation concerns from gameplay rules
4. **Constants-driven tuning** makes balancing safer and faster
5. **Browser E2E tests** give confidence when changing player-facing behavior

For contributors, that means new features can usually be added without fighting the overall structure.

---

## Contributing Ideas

Some good contribution areas include:

- adding new skills to the Armory
- improving balancing for difficulty or economy systems
- enhancing visual effects or theme polish
- expanding test coverage for critical user journeys
- refining mobile or gamepad interactions

If you are adding a gameplay feature, try to keep it aligned with the existing architecture:

- put core logic in a focused game module
- route state changes through the state manager
- keep UI-specific behavior inside the UI modules
- add or update Playwright coverage for any important new user flow

---

## Summary

FireHeist is both a playable browser game and a clean example of modular frontend game architecture. It combines arcade gameplay, skill progression, responsive controls, audio feedback, and a Playwright test workflow in a way that is approachable for contributors and maintainable over time.

If you are visiting this repository for the first time, the best starting points are:

1. run the game locally
2. explore the main gameplay modules
3. review the constants and state manager
4. run the Playwright suite to see how the user experience is validated
