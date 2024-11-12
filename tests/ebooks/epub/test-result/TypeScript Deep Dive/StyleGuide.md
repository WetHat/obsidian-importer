---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# StyleGuide

# TypeScript Style Guide and Coding Conventions

> An unofficial TypeScript Style Guide

People have asked me for my opinions on this. Personally I don't enforce these a lot on my teams and projects but it does help to have these mentioned as a tiebreaker when someone feels the need to have such strong consistency. There are other things that I feel much more strongly about and those are covered in the [tips chapter](TIPs.md) (e.g. type assertion is bad, property setters are bad) 🌹.

Key Sections:

- [Variable](StyleGuide.md#^variable-and-function)
- [Class](StyleGuide.md#^class)
- [Interface](StyleGuide.md#^interface)
- [Type](StyleGuide.md#^type)
- [Namespace](StyleGuide.md#^namespace)
- [Enum](StyleGuide.md#^enum)
- [`null` vs. `undefined`](StyleGuide.md#^null-vs-undefined)
- [Formatting](StyleGuide.md#^formatting)
- [Single vs. Double Quotes](StyleGuide.md#^quotes)
- [Tabs vs. Spaces](StyleGuide.md#^spaces)
- [Use semicolons](StyleGuide.md#^semicolons)
- [Annotate Arrays as Type\[]](StyleGuide.md#^array)
- [File Names](StyleGuide.md#^filename)
- [`type` vs `interface`](StyleGuide.md#^type-vs-interface)
- [`==` or `===`](StyleGuide.md)

## Variable and Function ^variable-and-function

- Use `camelCase` for variable and function names

> Reason: Conventional JavaScript

**Bad**

```
var FooVar;
function BarFunc() { }
```

**Good**

```
var fooVar;
function barFunc() { }
```

## Class ^class

- Use `PascalCase` for class names.

> Reason: This is actually fairly conventional in standard JavaScript.

**Bad**

```
class foo { }
```

**Good**

```
class Foo { }
```

- Use `camelCase` of class members and methods

> Reason: Naturally follows from variable and function naming convention.

**Bad**

```
class Foo {
    Bar: number;
    Baz() { }
}
```

**Good**

```
class Foo {
    bar: number;
    baz() { }
}
```

## Interface ^interface

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

- **Don't** prefix with `I`

> Reason: Unconventional. `lib.d.ts` defines important interfaces without an `I` (e.g. Window, Document etc).

**Bad**

```
interface IFoo {
}
```

**Good**

```
interface Foo {
}
```

## Type ^type

- Use `PascalCase` for name.

> Reason: Similar to class

- Use `camelCase` for members.

> Reason: Similar to class

## Namespace ^namespace

- Use `PascalCase` for names

> Reason: Convention followed by the TypeScript team. Namespaces are effectively just a class with static members. Class names are `PascalCase` =＞ Namespace names are `PascalCase`

**Bad**

```
namespace foo {
}
```

**Good**

```
namespace Foo {
}
```

## Enum ^enum

- Use `PascalCase` for enum names

> Reason: Similar to Class. Is a Type.

**Bad**

```
enum color {
}
```

**Good**

```
enum Color {
}
```

- Use `PascalCase` for enum member

> Reason: Convention followed by TypeScript team i.e. the language creators e.g `SyntaxKind.StringLiteral`. Also helps with translation (code generation) of other languages into TypeScript.

**Bad**

```
enum Color {
    red
}
```

**Good**

```
enum Color {
    Red
}
```

## Null vs. Undefined ^null-vs-undefined

- Prefer not to use either for explicit unavailability

> Reason: these values are commonly used to keep a consistent structure between values. In TypeScript you use _types_ to denote the structure

**Bad**

```
let foo = { x: 123, y: undefined };
```

**Good**

```
let foo: { x: number, y?: number } = { x:123 };
```

- Use `undefined` in general (do consider returning an object like `{valid:boolean, value?:Foo}` instead)

**Bad**

```
return null;
```

**Good**

```
return undefined;
```

- Use `null` where it's a part of the API or conventional

> Reason: It is conventional in Node.js e.g. `error` is `null` for NodeBack style callbacks.

**Bad**

```
cb(undefined)
```

**Good**

```
cb(null)
```

- Use _truthy_ check for **objects** being `null` or `undefined`

**Bad**

```
if (error === null)
```

**Good**

```
if (error)
```

- Use `== null` / `!= null` (not `===` / `!==`) to check for `null` / `undefined` on primitives as it works for both `null`/`undefined` but not other falsy values (like `''`, `0`, `false`) e.g.

**Bad**

```
if (error !== null) // does not rule out undefined
```

**Good**

```
if (error != null) // rules out both null and undefined
```

## Formatting ^formatting

The TypeScript compiler ships with a very nice formatting language service. Whatever output it gives by default is good enough to reduce the cognitive overload on the team.

Use [`tsfmt`](https://github.com/vvakame/typescript-formatter) to automatically format your code on the command line. Also, your IDE (atom/vscode/vs/sublime) already has formatting support built-in.

Examples:

```
// Space before type i.e. foo:<space>string
const foo: string = "hello";
```

## Quotes ^quotes

- Prefer single quotes (`'`) unless escaping.

> Reason: More JavaScript teams do this (e.g. [airbnb](https://github.com/airbnb/javascript), [standard](https://github.com/feross/standard), [npm](https://github.com/npm/npm), [node](https://github.com/nodejs/node), [google/angular](https://github.com/angular/angular/), [facebook/react](https://github.com/facebook/react)). It's easier to type (no shift needed on most keyboards). [Prettier team recommends single quotes as well](https://github.com/prettier/prettier/issues/1105)
> 
> Double quotes are not without merit: Allows easier copy paste of objects into JSON. Allows people to use other languages to work without changing their quote character. Allows you to use apostrophes e.g. `He's not going.`. But I'd rather not deviate from where the JS Community is fairly decided.

- When you can't use double quotes, try using back ticks (`).

> Reason: These generally represent the intent of complex enough strings.

## Spaces ^spaces

- Use `2` spaces. Not tabs.

> Reason: More JavaScript teams do this (e.g. [airbnb](https://github.com/airbnb/javascript), [idiomatic](https://github.com/rwaldron/idiomatic.js), [standard](https://github.com/feross/standard), [npm](https://github.com/npm/npm), [node](https://github.com/nodejs/node), [google/angular](https://github.com/angular/angular/), [facebook/react](https://github.com/facebook/react)). The TypeScript/VSCode teams use 4 spaces but are definitely the exception in the ecosystem.

## Semicolons ^semicolons

- Use semicolons.

> Reasons: Explicit semicolons helps language formatting tools give consistent results. Missing ASI (automatic semicolon insertion) can trip new devs e.g. `foo() \n (function(){})` will be a single statement (not two). TC39 [warning on this as well](https://github.com/tc39/ecma262/pull/1062). Example teams: [airbnb](https://github.com/airbnb/javascript), [idiomatic](https://github.com/rwaldron/idiomatic.js), [google/angular](https://github.com/angular/angular/), [facebook/react](https://github.com/facebook/react), [Microsoft/TypeScript](https://github.com/Microsoft/TypeScript/).

## Array ^array

- Annotate arrays as `foos: Foo[]` instead of `foos: Array<Foo>`.

> Reasons: It's easier to read. It's used by the TypeScript team. Makes easier to know something is an array as the mind is trained to detect `[]`.

## Filename ^filename

Name files with `camelCase`. E.g. `utils.ts`, `map.ts` etc.

> Reason: Conventional across many JS teams.

When the file exports a component and your framework (like React) wants component to be PascalCased, use pascal case file name to match e.g. `Accordion.tsx`, `MyControl.tsx`.

> Reason: Helps with consistency (little overthought required) and its what the ecosystem is doing.

## type vs. interface ^type-vs-interface

- Use `type` when you _might_ need a union or intersection:

```
type Foo = number | { someProperty: number }
```

- Use `interface` when you want `extends` or `implements` e.g.

```
interface Foo {
  foo: string;
}
interface FooBar extends Foo {
  bar: string;
}
class X implements FooBar {
  foo: string;
  bar: string;
}
```

- Otherwise use whatever makes you happy that day. I use [type](https://www.youtube.com/watch?v=IXAT3If0pGI)

## `==` or `===`

Both are [mostly safe for TypeScript users](https://www.youtube.com/watch?v=vBhRXMDlA18). I use `===` as that is what is used in the TypeScript codebase.