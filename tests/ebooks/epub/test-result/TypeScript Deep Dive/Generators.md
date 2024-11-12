---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Generators

## Generators

`function *` is the syntax used to create a _generator function_. Calling a generator function returns a _generator object_. The generator object just follows the [iterator](Iterators.md) interface (i.e. the `next`, `return` and `throw` functions).

There are two key motivations behind generator functions:

### Lazy Iterators

Generator functions can be used to create lazy iterators e.g. the following function returns an **infinite** list of integers on demand:

```
function* infiniteSequence() {
    var i = 0;
    while(true) {
        yield i++;
    }
}

var iterator = infiniteSequence();
while (true) {
    console.log(iterator.next()); // { value: xxxx, done: false } forever and ever
}
```

Of course if the iterator does end, you get the result of `{ done: true }` as demonstrated below:

```
function* idMaker(){
  let index = 0;
  while(index < 3)
    yield index++;
}

let gen = idMaker();

console.log(gen.next()); // { value: 0, done: false }
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { done: true }
```

### Externally Controlled Execution

This is the part of generators that is truly exciting. It essentially allows a function to pause its execution and pass control (fate) of the remainder of the function execution to the caller.

A generator function does not execute when you call it. It just creates a generator object. Consider the following example along with a sample execution:

```
function* generator(){
    console.log('Execution started');
    yield 0;
    console.log('Execution resumed');
    yield 1;
    console.log('Execution resumed');
}

var iterator = generator();
console.log('Starting iteration'); // This will execute before anything in the generator function body executes
console.log(iterator.next()); // { value: 0, done: false }
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
```

If you run this you get the following output:

```
$ node outside.js
Starting iteration
Execution started
{ value: 0, done: false }
Execution resumed
{ value: 1, done: false }
Execution resumed
{ value: undefined, done: true }
```

- The function only starts execution once `next` is called on the generator object.
- The function _pauses_ as soon as a `yield` statement is encountered.
- The function _resumes_ when `next` is called.

> So essentially the execution of the generator function is controllable by the generator object.

Our communication using the generator has been mostly one way with the generator returning values for the iterator. One extremely powerful feature of generators in JavaScript is that they allow two way communications (with caveats).

- you can control the resulting value of the `yield` expression using `iterator.next(valueToInject)`
- you can throw an exception at the point of the `yield` expression using `iterator.throw(error)`

The following example demonstrates `iterator.next(valueToInject)`:

```
function* generator() {
    const bar = yield 'foo'; // bar may be *any* type
    console.log(bar); // bar!
}

const iterator = generator();
// Start execution till we get first yield value
const foo = iterator.next();
console.log(foo.value); // foo
// Resume execution injecting bar
const nextThing = iterator.next('bar');
```

Since `yield` returns the parameter passed to the iterator's `next` function, and all iterators' `next` functions accept a parameter of any type, TypeScript will always assign the `any` type to the result of the `yield` operator (`bar` above).

> You are on your own to coerce the result to the type you expect, and ensure that only values of that type are passed to next (such as by scaffolding an additional type-enforcement layer that calls `next` for you.) If strong typing is important to you, you may want to avoid two-way communication altogether, as well as packages that rely heavily on it (e.g., redux-saga).

The following example demonstrates `iterator.throw(error)`:

```
function* generator() {
    try {
        yield 'foo';
    }
    catch(err) {
        console.log(err.message); // bar!
    }
}

var iterator = generator();
// Start execution till we get first yield value
var foo = iterator.next();
console.log(foo.value); // foo
// Resume execution throwing an exception 'bar'
var nextThing = iterator.throw(new Error('bar'));
```

So here is the summary:

- `yield` allows a generator function to pause its communication and pass control to an external system
- the external system can push a value into the generator function body
- the external system can throw an exception into the generator function body

How is this useful? Jump to the next section [**async/await**](Async%20Await.md) and find out.