---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Never Type

# Never

> [Professional Lesson on BooleanArt](https://www.booleanart.com/course/typescript/never)
> 
> [Youtube: Video lesson on the never type](https://www.youtube.com/watch?v=aldIFYWu6xc)
> 
> [Egghead: Video lesson on the never type](https://egghead.io/lessons/typescript-use-the-never-type-to-avoid-code-with-dead-ends-using-typescript)

Programming language design does have a concept of _bottom_ type that is a **natural** outcome as soon as you do _code flow analysis_. TypeScript does _code flow analysis_ (😎) and so it needs to reliably represent stuff that might never happen.

The `never` type is used in TypeScript to denote this _bottom_ type. Cases when it occurs naturally:

- A function never returns (e.g. if the function body has `while(true){}`)
- A function always throws (e.g. in `function foo(){throw new Error('Not Implemented')}` the return type of `foo` is `never`)

Of course you can use this annotation yourself as well

```
let foo: never; // Okay
```

However, _only `never` can be assigned to another never_. e.g.

```
let foo: never = 123; // Error: Type number is not assignable to never

// Okay as the function's return type is `never`
let bar: never = (() => { throw new Error(`Throw my hands in the air like I just don't care`) })();
```

Great. Now let's just jump into its key use case :)

# Use case: Exhaustive Checks

You can call never functions in a never context.

```
function foo(x: string | number): boolean {
  if (typeof x === "string") {
    return true;
  } else if (typeof x === "number") {
    return false;
  }

  // Without a never type we would error :
  // - Not all code paths return a value (strict null checks)
  // - Or Unreachable code detected
  // But because TypeScript understands that `fail` function returns `never`
  // It can allow you to call it as you might be using it for runtime safety / exhaustive checks.
  return fail("Unexhaustive!");
}

function fail(message: string): never { throw new Error(message); }
```

And because `never` is only assignable to another `never` you can use it for _compile time_ exhaustive checks as well. This is covered in the [_discriminated union_ section](Discriminated%20Unions.md).

# Confusion with `void`

As soon as someone tells you that `never` is returned when a function never exits gracefully you intuitively want to think of it as the same as `void`. However, `void` is a Unit. `never` is a falsum.

A function that _returns_ nothing returns a Unit `void`. However, a function _that never returns_ (or always throws) returns `never`. `void` is something that can be assigned (without `strictNullChecking`) but `never` can _never_ be assigned to anything other than `never`.

# Type inference in never returning functions

For function declarations TypeScript infers `void` by default as shown below:

```
// Inferred return type: void
function failDeclaration(message: string) {
  throw new Error(message);
}

// Inferred return type: never
const failExpression = function(message: string) {
  throw new Error(message);
};
```

Of course you can fix it by an explict annotation:

```
function failDeclaration(message: string): never {
  throw new Error(message);
}
```

Key reason is backword compatability with real world JavaScript code:

```
class Base {
    overrideMe() {
        throw new Error("You forgot to override me!");
    }
}

class Derived extends Base {
    overrideMe() {
        // Code that actually returns here
    }
}
```

If `Base.overrideMe` .

> Real world TypeScript can overcome this with `abstract` functions but this inferrence is maintained for compatability.