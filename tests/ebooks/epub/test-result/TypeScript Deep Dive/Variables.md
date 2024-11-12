---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Variables

### Variables

For example to tell TypeScript about the [`process` variable](https://nodejs.org/api/process.html) you _can_ do:

```
declare var process: any;
```

> You don't _need_ to do this for `process` as there is already a [community maintained `node.d.ts`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/index.d.ts).

This allows you to use the `process` variable without TypeScript complaining:

```
process.exit();
```

We recommend using an interface wherever possible e.g.:

```
interface Process {
    exit(code?: number): void;
}
declare var process: Process;
```

This allows other people to _extend_ the nature of these global variables while still telling TypeScript about such modifications. E.g. consider the following case where we add an `exitWithLogging` function to process for our amusement:

```
interface Process {
    exitWithLogging(code?: number): void;
}
process.exitWithLogging = function() {
    console.log("exiting");
    process.exit.apply(process, arguments);
};
```

Let's look at interfaces in a bit more detail next.