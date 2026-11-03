# Fantasy Realms Scorer

Expo/React Native app that works out your score for the Fantasy Realms card game.

## Commands

```bash
adb connect <phone-ip>:<port>        # connect phone via wireless debugging
npx expo run:android --device        # build, install, and run on phone
npx expo start --dev-client          # dev server only
npx expo prebuild -p android --clean # regenerate android/
npx expo install <package>           # add a dependency
npx expo-doctor                      # diagnose project issues
npm run lint                         # run ESLint, including layer boundary rules
npm test                             # run Jest tests
npm run test:e2e                     # run Maestro flows on the installed debug build, starting Metro if needed
npm run test:e2e:build               # build and install the debug app, then run the flows, starting Metro if needed
npm run test:e2e:release             # run Maestro flows on the installed release build
npm run test:e2e:build:release       # build and install the release app, then run the flows
```

Do not install the app on the phone or run Maestro flows unless explicitly told to.

## Architecture

Hexagonal. Dependencies point inwards; ESLint enforces the boundaries.

- `src/domain/`: pure business rules and types. Imports only `domain`.
- `src/application/`: use cases, as `<name>.usecase.ts` plus `<name>.ports.ts` if it has ports. `use-cases.ts` holds the `UseCases` type. Imports `domain` and `application`; no React, Redux or Expo.
- `src/infrastructure/driven/`: general-purpose adapter classes that satisfy ports structurally, without `implements`. Imports `domain` and its own libraries, not `application`.
- `src/infrastructure/driving/`: `state/` (Redux slices, thunks, selectors) and `ui/` (components). Must not import `driven`.
- `src/composition-root.ts`: the only file that imports Awilix. Builds the use cases.
- `src/main.tsx`: the entry point (`main` in `package.json`). Builds the store, registers the root component, and is the only file with startup side effects.

Conventions:

- Use cases: a `<Name>` interface, implemented by a `<Name>UseCase` class with an `execute` method. `UseCases` refers to the interfaces, so tests can use simple fakes. Domain values stay plain data and functions.
- Dependency injection: use case constructors destructure their ports, so a missing registration fails at startup. Use `InjectionMode.PROXY`, and register explicitly rather than using `loadModules`. Register with `asFunction((deps: Cradle) => new X(deps))` rather than `asClass`, which doesn't type-check constructor arguments.
- Ports: each `.ports.ts` file belongs to one use case, exports a `<Name>Ports` interface plus named interfaces for each capability, and declares only what that use case calls. Tolerate similar ports, and extract a shared type only if they keep changing together.
- Commands: anything that changes state goes UI -> thunk -> use case, even with no I/O, so adding I/O later doesn't change the call path. Thunks receive use cases through the `extra` argument and never see ports.
- Reads: selectors derive values by calling pure domain functions directly. Use cases are for commands only.
- Components only dispatch thunks and slice actions, and read selectors.
- Purely visual state, which wouldn't matter if the UI were replaced, can use a plain slice action rather than a thunk and use case.
- Store state must be serializable. Derive values with selectors rather than storing them.
- Add a driven port when a use case needs something it doesn't own or determine itself: outside state, I/O, time, randomness. Logic we own goes in the domain. Cards are the exception: they are always served through the `CardCatalog` port, even as constants.
- Redux and the UI only handle display data. Scoring logic stays in the application and domain layers.
