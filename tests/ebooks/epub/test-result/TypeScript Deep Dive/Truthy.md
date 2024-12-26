---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Truthy

## Truthy

JavaScript has a concept of `truthy` i.e. things that evaluate like `true` would in certain positions (e.g. `if` conditions and the boolean `&&` `||` operators). The following things are truthy in JavaScript. An example is any number other than `0` e.g.

```
if (123) { // Will be treated like `true`
  console.log('Any number other than 0 is truthy');
}
```

Something that isn't truthy is called `falsy`.

Here's a handy table for your reference.

|Variable Type|When it is _falsy_|When it is _truthy_|
|---|---|---|
|`boolean`|`false`|`true`|
|`string`|`''` (empty string)|any other string|
|`number`|`0` `NaN`|any other number|
|`null`|always|never|
|`undefined`|always|never|
|Any other Object including empty ones like `{}`,`[]`|never|always|

### Being explicit

> The `!!` pattern

Quite commonly it helps to be explicit that the intent is to treat the value as a `boolean` and convert it into a _true boolean_ (one of `true`|`false`). You can easily convert values to a true boolean by prefixing it with `!!` e.g. `!!foo`. Its just `!` used _twice_. The first `!` converts the variable (in this case `foo`) to a boolean but inverts the logic (_truthy_ -`!`＞ `false`, _falsy_ -`!`＞ `true`). The second one toggles it again to match the nature of the original object (e.g. _truthy_ -`!`＞ `false` -`!`＞ `true`).

It is common to use this pattern in lots of places e.g.

```
// Direct variables
const hasName = !!name;

// As members of objects
const someObj = {
  hasName: !!name
}

// e.g. in ReactJS JSX
{!!someName && <div>{someName}</div>}
```