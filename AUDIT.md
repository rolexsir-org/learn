# LEARN 2.0 repository audit

**Audited:** 2026-11-16
**Branch/base:** `arena/b651914c-learn` / `28b318e9cbb385d5051c6cc899e31162cadb7d4e`
**Scope:** tracked repository inventory, app/configuration, all top-level source areas, Firebase rules/configuration, tests, Android project configuration, install/build/test/typecheck and npm advisory checks. No production Firebase or Play Console access was used.

## Executive summary

LEARN is a React 19 + TypeScript + Vite single-page English-learning game for children, packaged for Android with Capacitor. It already has a broad set of useful learning and creative features, offline/local persistence, and a Firestore sync worker. It is **not production-ready yet**: there is a verified cross-account profile disclosure in Firestore rules, the advertised rules tests are placeholders, `tsc` currently fails, the shipped JS is very large, and dependency audit reports vulnerabilities. No production data was changed.

## Architecture report

- **Web app:** `src/main.tsx` mounts a React StrictMode tree with an error boundary and notification provider. `src/App.tsx` (894 lines) owns auth bootstrap, profile restoration, local/cloud merge, reward actions, routing-by-tab, and most application state. Feature views are individual components under `src/components/`; route state is a union of tabs rather than a URL router.
- **State/persistence:** React state plus `StorageService`, which mirrors data between browser `localStorage` and Capacitor Preferences. `SyncWorkerService` persists an application-level retry queue and writes queued operations directly to Firestore. `AssetCacheService` and audio prefetch handle assets. This is a hybrid offline strategy, not verified Firestore offline persistence.
- **Backend:** Firebase client SDK. `src/lib/firebase.ts` initializes Auth, Firestore and optional Analytics from the tracked applet configuration. App bootstrap automatically signs users in anonymously. There is no server API for trusted reward mutation, no Cloud Functions source, Storage rules, or Firebase CLI deployment config in the tracked inventory.
- **Android:** Capacitor 8 Android project, package ID `com.englishexplorer.kidslearning`, Java `BridgeActivity`, target SDK 35 / compile SDK 36, min SDK 24, Gradle wrapper 8.14.3, Java 17 in the app module. Native startup handles splash/status-bar/back button/reminders. The app version remains 1.0 and release minification is disabled.
- **Build/server:** Vite frontend plus Express wrapper (`server.ts`) in dev/production, with a health endpoint. Build also bundles the Express entrypoint. No CI workflow or deployment automation is tracked.

## Feature inventory

Existing features found in source and README:

- Themed learning worlds, adventure map, spelling/phonics word game, audio/speech feedback, word vault and progress tracking.
- Story time with reading/narration and questions; coloring canvas/templates; sticker album; mascot/character collection and customizations; daily quests and reward chest.
- Parent dashboard with an arithmetic gate, progress/accuracy/time summaries, word list, collection and sharing.
- Leaderboard/friend-facing presentation, sound preference, local persistence, sync-status notifications, asset/audio caching and daily local notifications.
- Child-facing background/mascot effects and orientation handling.

The inventory reflects source-level functionality; this audit did not claim every interaction works end-to-end.

## Security and privacy report

### Verified findings

1. **High priority — cross-account profile reads permitted.** `firestore.rules` allows every signed-in user to `get` and `list` every `/users/{userId}` document. Those documents contain a display name and educational/reward/streak statistics. `src/components/Leaderboard.tsx` issues an unfiltered ordered query over the entire `users` collection. The global `allow read, write: if false` rule does not negate a more specific matching `allow`: Firestore allows access if any matching allow expression is true.
2. **Client-controlled rewards/progress.** The app directly writes star/coin increments, mastery and reward claims from the client; rules validate ownership/types, not that a trusted learning/reward event occurred. Anonymous Firebase authentication provides a UID but not a parent identity or a trusted reward authority. A client can modify its own rewards. Do not treat stars, coins, mastery or the arithmetic parent gate as tamper-proof.
3. **Parent gate is not authorization.** The dashboard's random addition question is a client-side UX gate; it is not account re-authentication, parental consent, or server-side access control.
4. **Analytics can include child-learning signals.** Client analytics associates Firebase UID and sends event parameters including word, accuracy, speed and reward details. Review consent, retention and child-privacy requirements before enabling in production.
5. **Firebase setup is incomplete for deployment.** No Storage rules, Functions source, `firebase.json`, index definitions or emulator configuration are tracked. Current app client uses Firestore/Auth, and no Storage usage was found in the reviewed source. Firebase API keys in web config are public client identifiers, not server secrets; enforce access through rules and provider restrictions.
6. **Security rules test file is not a test of rules.** Both cases are commented-out templates and assert `true`; no emulator is started. The dependency `@firebase/rules-unit-testing` is imported but absent from `package.json`.

### Remaining security risks

- `UPDATE_USER_STATS`, `WORD_PROGRESS`, `DAILY_CLAIM`, and unlock processing have no trusted server validation or idempotency. The sync worker drops an item after five failures, which may silently lose progress/reward updates.
- Rules contain validation gaps relative to `security_spec.md`: time/date fields, array limits/content, streak caps, mastery/accuracy relationship and field allowlists are not comprehensively enforced. Profile fields are client-writable. `isAdmin()` is a hard-coded verified-email check; avoid depending on client profile claims for administrative authority.
- Error logging includes raw Firestore error text/auth metadata in `handleFirestoreError`; analytics `logError` can record arbitrary error strings.
- Child-privacy, parental-consent, data deletion/export, retention and abuse/rate limiting are not implemented or evidenced by the repository.

## Performance report

- Verified production frontend build succeeds, but Vite reports a **1,470.26 kB minified JS entry (398.49 kB gzip)** and warns that chunks exceed 500 kB. All 2,735 modules were transformed into the initial app bundle; the large creative/features code is not currently split into route-level chunks.
- Startup calls preload of all app assets and audio. Measure the impact on constrained Android networks/devices before retaining eager prefetch.
- `App.tsx` combines unrelated state, backend orchestration and UI selection, creating a high coupling/change-risk area.
- No Lighthouse/Web Vitals, Android startup, memory, query cost, or offline sync benchmarks are present. Targets should be measured before claiming an optimization.

## Dependency report

- Runtime stack includes React 19, Firebase 12, Capacitor 8, Tailwind 4/Vite plugin, Framer Motion and `motion`, Recharts, Express, `canvas-confetti`, `clsx`, `tailwind-merge`, and dotenv. Both `framer-motion` and `motion` are declared; usage and bundle contribution should be checked before removing either. Unused dependencies have not been removed without verification.
- `npm ci` installed 490 packages. npm reported **28 vulnerabilities total** (2 low, 11 moderate, 10 high, 5 critical). Production-only `npm audit --omit=dev` reported **16** (2 low, 3 moderate, 8 high, 3 critical), including advisories in Capacitor Android, Firebase transitive gRPC/protobuf packages, Express transitive dependencies, and Vite-related packages. Apply compatible targeted updates and re-run audit; do not use blind force upgrades.
- React/React DOM type packages are missing, despite strict TypeScript. `@firebase/rules-unit-testing` is imported by a placeholder test but not declared.
- Lockfile exists; `bun.lock` is zero bytes and is not a usable Bun lockfile.

## Quality, testing and technical debt

- `npm test`: **passes 7 tests in 3 files**, but only stats logic and two sync-worker tests are meaningful unit-level coverage; security “tests” are placeholders.
- `npm run build`: **passes**, with the large-chunk warning noted above.
- `npm run lint` (`tsc --noEmit`): **fails**. It reports absent React/React DOM declaration files, absent rules-testing declarations/dependency, several strict type errors, and verified unresolved `userXp` references in `src/App.tsx` (near the world selector and map). Build does not run typecheck, so successful bundling is not a type-safe release.
- There are no component, browser E2E, auth emulator, rules emulator, offline reconciliation, responsive, or Android build tests. Existing Android unit/instrumented tests are generated examples, not application coverage.
- App-level tab navigation and data orchestration live in one large component. Several service classes start timers/listeners at module/singleton lifetime; lifecycle/disposal needs explicit review.

## Android/deployment findings

- Capacitor and Gradle/SDK configuration are present and internally aligned to Java 17 at module level; no Android SDK/Gradle build was executed in this audit. Release signing is not configured in source (appropriate for keeping signing credentials out of Git), release minification is off, and no release procedure is documented.
- Manifest requests INTERNET only; no deep-link intent filter is configured. Back behavior is handled in JavaScript startup. A real device/emulator validation is still needed for keyboard resize, native splash hide, status/navigation bars, lifecycle, offline behavior and notifications.
- `capacitor.config.ts` allows cleartext traffic. Review whether this is needed for local development and disallow it in release configuration.
- `server.ts` uses a fixed port 3000 rather than `PORT`; deployment/health behavior and hosting assumptions need to be made explicit.
- No CI, Firebase deploy configuration, monitoring integration, backup/restore procedure or production deployment documentation is present. No deployment was attempted.

## Prioritized implementation roadmap

### P0 — privacy and release blockers
1. Restrict Firestore profile access to the owning UID and make the leaderboard a deliberately privacy-safe experience; do not list child profiles.
2. Add real Firestore Emulator rules tests for owner access, spoofing, public list, unknown fields, invalid rewards/progress and valid legacy documents. Confirm current data shapes before tightening schemas.
3. Add missing type/test dependencies, fix all TypeScript errors (including unresolved `userXp`), and make typecheck part of `build`/CI.
4. Decide product and compliance requirements for anonymous child accounts, parent accounts/consent, analytics and data deletion before production.

### P1 — trusted data and resilient sync
5. Specify stable Firestore schemas and compatibility mapping; introduce server-validated, idempotent reward/progress operations (Callable Functions/App Check or another trusted backend), then migrate client writes only after emulator tests.
6. Harden local queue validation, retry/backoff, observability and recovery; test duplicate/offline/auth-change cases. Define safe progression behavior without a backend.
7. Add missing Firebase project/rules/index/emulator configuration and deployment documentation; add Storage rules only if Storage becomes a feature.

### P2 — product architecture and experience
8. Establish an accessible visual token/component system, then redesign existing screens in user-tested slices without deleting features.
9. Separate auth/data/domain state from UI; introduce typed repositories, error/loading/empty patterns and URL navigation only where it improves UX.
10. Add parent-controlled profile/privacy/settings and age-appropriate consent-aware telemetry. Review social/leaderboard behavior for child safety.

### P3 — delivery quality
11. Lazy-load heavy views, remove duplicate/unused dependencies only after usage/bundle verification, and benchmark cold start, web vitals and Android devices.
12. Add component/integration/E2E, responsive, emulator sync/security and Android build tests; add CI, monitoring, backup/restore, signing instructions and release checklist.

**Exit gates:** no cross-user child profile reads; emulator rules tests actually run; clean strict typecheck; clean production dependency audit or documented accepted residuals; production build/code-split budget; tested Android release artifact and operational recovery/deployment docs. None of these gates should be represented as met until verified.

## Remediation completed during this audit turn

- Tightened `/users/{userId}` profile `get`/`list` rules to require ownership. The app's old collection-wide leaderboard request was removed; the screen is now explicitly a local practice board with fictional sample characters and a privacy disclosure. No user profiles are read for ranking. **Rules behavior tests were added but are skipped here because no Firestore Emulator is running** (5 tests passed, 3 emulator-backed rules tests skipped).
- Added the missing React/React DOM type packages and declared the already-imported Firebase rules test package. Fixed strict type errors uncovered by enabling types: Story Time's omitted imports/props (which made that screen fail at runtime), missing `cn` usage import in WordGame, the ErrorBoundary `this.props.children` bug, no-argument sound helper signatures, and undefined `userXp` references (use existing star count as XP).
- Changed production build to run strict `tsc --noEmit` before Vite. `npm run build` now passes this typecheck.
- Lazy-loaded feature views and the parent phonics chart; added React/Firebase/animation vendor chunking. The largest single JS chunk is now the 486.67 kB Firebase vendor and the app entry is 202.19 kB (53.54 kB gzip), rather than the prior 1,465.33 kB single entry (396.77 kB gzip). This is a build-artifact comparison, not a field performance measurement; Firebase remains an eagerly loaded shared dependency and should be profiled further.
- Added `.e2b.app` to Vite's allowed hosts for the Agent Mode preview. The Express/Vite preview returned HTTP 200 using the preview host, and `/api/health` responded successfully.

## Current verification after the remediation slice

- `npm run lint`: passed (strict TypeScript, no errors).
- `npm test`: 5 passed, 3 skipped; the 3 skipped tests require a running Firestore Emulator and are real `assertSucceeds`/`assertFails` rule checks when enabled.
- `npm run build`: passed, including typecheck. No >500 kB chunk warning after code splitting; Firebase vendor is close to the 500 kB warning threshold.
- `git diff --check`: passed.
- `npm audit --omit=dev`: still reports 16 vulnerabilities (2 low, 3 moderate, 8 high, 3 critical); no dependency update was attempted blindly.
- Android build, Firebase Emulator rule execution, browser/Android E2E, and production deploy remain unverified/not performed.
- Repaired README's mixed UTF-8/UTF-16LE tail (embedded NUL bytes and duplicate placeholder headings) while updating its test/security instructions.

## Follow-up progress (2026-11-16)

The sections above preserve the initial audit snapshot and are historical where they conflict with the current verification below.

- Continued the visual redesign with a responsive desktop sidebar/mobile bottom navigation, a learning-home progress/continue overview, a calmer ambient shell without the continuous particle layer, and a gated Parent Dashboard Settings tab for sound preferences and a clear privacy/account limitations notice. Added accessible dialog/tab/switch semantics and tests. Existing learning activities remain accessible from the new navigation.
- Replaced unvalidated persisted navigation casts with a typed tab allowlist before applying local or Firestore checkpoints.
- Added component coverage for the parent check/settings interaction. Latest tests: **9 passed; 3 Firestore Emulator rules tests skipped**, because `FIRESTORE_EMULATOR_HOST` is not configured. The skipped tests have not been verified against an emulator.
- Dependency remediation is now reflected in the lockfile: `npm ci` completes and both `npm audit` and `npm audit --omit=dev` report **0 vulnerabilities**. This is the npm audit result, not a claim of complete supply-chain/security review.
- Latest `npm run lint` passed. Latest `npm run build` passed, but currently emits Vite's >500 kB chunk warning: `firebase-vendor` is 707.53 kB minified (174.53 kB gzip). Feature views are lazy-loaded; Firebase still needs further safe splitting/measurement. Artifact sizes are not real-device performance measurements.
- `git diff --check` passed. The development preview remains running and returned HTTP 200 for the app and health endpoint.
- No Firestore Emulator execution, browser E2E, Android SDK/Gradle build, trusted rewards backend, Firebase deployment, live-data mutation, or production deployment has occurred. Those remain open gates.

## Audio subsystem progress (2026-11-16)

- Inspected the prior split implementation: independent Web Audio contexts, eager synthesis/buffer pre-rendering at startup, a separate speech fallback tone generator, sound callbacks that inconsistently ignored mute state, and a periodic ambient chirp loop. Consolidated these paths behind `src/services/AudioManager.ts`; legacy `soundFx` calls now route to the same effects bus.
- Added independent persistent master-mute, music/effects/voice levels, speaking rate, music opt-in, and actual device voice selection. Scene music is looped and crossfaded; story narration pauses/resumes music; celebration music is a temporary scene only when music is enabled. A two-player media-element strategy avoids decoding all tracks into AudioBuffers. Startup preload now hints metadata for one local track instead of creating an AudioContext and pre-rendering all effects/word “voices”.
- Added four generated local instrumental WAV loops (calm, story, game, celebration), composed solely by `scripts/generate_audio_assets.py`, with no third-party recordings/samples. `AUDIO_ASSETS.md` records source/license and platform limits. Each track is ~776 KiB; static preview request for `calm.wav` returned HTTP 200. Assets are bundled with Android, so installed-app playback does not need a network fetch.
- Added parent audio settings for global mute, music on/off, independent volume sliders, speech speed, installed exact `en-US`/`en-GB` voice list, preview/pause/resume/stop, and looping music progress/seek/replay. No accent is offered unless the browser reports a matching voice. Story narration now has pause/resume and can be replayed by starting the page narration again.
- Added manager, TTS selection/playback, and local-asset tests. Latest result: **15 passed; 3 Firestore Emulator rules tests skipped** (not audio tests). `npm run lint` passed, `npm run build` passed, production `npm audit --omit=dev` reported 0 vulnerabilities, and preview served both app and audio with HTTP 200.
- **Not verified:** playback on a physical Android device; native audio-focus/call interruption behavior; Bluetooth/headphone routing; speaker-vs-headphone differences; measured latency, battery, memory, or runtime offline behavior. Capacitor lifecycle and browser visibility events are handled, but web code cannot guarantee every Android audio-focus transition. Device TTS/accent availability is OS/browser-specific. Do not claim these checks passed.
