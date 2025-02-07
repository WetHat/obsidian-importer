---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# noImplicitAny

# noImplicitAny

There are some things that cannot be inferred or inferring them might result in unexpected errors. A fine example is function arguments. If you don't annotate them, its unclear what should and shouldn't be valid e.g.

```
function log(someArg) {
  sendDataToServer(someArg);
}

// What arg is valid and what isn't?
log(123);
log('hello world');
```

So if you don't annotate some function argument, TypeScript assumes `any` and moves on. This essentially turns off type checking for such cases, which is what a JavaScript dev would expect. But this can catch people that want high safety off guard. Hence there is an option, `noImplicitAny`, that when switched on will flag the cases where the type cannot be inferred e.g.

```
function log(someArg) { // Error : someArg has an implicit `any` type
  sendDataToServer(someArg);
}
```

Of course you can then go ahead and annotate:

```
function log(someArg: number) {
  sendDataToServer(someArg);
}
```

And if you truly want _zero safety_ you can mark it _explicitly_ as `any`:

```
function log(someArg: any) {
  sendDataToServer(someArg);
}
```