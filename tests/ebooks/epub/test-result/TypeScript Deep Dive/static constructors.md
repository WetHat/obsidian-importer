---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# static constructors

# Static Constructors in TypeScript

TypeScript `class` (like JavaScript `class`) cannot have a static constructor. However, you can get the same effect quite easily by just calling it yourself:

```
class MyClass {
    static initialize() {
        // Initialization
    }
}
MyClass.initialize();
```