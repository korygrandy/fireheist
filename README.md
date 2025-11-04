# 🔥 FIRE Heist Developer Guide

Welcome to the developer guide for FIRE Heist, a game about racing toward Financial Independence, Retire Early (FIRE). This guide provides an overview of the project structure, core logic, and conventions to help with future development.

## 🎮 Overview

FIRE Heist is an interactive endless runner-style game where the player's goal is to reach their financial independence goal as quickly and efficiently as possible. The game visualizes financial data from `milestones.json` as a race track, with hurdles representing financial milestones. The player must avoid obstacles (representing financial setbacks) while collecting power-ups to reach the end.

## ✨ Key Features

-   **Financial Data Visualization**: Milestones (dates and net worth values) are parsed and converted into a series of race segments. The time between milestones determines the segment's visual duration and slope.
-   **Custom Runner/Obstacle**: The player can choose their runner's emoji, obstacle emoji, and background music.
-   **Interactive Controls**: Users can set the Difficulty, Game Speed, and Obstacle Frequency.
-   **Dynamic Gameplay**:
    -   **Obstacles (🐌)**: Randomly spawn based on frequency. Collisions cause a temporary slowdown.
    -   **Accelerators (🔥)**: Randomly spawn and provide a temporary speed boost.
    -   **Custom Events**: The game supports custom events defined by a date, emoji, and type (ACCELERATOR or DECELERATOR).
-   **High Score System**: The game tracks the "Flawless Heist" - the best run determined first by the fewest hits, then by the fastest time.
-   **Persistent Settings**: Player configuration is saved to `localStorage` for a consistent experience.

## 📂 Project Structure

The project follows a modular structure to separate concerns and improve maintainability.

```
.
├── index.html              # Main HTML file
├── style.css               # All styles for the application
├── milestones.json         # Default financial data for the game
├── changelog.json          # Tracks version changes
├── defects.json            # Tracks resolved defects
├── version.py              # Application version
├── js/
│   ├── main.js             # Main application entry point, DOM event listeners
│   ├── ui.js               # Handles all UI interactions and state
│   ├── audio.js            # Manages all audio playback with Tone.js
│   ├── constants.js        # Global game constants
│   ├── dom-elements.js     # Centralized DOM element selections
│   ├── theme.js            # Theme management
│   ├── utils.js            # Utility functions (e.g., chart generation)
│   └── game-modules/       # NEW: Modularized core game logic
│       ├── state.js        # Manages all mutable game state
│       ├── drawing.js      # Contains all canvas rendering functions
│       ├── actions.js      # Handles all player-initiated actions (jumps, moves)
│       └── main.js         # The core game loop (animate) and game management
└── fx/
    └── *.mp3               # Sound effects
```

## ⚙️ Core Game Logic (`js/game-modules/`)

The monolithic `game.js` file has been refactored into a modular architecture within the `js/game-modules/` directory.

### `state.js`
This is the single source of truth for all mutable game state. It exports a single `state` object. **Crucially, to modify state from another module, you must mutate the properties of this object (e.g., `state.gameRunning = true;`). Do not reassign the object itself.**

### `drawing.js`
This module is responsible for all rendering on the HTML5 canvas. It imports the `state` object for read-only access to game data and contains all `draw...` functions, including `draw()`, which is the main rendering function called in the game loop.

### `actions.js`
This module contains all player-initiated actions, primarily the `start...` functions for special moves and jumps. It imports and modifies the `state` object to trigger animations and state changes.

### `main.js`
This is the engine of the game. It contains:
-   The main game loop (`animate`).
-   Game management functions: `startGame()`, `stopGame()`, `resetGameState()`, `togglePauseGame()`.
-   Collision detection and physics logic.
-   Functions for spawning obstacles and power-ups.

## 💾 Settings Persistence

Player settings are saved to the browser's `localStorage` to persist between sessions.

-   **Location of Logic**: All logic for saving and loading settings is centralized in `js/ui.js`.
-   **`localStorage` Keys**:
    -   `fireHeistSettings`: Stores UI configuration like selected emojis, speed, and difficulty.
    -   `fireHeistMuteSetting`: Stores the mute state (`"true"` or `"false"`).
    -   `fireHeistHighScores`: Stores the best run for each difficulty level.
-   **Opt-Out Control**: A checkbox with the ID `#disableSaveSettings` allows the user to opt-out of persistence. When checked, no data is saved to `localStorage`, and any existing data is cleared.
-   **Default Data**: On first load or when no data is present, default milestone data is loaded from `milestones.json`.

## 🕹️ Controls

### Keyboard
-   **Jump**: `Spacebar`
-   **Pause**: `P`
-   **Power Stomp**: `X`
-   **Dive**: `D`
-   **Corkscrew Spin**: `C`
-   **Scissor Kick**: `S`
-   **Phase Dash (invincible)**: `V`
-   **Hover**: `H`
-   **Ground Pound**: `G`
-   **Backflip**: `Z`
-   **Frontflip**: `F`
-   **Houdini**: `I`

### Mobile Gestures
-   **Jump**: Tap
-   **Power Stomp**: Swipe Down
-   **Dive**: Two-Finger Tap
-   **Phase Dash (invincible)**: Double Tap
-   **Hover**: Long Press
-   **Backflip**: Swipe Right
-   **Frontflip**: Swipe Up
-   **Houdini**: Three-Finger Tap

## 🚀 Future Development Ideas

Here is a list of potential features and enhancements for future development:

-   **Config Radio Dial**: Implement a radio dial-style UI for configuration settings.
-   **Audio Enhancements**: Add stock market style open/closing bells for game start and end.
-   **Easter Eggs**: Create a "Bonus World Warp" easter egg.
-   **Collision Animations**:
    -   Implement collision animation for the default fire emoji power-up, simulating orange fire.
    -   Enhance the stick figure animation with a forward-blasting turbo boost effect when a power-up is collected.
-   **New Game Modes**: Add a "Bonus Game" mode.
-   **Advanced Animations**:
    -   **Comedic**: "Yikes!" jump, Cartoon Scramble, Leisurely Hop.
    -   **Powerful**: Phase Dash (through hurdles), Hover, Ground Pound Jump.
    -   **Character-Specific Moves**:
        -   Ninja (`🥷`): Puff of smoke.
        -   Dancer (`💃`): Graceful ballet leap.
        -   Rocket (`🚀`): Short burst of flames.
        -   Zombie (`🧟`): Stiff, clumsy lurch.
-   **Alternative High Score Systems**:
    -   **The "Time-to-FIRE" Ledger**: Track only the fastest time to completion for each difficulty.
    -   **The "Heist Portfolio"**: Save the last 3-5 runs to show player progress over time.
-   **Player Personas**: Introduce character personas based on financial discipline levels (e.g., Savvy Cheetah, Lethargic Sloth).

---
This guide should serve as a solid foundation for maintaining and extending the FIRE Heist game. Happy coding!
