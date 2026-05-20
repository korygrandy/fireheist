# 250th America Theme Audio Asset List

The feature branch includes playable placeholder MP3 files so the app can load without missing-audio errors. Replace these files with final mastered assets using the same filenames unless the code mappings are changed.

## Placeholder Files Added

| File | Current Placeholder Source | Intended Final Asset |
| --- | --- | --- |
| `fx/america-250-theme.mp3` | `fx/funk-theme-music.mp3` | Main Uncle Sam / 250th America theme song |
| `fx/america-250-ambience.mp3` | `fx/ambience-crickets.mp3` | Ambient Fourth of July crowd/fireworks/night celebration bed |
| `fx/america-250-firework-pop.mp3` | `fx/explosion.mp3` | Short firework pop/burst sound effect |
| `fx/america-250-accelerator.mp3` | `fx/power-up.mp3` | Patriotic accelerator pickup sound |

## Requested Final Audio

### Theme Song

- **Filename:** `fx/america-250-theme.mp3`
- **Use:** Persona/theme music when Uncle Sam or the 250th America theme is active.
- **Mood:** Upbeat, celebratory, arcade-friendly patriotic march/funk hybrid.
- **Length:** 60-120 seconds loopable.
- **Mix Notes:** Should sit under gameplay SFX. Avoid overly sharp brass or snare transients.

### Ambient Bed

- **Filename:** `fx/america-250-ambience.mp3`
- **Use:** Looped ambience for the 250th America theme.
- **Mood:** Distant fireworks, summer night crowd, soft parade ambience.
- **Length:** 45-120 seconds loopable.
- **Mix Notes:** Low distraction, no loud isolated bangs, no spoken words.

### Firework Pop

- **Filename:** `fx/america-250-firework-pop.mp3`
- **Use:** Optional firework burst and finish-line accent SFX.
- **Mood:** Bright pop with sparkle tail.
- **Length:** 0.5-2 seconds.
- **Mix Notes:** Keep peaks controlled for repeated playback.

### Accelerator Pickup

- **Filename:** `fx/america-250-accelerator.mp3`
- **Use:** Optional pickup cue for patriotic accelerators.
- **Mood:** Quick triumphant chime/stinger.
- **Length:** 0.3-1.5 seconds.
- **Mix Notes:** Should read immediately but not mask jump or collision sounds.

## Optional Future Additions

| Suggested File | Purpose |
| --- | --- |
| `fx/america-250-finish-line.mp3` | Victory arch / final milestone fanfare |
| `fx/america-250-confetti.mp3` | Soft confetti shimmer |
| `fx/america-250-collision-burst.mp3` | Theme-specific collision sparkle accent |
| `fx/uncle-sam-select.mp3` | Persona select flourish |

## Technical Requirements

- Format: MP3 is safest for the current project.
- Loudness: Normalize similarly to existing `fx/*.mp3` assets.
- Looping: Theme and ambience should loop cleanly.
- Paths: Keep filenames exactly as listed above if replacing placeholders directly.
