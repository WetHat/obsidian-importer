---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# let

### let

`var` Variables in JavaScript are _function scoped_. This is different from many other languages (C# / Java etc.) where the variables are _block scoped_. If you bring a _block scoped_ mindset to JavaScript, you would expect the following to print `123`, instead it will print `456`:

```
var foo = 123;
if (true) {
    var foo = 456;
}
console.log(foo); // 456
```

This is because `{` does not create a new _variable scope_. The variable `foo` is the same inside the if _block_ as it is outside the if block. This is a common source of errors in JavaScript programming. This is why TypeScript (and ES6) introduces the `let` keyword to allow you to define variables with true _block scope_. That is if you use `let` instead of `var` you get a true unique element disconnected from what you might have defined outside the scope. The same example is demonstrated with `let`:

```
let foo = 123;
if (true) {
    let foo = 456;
}
console.log(foo); // 123
```

Another place where `let` would save you from errors is loops.

```
var index = 0;
var array = [1, 2, 3];
for (let index = 0; index < array.length; index++) {
    console.log(array[index]);
}
console.log(index); // 0
```

In all sincerity we find it better to use `let` whenever possible as it leads to fewer surprises for new and existing multi-lingual developers.

#### Functions create a new scope

Since we mentioned it, we'd like to demonstrate that functions create a new variable scope in JavaScript. Consider the following:

```
var foo = 123;
function test() {
    var foo = 456;
}
test();
console.log(foo); // 123
```

This behaves as you would expect. Without this it would be very difficult to write code in JavaScript.

#### Generated JS

The JS generated by TypeScript is simple renaming of the `let` variable if a similar name already exists in the surrounding scope. E.g. the following is generated as is with a simple replacement of `let` with `var`:

```
if (true) {
    let foo = 123;
}

// becomes //

if (true) {
    var foo = 123;
}
```

However, if the variable name is already taken by the surrounding scope then a new variable name is generated as shown (notice `foo_1`):

```
var foo = '123';
if (true) {
    let foo = 123;
}

// becomes //

var foo = '123';
if (true) {
    var foo_1 = 123; // Renamed
}
```

#### Switch

You can wrap your `case` bodies in `{}` to reuse variable names reliably in different `case` statement as shown below:

```
switch (name) {
    case 'x': {
        let x = 5;
        // ...
        break;
    }
    case 'y': {
        let x = 10;
        // ...
        break;
    }
}
```

#### let in closures

A common programming interview question for a JavaScript developer is what is the log of this simple file:

```
var funcs = [];
// create a bunch of functions
for (var i = 0; i < 3; i++) {
    funcs.push(function() {
        console.log(i);
    })
}
// call them
for (var j = 0; j < 3; j++) {
    funcs[j]();
}
```

One would have expected it to be `0,1,2`. Surprisingly it is going to be `3` for all three functions. Reason is that all three functions are using the variable `i` from the outer scope and at the time we execute them (in the second loop) the value of `i` will be `3` (that's the termination condition for the first loop).

A fix would be to create a new variable in each loop specific to that loop iteration. As we've learnt before we can create a new variable scope by creating a new function and immediately executing it (i.e. the IIFE pattern from classes `(function() { /* body */ })();`) as shown below:

```
var funcs = [];
// create a bunch of functions
for (var i = 0; i < 3; i++) {
    (function() {
        var local = i;
        funcs.push(function() {
            console.log(local);
        })
    })();
}
// call them
for (var j = 0; j < 3; j++) {
    funcs[j]();
}
```

Here the functions close over (hence called a `closure`) the _local_ variable (conveniently named `local`) and use that instead of the loop variable `i`.

> Note that closures come with a performance impact (they need to store the surrounding state).

The ES6 `let` keyword in a loop would have the same behavior as the previous example:

```
var funcs = [];
// create a bunch of functions
for (let i = 0; i < 3; i++) { // Note the use of let
    funcs.push(function() {
        console.log(i);
    })
}
// call them
for (var j = 0; j < 3; j++) {
    funcs[j]();
}
```

Using a `let` instead of `var` creates a variable `i` unique to each loop iteration.

#### Summary

`let` is extremely useful to have for the vast majority of code. It can greatly enhance your code readability and decrease the chance of a programming error.