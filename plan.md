# Connect 4 Game Project Plan

This document outlines the plan for developing a Connect 4 clone using the Astro framework, hosted on GitHub Pages.

## 1. Project Setup

*   **Astro Project Initialization**: Set up a new Astro project.
*   **Asset Organization**: Place all provided assets (`buttons.svg`, `info.txt`, `player_coins.svg`, `player1_icons.svg`, `player2_icons.svg`) in the `public/assets` directory (or similar, depending on Astro's asset handling for static files) for easy access.

## 2. Page Layout (`src/pages/index.astro`)

The main game page will be structured as follows:

*   **Title Header**: Screen-space centered at the top of the screen.
*   **Function Buttons**: Placed at the top of the screen.
    *   **Restart Button**: Top-left corner. Uses an icon from `buttons.svg`.
    *   **Audio Mute Button**: To the left of the Information button. Uses an icon from `buttons.svg`. Toggleable state for audio on/off.
    *   **Information Button**: Top-right corner. Uses an icon from `buttons.svg`.
*   **Connect 4 Game Space**: Centered horizontally and vertically in the main content area.
*   **How to Play Information**: Initially hidden, displayed as a popup when the information button is pressed.

**Visuals**: All button icons will be 270 x 270 pixel sprites from `assets/buttons.svg`.

## 3. Component Breakdown

To ensure modularity and reusability, the application will be divided into the following Astro components:

### 3.1. `Header.astro`
*   Contains the game title and the function buttons (Restart, Audio, Info).
*   Manages the state and events for these buttons.

### 3.2. `Gameboard.astro`
*   Renders the 6x5 Connect 4 grid.
*   Handles the visual dropping of player coins into columns.
*   Displays player coins with unique icon overlays.
    *   **Player 1 Coins**: Yellow, with icons from `assets/player1_icons.svg` (540 x 540 pixels, left-to-right scanning pattern).
    *   **Player 2 Coins**: Red, with icons from `assets/player2_icons.svg` (540 x 540 pixels, left-to-right scanning pattern).

### 3.3. `InfoPopup.astro`
*   A modal component that displays the "How to Play" text from `assets/info.txt`.
*   Applies a blurring effect to the background when active.
*   Includes a mechanism to close the popup.

## 4. Game Logic (JavaScript/TypeScript in Astro components)

### 4.1. Game State Management
*   **Gameboard State**: Represented as a 6x5 matrix (rows by columns) to track occupied spaces and player coins.
*   **Current Player**: Track whose turn it is (Player 1 or Player 2).
*   **Win Condition Check**: After each turn, check for four in a row horizontally, vertically, or diagonally using the matrix.
*   **Tie Game Check**: Determine if the game is tied when all gameboard spaces are occupied and no winner is found.

### 4.2. User Interactions
*   **Dropping Coins**: Handle click events on columns to drop a player's coin into the lowest available space.
*   **Restart Game**: Reset the gameboard to an empty state and return player coins to their default order.
*   **Toggle Audio**: Switch between audio on and audio off states. This will control any background music or sound effects.
*   **Display/Hide Info Popup**: Control the visibility of the `InfoPopup` component and the background blur effect.

## 5. Styling (CSS/Tailwind CSS)

*   Implement responsive design for various screen sizes.
*   Center the game title and game space as specified.
*   Style buttons, player coins, and the information popup for an engaging user experience.
*   Ensure proper overlay of player icons on coins.

## 6. Deployment

*   Configure Astro to build the project for static site deployment, suitable for GitHub Pages.
*   Ensure all assets are correctly referenced and available in the deployed build.
