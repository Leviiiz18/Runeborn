<div align="center">
  <img src="public/elementals/Elementals_fire_knight_FREE_v1.1/gifs/00_all_animations_fire_FREE.gif" alt="Fire Knight" height="200" />
  <img src="public/elementals/Elementals_water_priestess_FREE_v1.1/gifs/00_all_animations_FREE.gif" alt="Water Priestess" height="200" />
  <br/><br/>
  <h1>⚔️ RUNEBORN ⚔️</h1>
  <p><strong>A Next-Gen Cyber-Arcane 2D Fighting Experience</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
    <img src="https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white" alt="ESP32" />
    <img src="https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas" />
  </p>
</div>

---

## 🔮 The Project
**Runeborn** is a high-fidelity, pixel-art arcade fighting game built on a custom HTML5 Canvas physics engine, wrapped in a breathtaking React-based "Cyber-Arcane" interface. 

What makes Runeborn truly unique is its **Hardware Integration**. Players can ditch the traditional keyboard and use an **ESP32 Microcontroller with an MPU6050 Gyroscope** to physically swing, block, and cast spells through real-life motion gestures!

## ✨ Features
*   🖥️ **Cyber-Arcane UI**: A highly polished, glassmorphic React frontend driven by immersive GSAP animations and dynamic background routing.
*   🗡️ **Intense 2D Combat**: Fast-paced arena battles with combos, rolling, traps, and projectiles.
*   📡 **ESP32 Motion Controls**: Connect a custom hardware controller via the Web Serial API to translate physical wrist flicks and thrusts into devastating in-game combos.
*   🤖 **AI Opponents**: Battle against adaptive Dummy bots with multiple difficulty levels (Easy, Medium, Hard).
*   🌐 **LAN & Online Play**: *[Coming Soon]* Fight friends across the local network or the world.

---

## 🤺 The Champions (Elementals)
Choose your fighter from an elite roster of elemental warriors. Each character is painstakingly animated frame-by-frame and rendered natively onto the canvas.

| Preview | Element | Champion | Playstyle | Signature Color |
| :---: | :---: | :--- | :--- | :---: |
| <img src="public/elementals/Elementals_fire_knight_FREE_v1.1/gifs/01_idle.gif" width="80" /> | 🔥 | **Fire Knight** | Aggressive, High Damage | Crimson Red (`#DC143C`) |
| <img src="public/elementals/Elementals_water_priestess_FREE_v1.1/gifs/01_idle.gif" width="80" /> | 💧 | **Water Priestess** | Fluid strikes, Area Control | Cyan (`#00fbfb`) |
| <img src="public/elementals/Elementals_ground_monk_FREE_v1.3/gifs/01_idle.gif" width="80" /> | 🍃 | **Earth Mauler** | Defensive, Heavy Hits | Emerald Green (`#00ff00`) |
| <img src="public/elementals/elementals_wind_hashashin_FREE_v1.1/gifs/01_idle.gif" width="80" /> | 💨 | **Wind Assassin** | Fast movement, Evasion | Silver (`#ffffff`) |
| <img src="public/elementals/Elementals_metal_bladekeeper_FREE_v1.1/gifs reference/01_idle.gif" width="80" /> | ⚙️ | **Metal Guardian** | Unstoppable armored force | Slate Gray (`#aaaaaa`) |
| <img src="public/elementals/Elementals_Crystal_Mauler_Free_v1.0/gif_samples/idle.gif" width="80" /> | 💎 | **Crystal Mage** | Ranged zoning, Trap placement | Neon Magenta (`#ff00ff`) |

---

## 🗺️ The Arenas
Step into beautiful, dynamic battlegrounds featuring cinematic backgrounds and distinct atmospheric lighting.

<table align="center" style="border-collapse: collapse; border: none;">
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="assets/water_areana.png" width="400" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.5);" /><br/>
      <b>🌊 Water Arena</b>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="assets/frozen_arena.png" width="400" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.5);" /><br/>
      <b>❄️ Frozen Ruins</b>
    </td>
  </tr>
  <tr>
    <td align="center" style="border: none; padding: 10px;">
      <img src="assets/arena_volcano.png" width="400" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.5);" /><br/>
      <b>🌋 Volcanic Fortress</b>
    </td>
    <td align="center" style="border: none; padding: 10px;">
      <img src="assets/Royal_arean.png" width="400" style="border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.5);" /><br/>
      <b>👑 Royal Arena</b>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (`v16+` recommended)
*   An ESP32 with an MPU6050 module *(Optional, for Gyro Motion Controls)*

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/runeborn.git
    cd runeborn
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Arcane Engine:**
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

## 🎮 Controls

### Keyboard (Standard)
*   **Move:** `A` / `D` (or Left/Right Arrows)
*   **Jump:** `W` (or Up Arrow / Space)
*   **Roll:** `S` (or Down Arrow)
*   **Light Attack:** `F`
*   **Heavy Attack:** `G`
*   **Combo Attack:** `H`
*   **Projectile:** `CTRL`
*   **Defend:** `C`
*   **Trap:** `T` 
*   **Ultimate / Special:** `X`

### ESP32 Motion Controller
*   **Attack:** Clockwise Wrist Flick
*   **Defend:** Trigger Button
*   **Ultimate:** Hard Downward Thrust
*(Note: Requires Web Serial API support in your Chromium-based browser).*

---
<div align="center">
  <i>"May your runes burn bright and your strikes strike true."</i>
</div>
