---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Interfaces

## Interfaces

Interfaces have _zero_ runtime JS impact. There is a lot of power in TypeScript interfaces to declare the structure of variables.

The following two are equivalent declarations, the first uses an _inline annotation_, the second uses an _interface_:

```
// Sample A
declare var myPoint: { x: number; y: number; };

// Sample B
interface Point {
    x: number; y: number;
}
declare var myPoint: Point;
```

However, the beauty of _Sample B_ is that if someone authors a library that builds on the `myPoint` library to add new members, they can easily add to the existing declaration of `myPoint`:

```
// Lib a.d.ts
interface Point {
    x: number; y: number;
}
declare var myPoint: Point;

// Lib b.d.ts
interface Point {
    z: number;
}

// Your code
var myPoint.z; // Allowed!
```

This is because **interfaces in TypeScript are open ended**. This is a vital tenet of TypeScript that it allows you to mimic the extensibility of JavaScript using _interfaces_.

## Classes can implement interfaces

If you want to use _classes_ that must follow an object structure that someone declared for you in an `interface` you can use the `implements` keyword to ensure compatibility:

```
interface Point {
    x: number; y: number;
}

class MyPoint implements Point {
    x: number; y: number; // Same as Point
}
```

Basically in the presence of that `implements`, any changes in that external `Point` interface will result in a compile error in your code base so you can easily keep it in sync:

```
interface Point {
    x: number; y: number;
    z: number; // New member
}

class MyPoint implements Point { // ERROR : missing member `z`
    x: number; y: number;
}
```

Note that `implements` restricts the structure of the class _instances_ i.e.:

```
var foo: Point = new MyPoint();
```

And stuff like `foo: Point = MyPoint` is not the same thing.

## TIPs

### Not every interface is implementable easily

Interfaces are designed to declare _any arbitrarily crazy_ structure that might be present in JavaScript.

Consider the following interface where something is callable with `new`:

```
interface Crazy {
    new (): {
        hello: number
    };
}
```

You would essentially have something like:

```
class CrazyClass implements Crazy {
    constructor() {
        return { hello: 123 };
    }
}
// Because
const crazy = new CrazyClass(); // crazy would be {hello:123}
```

You can _declare_ all the crazy JS out there with interfaces and even use them safely from TypeScript. Doesn't mean you can use TypeScript classes to implement them.