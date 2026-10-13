# World bible

Every project is its own world, built from what it's about. Write this before designing anything; `apps/web/src/styles/world.css` implements it. Keep it to a page. Run `/world` in Claude Code to draft it from a sentence about the project.

The answers below describe Vesper, the starter's default world. Replace them.

## The world

- **Name:** Vesper
- **What the project is:** Threshold, the starter every project begins from.
- **At the threshold** (what someone feels in the first three seconds): stillness, then a light coming on, then curiosity.
- **The pull** (why they keep going): each passage leads to the next, and the light changes the further in they go.
- **Light** (where it comes from, what it reveals): the visitor carries it. Warm lamplight at the hand; a colder light far ahead.
- **The dark** (what it means here): midnight. Calm and deep, never menacing.
- **Texture:** fine grain and soft edges; nothing glossy.
- **Type voice:** Alegreya tells the tale (headings and reading); Alegreya Sans is the guide (navigation, buttons, small print).
- **Tempo:** slow and settling. Things arrive and rest; nothing snaps.
- **Sound:** none by default. Invited only.
- **Secrets** (what rewards a closer look): whispers, asides that appear on hover or focus.
- **Never** (clichés this world avoids): literal forests, fog, fireflies, candles; neon; gloss.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#10142a` | midnight, the page |
| `--bg-deep` | `#060816` | the dark at the edges |
| `--ink` | `#ede5d3` | vellum: headings and primary text |
| `--ink-soft` | `#aaa6bf` | dusk: reading text |
| `--ink-dim` | `#7c7996` | large type away from the light, never body copy |
| `--ink-lit` | `#fff4de` | type where the light falls |
| `--accent` | `#f3c27a` | lamplight: the main action, focus, the light itself |
| `--cold` | `#7f8fe8` | the far light: glows and the depth line, never text |

## How it moves

- **Arrival:** the dark first, then the atmosphere, then the title comes into focus, then the way in. About three seconds, once.
- **After that:** light follows the hand, passages brighten as they reach the middle of the view, warm light gives way to cold as the visitor goes deeper.
- **Reduced motion:** the same world, lit and still.
