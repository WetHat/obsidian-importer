---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Ambient Declarations

## Ambient Declarations

As we mentioned in [why TypeScript](Why%20TypeScript.md):

> A major design goal of TypeScript was to make it possible for you to safely and easily use existing JavaScript libraries in TypeScript. TypeScript does this by means of _declaration_.

Ambient declarations allow you to _safely use existing popular JavaScript libraries_ and _incrementally migrate your JavaScript/CoffeeScript/Other-Compile-To-Js-Language project to TypeScript_.

Studying patterns in ambient declarations for _third party JavaScript code_ is good practice for annotating _your_ TypeScript code base as well. This is why we present it so early on.