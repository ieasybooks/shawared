# Typography

Vowelled Arabic reaches far above and below the line a font declares, and iOS draws text only inside its box. Shawared therefore trims every text box to its **ink**: the outer box of a text runs from the highest mark it can have to the lowest tail. Two texts can then touch only if the layout puts them at a zero gap, and every gap in a layout is a true visible gap.

## How it works

- `packages/design/src/type.ts` holds, per font, the declared ascent/descent and the measured ink per script. `textBox(face, size, script, spacing)` returns a style whose margins remove empty line space and whose padding makes room for marks that overflow the line. Wrapped lines are never set closer than the ink allows.
- `apps/app/src/lib/type.ts` defines the roles every text uses (`verse`, `title`, `label`, `prose`, `translation`, …) for the reader's language: Arabic interface text is trimmed for Arabic ink, English for Latin ink.
- `space` in `packages/design` is the gap scale (2, 4, 6, 8, 12, 16, 24).

## Rules

- Every `Text` takes a role from `useType()`. Don't set `fontSize`, `lineHeight` or vertical margins/padding on a `Text`: they would undo the trim.
- Space texts with `gap` or padding on their container.
- A bordered label is a `View` with the border around a `Text` (`Chip`, `Tag`), so the border sits around the ink.
- Controls that must keep one height in both languages (pills, menu items) set `minHeight` on the container and centre the text.
- `tests/typography.spec.ts` walks every screen and state in both languages and fails if two visible texts overlap.

## Measurements

Measured with HarfBuzz on every string the app shows, in em around the baseline:

| Font | Declared | Arabic ink | Latin ink |
| --- | --- | --- | --- |
| Amiri | +1.12 / −0.63 | +1.30 / −0.73 | |
| Readex Pro | +1.00 / −0.25 | +1.15 / −0.57 | +0.79 / −0.23 |
| Newsreader | +0.74 / −0.27 | | +0.72 / −0.26 |
| Reem Kufi | +1.10 / −0.40 | +1.02 / −0.22 | +1.02 / −0.22 |

Every font we tried (Amiri, Noto Naskh Arabic, Scheherazade New, Markazi, Lateef, IBM Plex Sans Arabic) adds 12–21% of height for harakat, so this is a property of vowelled Arabic, not of one font. When new content or a new font arrives, re-measure (the method is in the git history of this file's commit) and update `METRICS`.

## Verses at one width

Every half of a poem is set to the same width, its measure, as printed diwans do: the width of the poem's longest half, in em of Amiri, so one plan serves every size. The sadr keeps the start side and the ajuz the end side; on wide windows they form two even columns.

`scripts/kashida.ts` plans this when content is published. Each shorter half grows in three steps:

1. Its spaces, up to twice their width.
2. Kashida: long ones at a few joins (at most 6 tatweels at a join, 3 em in a half), best joins first. Where kashida may go follows Raqim's Naskh rules (Khaled Hosny), through the analyzer in `ar-justify`. Joins where Amiri draws a letter differently once stretched (بـثينة) come after the others.
3. Its spaces again, for whatever is left.

The bundle carries the measure and each half's kashida as `[offset, tatweels]` pairs (`poem.measure`, `poem.kashida`); the text itself never changes. The app inserts the tatweels (`withKashida`) and spreads the words across the measure. A screen too narrow for the measure wraps the words instead. Glossed words keep their own spelling as their accessible name.

Some halves have no join the rules allow (no kashida before ع, none after ل) and can only widen their spaces. `bun run content:build` lists every half whose spaces end up more than doubled: look at them before publishing. Wherever a bayt is shown it is set this way: the poem page's verses, the bayt at the top of its explanation, and the opening bayt on the home page's cards (the catalog carries each poem's measure and its opening bayt's kashida). `Half` and `Measure` in `components/ui/Measure.tsx` do the setting.
