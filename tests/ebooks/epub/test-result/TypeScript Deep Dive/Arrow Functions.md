---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Arrow Functions

- [Arrow Functions](Arrow%20Functions.md#^arrow-functions)
- [Tip: Arrow Function Need](Arrow%20Functions.md#^tip-arrow-function-need)
- [Tip: Arrow Function Danger](Arrow%20Functions.md#^tip-arrow-function-danger)
- [Tip: Libraries that use `this`](Arrow%20Functions.md#^tip-arrow-functions-with-libraries-that-use-this)
- [Tip: Arrow Function inheritance](Arrow%20Functions.md#^tip-arrow-functions-and-inheritance)
- [Tip: Quick object return](Arrow%20Functions.md#^tip-quick-object-return)

### Arrow Functions ^arrow-functions

Lovingly called the _fat arrow_ (because `->` is a thin arrow and `=>` is a fat arrow) and also called a _lambda function_ (because of other languages). Another commonly used feature is the fat arrow function `()=>something`. The motivation for a _fat arrow_ is:

1. You don't need to keep typing `function`
2. It lexically captures the meaning of `this`
3. It lexically captures the meaning of `arguments`

For a language that claims to be functional, in JavaScript you tend to be typing `function` quite a lot. The fat arrow makes it simple for you to create a function

```
var inc = (x)=>x+1;
```

`this` has traditionally been a pain point in JavaScript. As a wise man once said "I hate JavaScript as it tends to lose the meaning of `this` all too easily". Fat arrows fix it by capturing the meaning of `this` from the surrounding context. Consider this pure JavaScript class:

```
function Person(age) {
    this.age = age;
    this.growOld = function() {
        this.age++;
    }
}
var person = new Person(1);
setTimeout(person.growOld,1000);

setTimeout(function() { console.log(person.age); },2000); // 1, should have been 2
```

If you run this code in the browser `this` within the function is going to point to `window` because `window` is going to be what executes the `growOld` function. Fix is to use an arrow function:

```
function Person(age) {
    this.age = age;
    this.growOld = () => {
        this.age++;
    }
}
var person = new Person(1);
setTimeout(person.growOld,1000);

setTimeout(function() { console.log(person.age); },2000); // 2
```

The reason why this works is the reference to `this` is captured by the arrow function from outside the function body. This is equivalent to the following JavaScript code (which is what you would write yourself if you didn't have TypeScript):

```
function Person(age) {
    this.age = age;
    var _this = this;  // capture this
    this.growOld = function() {
        _this.age++;   // use the captured this
    }
}
var person = new Person(1);
setTimeout(person.growOld,1000);

setTimeout(function() { console.log(person.age); },2000); // 2
```

Note that since you are using TypeScript you can be even sweeter in syntax and combine arrows with classes:

```
class Person {
    constructor(public age:number) {}
    growOld = () => {
        this.age++;
    }
}
var person = new Person(1);
setTimeout(person.growOld,1000);

setTimeout(function() { console.log(person.age); },2000); // 2
```

> [A sweet video about this pattern 🌹](https://egghead.io/lessons/typescript-make-usages-of-this-safe-in-class-methods)

#### Tip: Arrow Function Need ^tip-arrow-function-need

Beyond the terse syntax, you only _need_ to use the fat arrow if you are going to give the function to someone else to call. Effectively:

```
var growOld = person.growOld;
// Then later someone else calls it:
growOld();
```

If you are going to call it yourself, i.e.

```
person.growOld();
```

then `this` is going to be the correct calling context (in this example `person`).

#### Tip: Arrow Function Danger ^tip-arrow-function-danger

In fact if you want `this` _to be the calling context_ you should _not use the arrow function_. This is the case with callbacks used by libraries like jquery, underscore, mocha and others. If the documentation mentions functions on `this` then you should probably just use a `function` instead of a fat arrow. Similarly if you plan to use `arguments` don't use an arrow function.

#### Tip: Arrow functions with libraries that use `this` ^tip-arrow-functions-with-libraries-that-use-this

Many libraries do this e.g. `jQuery` iterables (one example [https://api.jquery.com/jquery.each/](https://api.jquery.com/jquery.each/)) will use `this` to pass you the object that it is currently iterating over. In this case if you want to access the library passed `this` as well as the surrounding context just use a temp variable like `_self` like you would in the absence of arrow functions.

```
let _self = this;
something.each(function() {
    console.log(_self); // the lexically scoped value
    console.log(this); // the library passed value
});
```

#### Tip: Arrow functions and inheritance ^tip-arrow-functions-and-inheritance

Arrow functions as properties on classes work fine with inheritance:

```
class Adder {
    constructor(public a: number) {}
    add = (b: number): number => {
        return this.a + b;
    }
}
class Child extends Adder {
    callAdd(b: number) {
        return this.add(b);
    }
}
// Demo to show it works
const child = new Child(123);
console.log(child.callAdd(123)); // 246
```

However, they do not work with the `super` keyword when you try to override the function in a child class. Properties go on `this`. Since there is only one `this` such functions cannot participate in a call to `super` (`super` only works on prototype members). You can easily get around it by creating a copy of the method before overriding it in the child.

```
class Adder {
    constructor(public a: number) {}
    // This function is now safe to pass around
    add = (b: number): number => {
        return this.a + b;
    }
}

class ExtendedAdder extends Adder {
    // Create a copy of parent before creating our own
    private superAdd = this.add;
    // Now create our override
    add = (b: number): number => {
        return this.superAdd(b);
    }
}
```

### Tip: Quick object return ^tip-quick-object-return

Sometimes you need a function that just returns a simple object literal. However, something like

```
// WRONG WAY TO DO IT
var foo = () => {
    bar: 123
};
```

is parsed as a _block_ containing a _JavaScript Label_ by JavaScript runtimes (cause of the JavaScript specification).

> If that doesn't make sense, don't worry, as you get a nice compiler error from TypeScript saying "unused label" anyways. Labels are an old (and mostly unused) JavaScript feature that you can ignore as a modern GOTO (considered bad by experienced developers 🌹)

You can fix it by surrounding the object literal with `()`:

```
// Correct 🌹
var foo = () => ({
    bar: 123
});
```