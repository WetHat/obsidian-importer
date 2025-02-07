---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Create Arrays

## Creating arrays

Creating an empty array is super easy:

```
const foo: string[] = [];
```

If you want an array to loop over:

```
[...new Array(6)];
```

If you want to create an array pre-filled with some content use the ES6 `Array.prototype.fill`:

```
const foo: string[] = new Array(3).fill('');
console.log(foo); // ['','',''];
```

If you want to create an array of a predefined length with calls you can use the spread operator:

```
const someNumbers = [...new Array(3)].map((_,i) => i * 10);
console.log(someNumbers); // [0,10,20];
```