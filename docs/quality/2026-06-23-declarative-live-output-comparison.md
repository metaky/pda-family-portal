# Declarative Translator Live Output Comparison

Date: 2026-06-23

Scope: Phase 4 live quality pass using the source Declarative eval files and the portal-native `/api/declarative/translate` route.

Key handling: `GEMINI_API_KEY` was loaded from `/Users/kyle.wegner/Dev Projects/declarative/.env.local` for the local dev server. The key was not printed, copied into source, or committed.

## Source Sets Used

- `/Users/kyle.wegner/Dev Projects/declarative/evals/gemini-translation-prompt-set.json`
- `/Users/kyle.wegner/Dev Projects/declarative/evals/get-more-ideas-prompt-set.json`
- `/Users/kyle.wegner/Dev Projects/declarative/evals/variation-prompt-set.json`

## Cases Checked

Normal translation:

- Default short transition
- Default multi-part dinner flow
- Straightforward cleanup
- Straightforward Fewer Words
- Humorous safety redirection
- Humorous safety redirection with Fewer Words
- Interest Based Pokemon safety redirection
- Interest Based Pokemon safety redirection with Fewer Words
- Interest Based Pokemon dinner sequence with Fewer Words
- Equalizing cleanup destination
- Equalizing cleanup destination with Fewer Words
- Interest Based Pokemon cleanup destination
- Interest Based Pokemon cleanup destination with Fewer Words

Follow-up generation:

- Default shoes/car follow-up
- Interest Based dinosaur bedtime follow-up

Variations:

- Default dinner: shorter, warmer, more straightforward
- Straightforward school: shorter, warmer, more straightforward
- Interest Based dinosaur bedtime: shorter, warmer, more straightforward
- Interest Based Pokemon cleanup: shorter, warmer, more straightforward
- Equalizing dinner order framing: shorter, warmer, more straightforward

## Result

Technical result: pass. The portal route successfully called Gemini through the native Next.js route and returned normalized translation arrays.

Quality result after prompt hardening: acceptable for the Phase 4 MVP, with one residual watchlist area.

## Initial Findings

The first live pass showed that the route worked but the portal prompt was not yet source-app quality for several high-risk cases:

- Pokemon dinner Fewer Words produced weak/banned shapes such as Pokemon hand-wash framing and speed language for getting downstairs.
- Pokemon cleanup sometimes renamed real toys as Pokemon, which the source app explicitly avoids.
- Humorous Fewer Words safety had a few too-cute options, though the safety meaning was usually recoverable.

## Patch Applied

Added source-style prompt guardrails in `src/lib/declarative-translator.ts` and locked them with unit tests:

- Pokemon dinner: bans fake labels for hands, dinner, sink, and speed-to-dinner phrasing.
- Pokemon cleanup: requires toys/items/things to remain real objects and bans phrases such as "these Pokemon," "loose Pokemon," "Pokemon toys," "Pokemon cleanup," and "Pokemon'd away."
- Fewer Words Pokemon guidance: repeats the cleanup and meal-transition bans in compact mode.

## Post-Patch Spot Check

The rerun improved the failing Pokemon cleanup and dinner cases:

- Dinner/Pokemon Fewer Words kept sequence and used Squirtle/Poke-stop/Trainer route framing more appropriately.
- Cleanup/Pokemon kept toys/items as real objects and used Pokemon as route/comparison language.

Residual watchlist:

- One cleanup output used "Poke Balls" as a comparison. It did not replace the real destination, but it is theme-heavy enough to keep watching in future eval runs.

## Decision

Mark the Phase 4 live comparison task complete for the MVP. Do not claim full production parity yet. Before public launch, run the full source eval suite and consider porting the remaining source evaluator scripts so regressions can be scored more systematically.
