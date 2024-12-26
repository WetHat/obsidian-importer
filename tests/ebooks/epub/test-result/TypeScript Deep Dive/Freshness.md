---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Freshness

- [Freshness](Freshness.md#^freshness)
- [Allowing extra properties](Freshness.md#^allowing-extra-properties)
- [Use Case: React](Freshness.md#^use-case-react-state)

## Freshness ^freshness

TypeScript provides a concept of **Freshness** (also called _strict object literal checking_) to make it easier to type check object literals that would otherwise be structurally type compatible.

Structural typing is _extremely convenient_. Consider the following piece of code. This allows you to _very conveniently_ upgrade your JavaScript to TypeScript while still preserving a level of type safety:

```
function logName(something: { name: string }) {
    console.log(something.name);
}

var person = { name: 'matt', job: 'being awesome' };
var animal = { name: 'cow', diet: 'vegan, but has milk of own species' };
var random = { note: `I don't have a name property` };

logName(person); // okay
logName(animal); // okay
logName(random); // Error: property `name` is missing
```

However, _structural_ typing has a weakness in that it allows you to misleadingly think that something accepts more data than it actually does. This is demonstrated in the following code which TypeScript will error on as shown:

```
function logName(something: { name: string }) {
    console.log(something.name);
}

logName({ name: 'matt' }); // okay
logName({ name: 'matt', job: 'being awesome' }); // Error: object literals must only specify known properties. `job` is excessive here.
```

Note that this error _only happens on object literals_. Without this error one might look at the call `logName({ name: 'matt', job: 'being awesome' })` and think that _logName_ would do something useful with `job` where as in reality it will completely ignore it.

Another big use case is with interfaces that have optional members, without such object literal checking, a typo would type check just fine. This is demonstrated below:

```
function logIfHasName(something: { name?: string }) {
    if (something.name) {
        console.log(something.name);
    }
}
var person = { name: 'matt', job: 'being awesome' };
var animal = { name: 'cow', diet: 'vegan, but has milk of own species' };

logIfHasName(person); // okay
logIfHasName(animal); // okay
logIfHasName({neme: 'I just misspelled name to neme'}); // Error: object literals must only specify known properties. `neme` is excessive here.
```

The reason why only object literals are type checked this way is because in this case additional properties _that aren't actually used_ is almost always a typo or a misunderstanding of the API.

### Allowing extra properties ^allowing-extra-properties

A type can include an index signature to explicitly indicate that excess properties are permitted:

```
var x: { foo: number, [x: string]: unknown };
x = { foo: 1, baz: 2 };  // Ok, `baz` matched by index signature
```

### Use Case: React State ^use-case-react-state

[Facebook ReactJS](https://facebook.github.io/react/) offers a nice use case for object freshness. Quite commonly in a component you call `setState` with only a few properties instead of passing in all the properties, i.e.:

```
// Assuming
interface State {
    foo: string;
    bar: string;
}

// You want to do: 
this.setState({foo: "Hello"}); // Error: missing property bar

// But because state contains both `foo` and `bar` TypeScript would force you to do: 
this.setState({foo: "Hello", bar: this.state.bar});
```

Using the idea of freshness you would mark all the members as optional and _you still get to catch typos_!:

```
// Assuming
interface State {
    foo?: string;
    bar?: string;
}

// You want to do: 
this.setState({foo: "Hello"}); // Yay works fine!

// Because of freshness it's protected against typos as well!
this.setState({foos: "Hello"}); // Error: Objects may only specify known properties

// And still type checked
this.setState({foo: 123}); // Error: Cannot assign number to a string
```