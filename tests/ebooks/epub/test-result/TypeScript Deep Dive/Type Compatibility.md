---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Type Compatibility

- [Type Compatibility](Type%20Compatibility.md#^type-compatibility)
- [Soundness](Type%20Compatibility.md#^soundness)
- [Structural](Type%20Compatibility.md#^structural)
- [Generics](Type%20Compatibility.md#^generics)
- [Variance](Type%20Compatibility.md#^variance)
- [Functions](Type%20Compatibility.md#^functions)
    - [Return Type](Type%20Compatibility.md#^return-type)
    - [Number of arguments](Type%20Compatibility.md#^number-of-arguments)
    - [Optional and rest parameters](Type%20Compatibility.md#^optional-and-rest-parameters)
    - [Types of arguments](Type%20Compatibility.md#^types-of-arguments)
- [Enums](Type%20Compatibility.md#^enums)
- [Classes](Type%20Compatibility.md#^classes)
- [Generics](Type%20Compatibility.md#^generics)
- [FootNote: Invariance](Type%20Compatibility.md#^footnote-invariance)

## Type Compatibility ^type-compatibility

Type Compatibility (as we discuss here) determines if one thing can be assigned to another. E.g. `string` and `number` are not compatible:

```
let str: string = "Hello";
let num: number = 123;

str = num; // ERROR: `number` is not assignable to `string`
num = str; // ERROR: `string` is not assignable to `number`
```

## Soundness ^soundness

TypeScript's type system is designed to be convenient and allows for _unsound_ behaviours e.g. anything can be assigned to `any` which means telling the compiler to allow you to do whatever you want:

```
let foo: any = 123;
foo = "Hello";

// Later
foo.toPrecision(3); // Allowed as you typed it as `any`
```

## Structural ^structural

TypeScript objects are structurally typed. This means the _names_ don't matter as long as the structures match

```
interface Point {
    x: number,
    y: number
}

class Point2D {
    constructor(public x:number, public y:number){}
}

let p: Point;
// OK, because of structural typing
p = new Point2D(1,2);
```

This allows you to create objects on the fly (like you do in vanilla JS) and still have safety whenever it can be inferred.

Also _more_ data is considered fine:

```
interface Point2D {
    x: number;
    y: number;
}
interface Point3D {
    x: number;
    y: number;
    z: number;
}
var point2D: Point2D = { x: 0, y: 10 }
var point3D: Point3D = { x: 0, y: 10, z: 20 }
function iTakePoint2D(point: Point2D) { /* do something */ }

iTakePoint2D(point2D); // exact match okay
iTakePoint2D(point3D); // extra information okay
iTakePoint2D({ x: 0 }); // Error: missing information `y`
```

## Variance ^variance

Variance is an easy to understand and important concept for type compatibility analysis.

For simple types `Base` and `Child`, if `Child` is a child of `Base`, then instances of `Child` can be assigned to a variable of type `Base`.

> This is polymorphism 101

In type compatibility of complex types composed of such `Base` and `Child` types depends on where the `Base` and `Child` in similar scenarios is driven by _variance_.

- Covariant : (co aka joint) only in _same direction_
- Contravariant : (contra aka negative) only in _opposite direction_
- Bivariant : (bi aka both) both co and contra.
- Invariant : if the types aren't exactly the same then they are incompatible.

> Note: For a completely sound type system in the presence of mutable data like JavaScript, `invariant` is the only valid option. But as mentioned _convenience_ forces us to make unsound choices.

## Functions ^functions

There are a few subtle things to consider when comparing two functions.

### Return Type ^return-type

`covariant`: The return type must contain at least enough data.

```
/** Type Hierarchy */
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

/** Two sample functions */
let iMakePoint2D = (): Point2D => ({ x: 0, y: 0 });
let iMakePoint3D = (): Point3D => ({ x: 0, y: 0, z: 0 });

/** Assignment */
iMakePoint2D = iMakePoint3D; // Okay
iMakePoint3D = iMakePoint2D; // ERROR: Point2D is not assignable to Point3D
```

### Number of arguments ^number-of-arguments

Fewer arguments are okay (i.e. functions can choose to ignore additional parameters). After all you are guaranteed to be called with at least enough arguments.

```
let iTakeSomethingAndPassItAnErr
    = (x: (err: Error, data: any) => void) => { /* do something */ };

iTakeSomethingAndPassItAnErr(() => null) // Okay
iTakeSomethingAndPassItAnErr((err) => null) // Okay
iTakeSomethingAndPassItAnErr((err, data) => null) // Okay

// ERROR: Argument of type '(err: any, data: any, more: any) => null' is not assignable to parameter of type '(err: Error, data: any) => void'.
iTakeSomethingAndPassItAnErr((err, data, more) => null);
```

### Optional and Rest Parameters ^optional-and-rest-parameters

Optional (pre determined count) and Rest parameters (any count of arguments) are compatible, again for convenience.

```
let foo = (x:number, y: number) => { /* do something */ }
let bar = (x?:number, y?: number) => { /* do something */ }
let bas = (...args: number[]) => { /* do something */ }

foo = bar = bas;
bas = bar = foo;
```

> Note: optional (in our example `bar`) and non optional (in our example `foo`) are only compatible if strictNullChecks is false.

### Types of arguments ^types-of-arguments

`bivariant` : This is designed to support common event handling scenarios

```
/** Event Hierarchy */
interface Event { timestamp: number; }
interface MouseEvent extends Event { x: number; y: number }
interface KeyEvent extends Event { keyCode: number }

/** Sample event listener */
enum EventType { Mouse, Keyboard }
function addEventListener(eventType: EventType, handler: (n: Event) => void) {
    /* ... */
}

// Unsound, but useful and common. Works as function argument comparison is bivariant
addEventListener(EventType.Mouse, (e: MouseEvent) => console.log(e.x + "," + e.y));

// Undesirable alternatives in presence of soundness
addEventListener(EventType.Mouse, (e: Event) => console.log((<MouseEvent>e).x + "," + (<MouseEvent>e).y));
addEventListener(EventType.Mouse, <(e: Event) => void>((e: MouseEvent) => console.log(e.x + "," + e.y)));

// Still disallowed (clear error). Type safety enforced for wholly incompatible types
addEventListener(EventType.Mouse, (e: number) => console.log(e));
```

Also makes `Array<Child>` assignable to `Array<Base>` (covariance) as the functions are compatible. Array covariance requires all `Array<Child>` functions to be assignable to `Array<Base>` e.g. `push(t:Child)` is assignable to `push(t:Base)` which is made possible by function argument bivariance.

**This can be confusing for people coming from other languages** who would expect the following to error but will not in TypeScript:

```
/** Type Hierarchy */
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

/** Two sample functions */
let iTakePoint2D = (point: Point2D) => { /* do something */ }
let iTakePoint3D = (point: Point3D) => { /* do something */ }

iTakePoint3D = iTakePoint2D; // Okay : Reasonable
iTakePoint2D = iTakePoint3D; // Okay : WHAT
```

## Enums ^enums

- Enums are compatible with numbers, and numbers are compatible with enums.

```
enum Status { Ready, Waiting };

let status = Status.Ready;
let num = 0;

status = num; // OKAY
num = status; // OKAY
```

- Enum values from different enum types are considered incompatible. This makes enums useable _nominally_ (as opposed to structurally)

```
enum Status { Ready, Waiting };
enum Color { Red, Blue, Green };

let status = Status.Ready;
let color = Color.Red;

status = color; // ERROR
```

## Classes ^classes

- Only instance members and methods are compared. _constructors_ and _statics_ play no part.

```
class Animal {
    feet: number;
    constructor(name: string, numFeet: number) { /** do something */ }
}

class Size {
    feet: number;
    constructor(meters: number) { /** do something */ }
}

let a: Animal;
let s: Size;

a = s;  // OK
s = a;  // OK
```

- `private` and `protected` members _must originate from the same class_. Such members essentially make the class _nominal_.

```
/** A class hierarchy */
class Animal { protected feet: number; }
class Cat extends Animal { }

let animal: Animal;
let cat: Cat;

animal = cat; // OKAY
cat = animal; // OKAY

/** Looks just like Animal */
class Size { protected feet: number; }

let size: Size;

animal = size; // ERROR
size = animal; // ERROR
```

## Generics ^generics

Since TypeScript has a structural type system, type parameters only affect compatibility when used by a member. For example, in the following `T` has no impact on compatibility:

```
interface Empty<T> {
}
let x: Empty<number>;
let y: Empty<string>;

x = y;  // okay, y matches structure of x
```

However, if `T` is used, it will play a role in compatibility based on its _instantiation_ as shown below:

```
interface NotEmpty<T> {
    data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;

x = y;  // error, x and y are not compatible
```

In cases where generic arguments haven't been _instantiated_ they are substituted by `any` before checking compatibility:

```
let identity = function<T>(x: T): T {
    // ...
}

let reverse = function<U>(y: U): U {
    // ...
}

identity = reverse;  // Okay because (x: any)=>any matches (y: any)=>any
```

Generics involving classes are matched by relevant class compatibility as mentioned before. e.g.

```
class List<T> {
  add(val: T) { }
}

class Animal { name: string; }
class Cat extends Animal { meow() { } }

const animals = new List<Animal>();
animals.add(new Animal()); // Okay 
animals.add(new Cat()); // Okay 

const cats = new List<Cat>();
cats.add(new Animal()); // Error 
cats.add(new Cat()); // Okay
```

## FootNote: Invariance ^footnote-invariance

We said invariance is the only sound option. Here is an example where both `contra` and `co` variance are shown to be unsafe for arrays.

```
/** Hierarchy */
class Animal { constructor(public name: string){} }
class Cat extends Animal { meow() { } }

/** An item of each */
var animal = new Animal("animal");
var cat = new Cat("cat");

/**
 * Demo : polymorphism 101
 * Animal <= Cat
 */
animal = cat; // Okay
cat = animal; // ERROR: cat extends animal

/** Array of each to demonstrate variance */
let animalArr: Animal[] = [animal];
let catArr: Cat[] = [cat];

/**
 * Obviously Bad : Contravariance
 * Animal <= Cat
 * Animal[] >= Cat[]
 */
catArr = animalArr; // Okay if contravariant
catArr[0].meow(); // Allowed but BANG 🔫 at runtime


/**
 * Also Bad : covariance
 * Animal <= Cat
 * Animal[] <= Cat[]
 */
animalArr = catArr; // Okay if covariant
animalArr.push(new Animal('another animal')); // Just pushed an animal into catArr!
catArr.forEach(c => c.meow()); // Allowed but BANG 🔫 at runtime
```