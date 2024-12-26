---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Declaration Spaces

## Declaration Spaces

There are two declaration spaces in TypeScript: the _variable_ declaration space and the _type_ declaration space. These concepts are explored below.

### Type Declaration Space

The type declaration space contains stuff that can be used as a type annotation. E.g. the following are a few type declarations:

```
class Foo {};
interface Bar {};
type Bas = {};
```

This means that you can use `Foo`, `Bar`, `Bas`, etc. as a type annotation. E.g.:

```
var foo: Foo;
var bar: Bar;
var bas: Bas;
```

Notice that even though you have `interface Bar`, _you can't use it as a variable_ because it doesn't contribute to the _variable declaration space_. This is shown below:

```
interface Bar {};
var bar = Bar; // ERROR: "cannot find name 'Bar'"
```

The reason why it says `cannot find name` is because the name `Bar` _is not defined_ in the _variable_ declaration space. That brings us to the next topic "Variable Declaration Space".

### Variable Declaration Space

The variable declaration space contains stuff that you can use as a variable. We saw that having `class Foo` contributes a type `Foo` to the _type_ declaration space. Guess what? It also contributes a _variable_ `Foo` to the _variable_ declaration space as shown below:

```
class Foo {};
var someVar = Foo;
var someOtherVar = 123;
```

This is great as sometimes you want to pass classes around as variables. Remember that:

- we couldn't use something like an `interface` that is _only_ in the _type_ declaration space as a variable.

Similarly something that you declare with `var`, is _only_ in the _variable_ declaration space and cannot be used as a type annotation:

```
var foo = 123;
var bar: foo; // ERROR: "cannot find name 'foo'"
```

The reason why it says `cannot find name` is because the name `foo` _is not defined_ in the _type_ declaration space.