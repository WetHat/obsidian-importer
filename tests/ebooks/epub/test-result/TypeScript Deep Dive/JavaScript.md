---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# JavaScript

# Your JavaScript is TypeScript

There were (and will continue to be) a lot of competitors in _Some syntax_ to _JavaScript_ compilers. TypeScript is different from them in that _Your JavaScript is TypeScript_. Here's a diagram:

![](8f2cd40f.png)

However, it does mean that _you need to learn JavaScript_ (the good news is _you **only** need to learn JavaScript_). TypeScript is just standardizing all the ways you provide _good documentation_ on JavaScript.

- Just giving you a new syntax doesn't help catch bugs - but might help you write cleaner / less bugs (e.g. CoffeeScript).
- Creating a new language abstracts you too far from your runtimes and communities - but might help on-board you easier if its an already familiar flavour (e.g. Dart - closer for Java / C# devs).

TypeScript is just JavaScript with docs.

> JSNext is open to interpretation - not everything proposed for the next version of JS actually makes it to browsers. TypeScript only adds support for proposals once they reach [stage 3](https://tc39.es/process-document/).

## Making JavaScript Better

TypeScript will try to protect you from portions of JavaScript that never worked (so you don't need to remember this stuff):

```
[] + []; // JavaScript will give you "" (which makes little sense), TypeScript will error

//
// other things that are nonsensical in JavaScript
// - don't give a runtime error (making debugging hard)
// - but TypeScript will give a compile time error (making debugging unnecessary)
//
{} + []; // JS : 0, TS Error
[] + {}; // JS : "[object Object]", TS Error
{} + {}; // JS : NaN or [object Object][object Object] depending upon browser, TS Error
"hello" - 1; // JS : NaN, TS Error

function add(a,b) {
  return
    a + b; // JS : undefined, TS Error 'unreachable code detected'
}
```

Essentially TypeScript is linting JavaScript. Just doing a better job at it than other linters that don't have _type information_.

## You still need to learn JavaScript

That said TypeScript is very pragmatic about the fact that _you do write JavaScript_ so there are some things about JavaScript that you still need to know in order to not be caught off-guard. Let's discuss them next.

> Note: TypeScript is a superset of JavaScript. Just with documentation that can actually be used by compilers / IDEs ;)