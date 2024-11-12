---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# JQuery tips

## JQuery Tips

Note: you need to install the `jquery.d.ts` file for these tips

### Quickly define a new plugin

Just create `jquery-foo.d.ts` with:

```
interface JQuery {
  foo: any;
}
```

And now you can use `$('something').foo({whateverYouWant:'hello jquery plugin'})`