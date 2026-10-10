# What We Don't Say — Freshman Year

A moody, choice-driven visual novel about the brutal jump from middle school to high school, and the promise four friends made about one night they agreed never to talk about.

## Play

Open `index.html` in any modern browser. No install, no server, no dependencies. Click the page once so the browser allows audio.

## Files

- `index.html` — UI and embedded CSS (dark visual-novel interface, animated gradient backgrounds, particles)
- `game.js` — the whole game: narrative engine, story data, Web Audio ambience, save/load
- `README.md` — this file

## Features

- Main Menu: New Game, Load, Settings
- 3 save slots plus an autosave, stored in `localStorage`
- Typewriter text, dynamic backgrounds, generative ambient music and sound effects (Web Audio API, no audio files)
- Branching story in three acts with five endings
- Hidden stats: **Social Standing**, **Mental Stress**, **Trust**, plus bonds with Jun, Priya and Theo. Stats are never shown during play. Only subtle hints appear ("Jun will remember that.") and stress distorts the screen. They are revealed on the ending screen.
- Settings: text speed, music and effects volume, screen-effects toggle

## Controls

Click the text box, `Space` or `Enter` to advance. Number keys choose options. `Esc` closes menus.

## Story outline (spoilers)

- **Act I — Middle School Echoes:** four friends make a Pact on the water tower about what happened at the quarry.
- **Act II — The High School Fracture:** new cliques, a mysterious texter named "W", a strangely informed counselor, and a photo that contradicts your memory.
- **Act III — The Eastern Ledge:** the truth about June 14th, and a final confrontation at Winter Formal.

Endings: *What the Water Kept*, *A Smaller Pact*, *Static*, *Applause*, *Fault Lines*. Your choices on trust, loyalty and honesty decide which you reach.

## Extending

Scenes live in the `S` object in `game.js`, created with `sc(id, {...})`. Lines starting with `%` render as glitchy memory text, `>` as phone messages. Choices accept `e` (stat effects), `f` (flags), `if` (condition) and `n` (next scene, or a function returning one).
