---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# lib.d.ts

- [lib.d.ts](lib.d.ts.md#^libdts)
- [Example Usage](lib.d.ts.md#^example-usage)
- [Inside look](lib.d.ts.md#^libdts-inside-look)
- [Modifying Native types](lib.d.ts.md#^modifying-native-types)
- [Using custom lib.d.ts](lib.d.ts.md#^using-your-own-custom-libdts)
- [Compiler `target` effect on lib.d.ts](lib.d.ts.md#^compiler-target-effect-on-libdts)
- [`lib` option](lib.d.ts.md#^lib-option)
- [Polyfill for old JavaScript engines](lib.d.ts.md#^polyfill-for-old-javascript-engines)

## `lib.d.ts` ^libdts

A special declaration file `lib.d.ts` ships with every installation of TypeScript. This file contains the ambient declarations for various common JavaScript constructs present in JavaScript runtimes and the DOM.

- This file is automatically included in the compilation context of a TypeScript project.
- The objective of this file is to make it easy for you to start writing _type checked_ JavaScript code.

You can exclude this file from the compilation context by specifying the `--noLib` compiler command line flag (or `"noLib" : true` in `tsconfig.json`).

### Example Usage ^example-usage

As always let's look at examples of this file being used in action:

```
var foo = 123;
var bar = foo.toString();
```

This code type checks fine _because_ the `toString` function is defined in `lib.d.ts` for all JavaScript objects.

If you use the same sample code with the `noLib` option you get a type check error:

```
var foo = 123;
var bar = foo.toString(); // ERROR: Property 'toString' does not exist on type 'number'.
```

So now that you understand the importance of `lib.d.ts`, what do its contents look like? We examine that next.

### `lib.d.ts` Inside Look ^libdts-inside-look

The contents of `lib.d.ts` are primarily a bunch of _variable_ declarations e.g. `window`, `document`, `math` and a bunch of similar _interface_ declarations e.g. `Window` , `Document`, `Math`.

The simplest way to read the documentation and type annotations of global stuff is to type in code _that you know works_ e.g. `Math.floor` and then F12 (go to definition) using your IDE (VSCode has great support for this).

Let's look at a sample _variable_ declaration, e.g. `window` is defined as:

```
declare var window: Window;
```

That is just a simple `declare var` followed by the variable name (here `window`) and an interface for a type annotation (here the `Window` interface). These variables generally point to some global _interface_ e.g. here is a small sample of the (actually quite massive) `Window` interface:

```
interface Window extends EventTarget, WindowTimers, WindowSessionStorage, WindowLocalStorage, WindowConsole, GlobalEventHandlers, IDBEnvironment, WindowBase64 {
    animationStartTime: number;
    applicationCache: ApplicationCache;
    clientInformation: Navigator;
    closed: boolean;
    crypto: Crypto;
    // so on and so forth...
}
```

You can see that there is a _lot_ of type information in these interfaces. In the absence of TypeScript _you_ would need to keep this in _your_ head. Now you can offload that knowledge on the compiler with easy access to it using things like `intellisense`.

There is a good reason for using _interfaces_ for these globals. It allows you to _add additional properties_ to these globals _without_ a need to change `lib.d.ts`. We will cover this concept next.

### Modifying Native Types ^modifying-native-types

Since an `interface` in TypeScript is open ended this means that you can just add members to the interfaces declared in `lib.d.ts` and TypeScript will pick up on the additions. Note that you need to make these changes in a [_global module_](Modules.md) for these interfaces to be associated with `lib.d.ts`. We even recommend creating a special file called [`global.d.ts`](global.d.ts.md) for this purpose.

Here are a few example cases where we add stuff to `window`, `Math`, `Date`:

#### Example `window`

Just add stuff to the `Window` interface e.g.:

```
interface Window {
    helloWorld(): void;
}
```

This will allow you to use it in a _type safe_ manner:

```
// Add it at runtime
window.helloWorld = () => console.log('hello world');
// Call it
window.helloWorld();
// Misuse it and you get an error:
window.helloWorld('gracius'); // Error: Supplied parameters do not match the signature of the call target
```

#### Example `Math`

The global variable `Math` is defined in `lib.d.ts` as (again, use your dev tools to navigate to definition):

```
/** An intrinsic object that provides basic mathematics functionality and constants. */
declare var Math: Math;
```

i.e. the variable `Math` is an instance of the `Math` interface. The `Math` interface is defined as:

```
interface Math {
    E: number;
    LN10: number;
    // others ...
}
```

This means that if you want to add stuff to the `Math` global variable you just need to add it to the `Math` global interface, e.g. consider the [`seedrandom` project](https://www.npmjs.com/package/seedrandom) which adds a `seedrandom` function to the global `Math` object. This can be declared quite easily:

```
interface Math {
    seedrandom(seed?: string);
}
```

And then you can just use it:

```
Math.seedrandom();
// or
Math.seedrandom("Any string you want!");
```

#### Example `Date`

If you look at the definition of the `Date` _variable_ in `lib.d.ts` you will find:

```
declare var Date: DateConstructor;
```

The interface `DateConstructor` is similar to what you have seen before with `Math` and `Window` in that it contains members you can use off of the `Date` global variable e.g. `Date.now()`. In addition to these members it contains _construct_ signatures which allow you to create `Date` instances (e.g. `new Date()`). A snippet of the `DateConstructor` interface is shown below:

```
interface DateConstructor {
    new (): Date;
    // ... other construct signatures

    now(): number;
    // ... other member functions
}
```

Consider the project [`datejs`](https://github.com/abritinthebay/datejs). DateJS adds members to both the `Date` global variable and `Date` instances. Therefore a TypeScript definition for this library would look like ([BTW the community has already written this for you in this case](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/datejs/index.d.ts)):

```
/** DateJS Public Static Methods */
interface DateConstructor {
    /** Gets a date that is set to the current date. The time is set to the start of the day (00:00 or 12:00 AM) */
    today(): Date;
    // ... so on and so forth
}

/** DateJS Public Instance Methods */
interface Date {
    /** Adds the specified number of milliseconds to this instance. */
    addMilliseconds(milliseconds: number): Date;
    // ... so on and so forth
}
```

This allows you to do stuff like the following in a TypeSafe manner:

```
var today = Date.today();
var todayAfter1second = today.addMilliseconds(1000);
```

#### Example `string`

If you look inside `lib.d.ts` for string you will find stuff similar to what we saw for `Date` (`String` global variable, `StringConstructor` interface, `String` interface). One thing of note though is that the `String` interface also impacts string _literals_ as demonstrated in the below code sample:

```
interface String {
    endsWith(suffix: string): boolean;
}

String.prototype.endsWith = function(suffix: string): boolean {
    var str: string = this;
    return str && str.indexOf(suffix, str.length - suffix.length) !== -1;
}

console.log('foo bar'.endsWith('bas')); // false
console.log('foo bas'.endsWith('bas')); // true
```

Similar variables and interfaces exist for other things that have both static and instance members like `Number`, `Boolean`, `RegExp`, etc. and these interfaces affect literal instances of these types as well.

### Example `string` redux

We recommended creating a `global.d.ts` for maintainability reasons. However, you can break into the _global namespace_ from within _a file module_ if you desire so. This is done using `declare global { /*global namespace here*/ }`. E.g. the previous example can also be done as:

```
// Ensure this is treated as a module.
export {};

declare global {
    interface String {
        endsWith(suffix: string): boolean;
    }
}

String.prototype.endsWith = function(suffix: string): boolean {
    var str: string = this;
    return str && str.indexOf(suffix, str.length - suffix.length) !== -1;
}

console.log('foo bar'.endsWith('bas')); // false
console.log('foo bas'.endsWith('bas')); // true
```

### Using your own custom lib.d.ts ^using-your-own-custom-libdts

As we mentioned earlier, using the `--noLib` boolean compiler flag causes TypeScript to exclude the automatic inclusion of `lib.d.ts`. There are various reasons why this is a useful feature. Here are a few of the common ones:

- You are running in a custom JavaScript environment that differs _significantly_ from the standard browser based runtime environment.
- You like to have _strict_ control over the _globals_ available in your code. E.g. lib.d.ts defines `item` as a global variable and you don't want this to leak into your code.

Once you have excluded the default `lib.d.ts` you can include a similarly named file into your compilation context and TypeScript will pick it up for type checking.

> Note: be careful with `--noLib`. Once you are in noLib land, if you choose to share your project with others, they will be _forced_ into noLib land (or rather _your lib_ land). Even worse, if you bring _their_ code into your project you might need to port it to _your lib_ based code.

### Compiler target effect on `lib.d.ts` ^compiler-target-effect-on-libdts

Setting the compiler target to `es6` causes the `lib.d.ts` to include _additional_ ambient declarations for more modern (es6) stuff like `Promise`. This magical effect of the compiler target changing the _ambience_ of the code is desirable for some people and for others it's problematic as it conflates _code generation_ with _code ambience_.

However, if you want finer grained control of your environment, you should use the `--lib` option which we discuss next.

### lib option ^lib-option

Sometimes (many times) you want to decouple the relationship between the compile target (the generated JavaScript version) and the ambient library support. A common example is `Promise`, e.g. today (in June 2016) you most likely want to `--target es5` but still use the latest features like `Promise`. To support this you can take explicit control of `lib` using the `lib` compiler option.

> Note: using `--lib` decouples any lib magic from `--target` giving you better control.

You can provide this option on the command line or in `tsconfig.json` (recommended):

**Command line**:

```
tsc --target es5 --lib dom,es6
```

**tsconfig.json**:

```
"compilerOptions": {
    "lib": ["dom", "es6"]
}
```

The libs can be categorized as follows:

- JavaScript Bulk Feature:
    - es5
    - es6
    - es2015
    - es7
    - es2016
    - es2017
    - esnext
- Runtime Environment
    - dom
    - dom.iterable
    - webworker
    - scripthost
- ESNext By-Feature Options (even smaller than bulk feature)
    - es2015.core
    - es2015.collection
    - es2015.generator
    - es2015.iterable
    - es2015.promise
    - es2015.proxy
    - es2015.reflect
    - es2015.symbol
    - es2015.symbol.wellknown
    - es2016.array.include
    - es2017.object
    - es2017.sharedmemory
    - esnext.asynciterable

> NOTE: the `--lib` option provides extremely fine tuned control. So you most likely want to pick an item from the bulk + environment categories. If --lib is not specified a default library is injected:
> 
> - For --target es5 =＞ es5, dom, scripthost
> - For --target es6 =＞ es6, dom, dom.iterable, scripthost

My Personal Recommendation:

```
"compilerOptions": {
    "target": "es5",
    "lib": ["es6", "dom"]
}
```

Example Including Symbol with ES5:

Symbol API is not included when target is es5. In fact, we receive an error like: ［ts］ Cannot find name 'Symbol'. We can use "target": "es5" in combination with "lib" to provide Symbol API in TypeScript:

```
"compilerOptions": {
    "target": "es5",
    "lib": ["es5", "dom", "scripthost", "es2015.symbol"]
}
```

## Polyfill for old JavaScript engines ^polyfill-for-old-javascript-engines

> [Egghead PRO Video on this subject](https://egghead.io/lessons/typescript-using-es6-and-esnext-with-typescript)

There are quite a few runtime features that are like `Map` / `Set` and even `Promise` (this list will of course change over time) that you can use with modern `lib` options. To use these all you need to do is use `core-js`. Simply install:

```
npm install core-js --save-dev
```

And add an import to your application entry point:

```
import "core-js";
```

And it should polyfill these runtime features for you 🌹.