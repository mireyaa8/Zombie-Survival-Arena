# Zombie FSM Survival Game

## Overview

This is a top-down 2D survival shooter built using HTML5 Canvas and JavaScript. The game features enemy AI controlled by a finite state machine, level-based zombie spawning, particle effects, background sound, and mouse-based shooting mechanics.

The objective is to survive as long as possible by eliminating increasingly difficult levels of zombies.

---

## Gameplay

You control a character in an enclosed arena. Zombies spawn each level and become progressively more numerous and challenging. When all zombies in a level are eliminated, the next level begins automatically with increased difficulty.

There is no final level; the game continues until the player dies.

---

## Controls

WASD - Move player  
Arrow Keys - Move player  
Mouse movement - Aim  
Left click - Shoot  
R - Reload  
P - Pause / Resume

---

## Features

### Enemy AI System

Zombies use a finite state machine (FSM) with multiple behaviors:

- Idle
- Patrol
- Chase
- Attack
- Flee
- Dead

Each state transitions based on player distance, zombie health, and timers.

---

### Level System

- Zombies spawn in levels
- Each level increases the number of enemies
- When all zombies are eliminated, the next level starts automatically
- The player receives bonus score after completing a level
- The player recovers some health after completing a level
- Ammo is refilled after completing a level
- Difficulty increases progressively with each level

---

### Combat System

- Projectile-based shooting
- One shot per mouse click
- Ammo and reload system
- Collision detection between bullets and zombies
- Zombie health system
- Zombie death triggers particle effects
- Score increases when zombies are killed

---

### Visual System

- Radial gradient background for depth
- Fog particle system for atmosphere
- Screen vignette effect
- Bullet glow effect
- Hit flash effect on zombies
- Blood particle effects on zombie death
- Floating damage text
- Screen shake effect

---

### Audio System

- Gunshot sound effect
- Background music
- Background music starts when the game begins
- Background music pauses when the game is paused
- Background music stops when the player dies

---

## Automata Theory in the Game

The zombie behavior is based on automata theory. Each zombie uses a finite state machine, also known as an FSM.

A finite state machine is a system that has a limited number of states. The system can only be in one state at a time. It changes from one state to another when specific conditions are met.

In this game, each zombie is controlled by its own FSM.

The zombie states are:

- IDLE
- PATROL
- CHASE
- ATTACK
- FLEE
- DEAD

The zombie changes between these states depending on:

- Distance from the player
- Zombie health
- Timers
- Whether the player is close enough to attack

---

## Zombie FSM State Map

```txt
                    ┌──────────────┐
                    │    IDLE      │
                    │ Waiting      │
                    └──────┬───────┘
                           │
                           │ timer ends
                           ▼
                    ┌──────────────┐
                    │   PATROL     │
                    │ Wandering    │
                    └──────┬───────┘
                           │
                           │ player close
                           ▼
                    ┌──────────────┐
                    │    CHASE     │
                    │ Follow       │
                    └──────┬───────┘
                           │
             close enough  │
             to attack     ▼
                    ┌──────────────┐
                    │   ATTACK     │
                    │ Damage player│
                    └──────┬───────┘
                           │
                           │ player moves away
                           ▼
                    ┌──────────────┐
                    │    CHASE     │
                    │ Follow       │
                    └──────────────┘
```

                    ┌──────────────┐
                    │    CHASE     │
                    │ Follow       │
                    └──────┬───────┘
                           │
                           │ low health
                           ▼
                    ┌──────────────┐
                    │    FLEE      │
                    │ Run away     │
                    └──────┬───────┘
                           │
                           │ timer ends
                           │ or far away
                           ▼
                    ┌──────────────┐
                    │    CHASE     │
                    │ Follow       │
                    └──────────────┘
                                  Any State
                  │
                  │ health <= 0
                  ▼
            ┌──────────────┐
            │     DEAD     │
            │ Removed      │
            └──────────────┘
