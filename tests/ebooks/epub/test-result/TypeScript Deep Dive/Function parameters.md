---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Function parameters

# Function Parameters

If you have a function that takes too many parameters, or parameters of the same type, then you might want to consider changing the function to take an object instead.

Consider the following function:

```
function foo(flagA: boolean, flagB: boolean) {
  // your awesome function body 
}
```

With such a function definition it's quite easy to invoke it incorrectly e.g. `foo(flagB, flagA)` and you would get no help from the compiler.

Instead, convert the function to take an object:

```
function foo(config: {flagA: boolean, flagB: boolean}) {
  const {flagA, flagB} = config;
  // your awesome function body 
}
```

Now the function calls will look like `foo({flagA, flagB})` which makes it much easier to spot mistakes and code review.

> Note : If your function is simple enough, and you don't expect much churn, then feel free to ignore this advice 🌹.