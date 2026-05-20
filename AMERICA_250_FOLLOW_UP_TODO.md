# America 250 Follow-Up Todo

## Patriotic Default Weapon

- [ ] Add a new patriotic default weapon for the 250th America theme and Uncle Sam persona.
- [ ] Make the weapon the default equipped skill when Uncle Sam is selected.
- [ ] Add an achievement unlock path that grants the weapon after successfully beating the 250th America theme.
- [ ] Add smoke coverage that verifies the weapon is locked before the achievement, unlocks after a successful America 250 completion, and becomes selectable/equippable afterward.

## Implementation Notes

- Use the existing skill module pattern under `js/game-modules/skills/`.
- Wire unlock metadata through the existing armory/persona achievement data rather than special-casing the selector UI.
- Keep `uncleSam` temporarily mapped to `fireMage` until the patriotic weapon is implemented.
