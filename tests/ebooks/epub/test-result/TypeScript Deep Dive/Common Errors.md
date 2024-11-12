---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Common Errors

# Common Errors

In this section we explain a number of common error codes that users experience in the real world.

## TS2304

Samples:

> `Cannot find name ga` `Cannot find name $` `Cannot find module jquery`

You are probably using a third party library (e.g. google analytics) and don't have it `declare`d. TypeScript tries to save you from _spelling mistakes_ and _using variables without declaring them_ so you need to be explicit on anything that is _available at runtime_ because of you including some external library ([more on how to fix it](Declaration%20Files.md)).

## TS2307

Samples:

> `Cannot find module 'underscore'`

You are probably using a third party library (e.g. underscore) as a _module_ ([more on modules](Modules.md)) and don't have the ambient declaration file for it ([more on ambient declarations](Declaration%20Files.md)).

## TS1148

Sample:

> Cannot compile modules unless the '--module' flag is provided

Checkout the [section on modules](Modules.md).

## Catch clause variable cannot have a type annotation

Sample:

```
try { something(); }
catch (e: Error) { // Catch clause variable cannot have a type annotation
}
```

TypeScript is protecting you from JavaScript code in the wild being wrong. Use a type guard instead:

```
try { something(); }
catch (e) {
  if (e instanceof Error){
    // Here you go.
  }
}
```

## Interface `ElementClass` cannot simultaneously extend types `Component` and `Component`

This happens when you have two `react.d.ts` (`@types/react/index.d.ts`) in the compilation context.

**Fix**:

- Delete `node_modules` and any `package-lock` (or yarn lock) and `npm install` again.
- If it doesn't work, find the invalid module (all modules used by your project should have `react.d.ts` as a `peerDependency` and not a hard `dependency`) and report it on their project.