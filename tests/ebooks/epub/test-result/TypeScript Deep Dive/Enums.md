---
book: "[[📓 About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Enums

- [Enums](Enums.md#^enums)
- [Number Enums and numbers](Enums.md#^number-enums-and-numbers)
- [Number Enums and strings](Enums.md#^number-enums-and-strings)
- [Changing the number associated with a number enum](Enums.md#^changing-the-number-associated-with-a-number-enum)
- [Enums are open ended](Enums.md#^enums-are-open-ended)
- [Number Enums as flags](Enums.md#^number-enums-as-flags)
- [String Enums](Enums.md#^string-enums)
- [Const enums](Enums.md#^const-enums)
- [Enum with static functions](Enums.md#^enum-with-static-functions)

### Enums ^enums

An enum is a way to organize a collection of related values. Many other programming languages (C/C#/Java) have an `enum` data type but JavaScript does not. However, TypeScript does. Here is an example definition of a TypeScript enum:

```
enum CardSuit {
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

// Sample usage
var card = CardSuit.Clubs;

// Safety
card = "not a member of card suit"; // Error : string is not assignable to type `CardSuit`
```

These enums values are `number`s so I'll call them Number Enums from hence forth.

#### Number Enums and Numbers ^number-enums-and-numbers

TypeScript enums are number based. This means that numbers can be assigned to an instance of the enum, and so can anything else that is compatible with `number`.

```
enum Color {
    Red,
    Green,
    Blue
}
var col = Color.Red;
col = 0; // Effectively same as Color.Red
```

#### Number Enums and Strings ^number-enums-and-strings

Before we look further into enums let's look at the JavaScript that it generates, here is a sample TypeScript:

```
enum Tristate {
    False,
    True,
    Unknown
}
```

generates the following JavaScript:

```
var Tristate;
(function (Tristate) {
    Tristate[Tristate["False"] = 0] = "False";
    Tristate[Tristate["True"] = 1] = "True";
    Tristate[Tristate["Unknown"] = 2] = "Unknown";
})(Tristate || (Tristate = {}));
```

let's focus on the line `Tristate[Tristate["False"] = 0] = "False";`. Within it `Tristate["False"] = 0` should be self explanatory, i.e. sets `"False"` member of `Tristate` variable to be `0`. Note that in JavaScript the assignment operator returns the assigned value (in this case `0`). Therefore the next thing executed by the JavaScript runtime is `Tristate[0] = "False"`. This means that you can use the `Tristate` variable to convert a string version of the enum to a number or a number version of the enum to a string. This is demonstrated below:

```
enum Tristate {
    False,
    True,
    Unknown
}
console.log(Tristate[0]); // "False"
console.log(Tristate["False"]); // 0
console.log(Tristate[Tristate.False]); // "False" because `Tristate.False == 0`
```

#### Changing the number associated with a Number Enum ^changing-the-number-associated-with-a-number-enum

By default enums are `0` based and then each subsequent value increments by 1 automatically. As an example consider the following:

```
enum Color {
    Red,     // 0
    Green,   // 1
    Blue     // 2
}
```

However, you can change the number associated with any enum member by assigning to it specifically. This is demonstrated below where we start at 3 and start incrementing from there:

```
enum Color {
    DarkRed = 3,  // 3
    DarkGreen,    // 4
    DarkBlue      // 5
}
```

> TIP: I quite commonly initialize the first enum with `= 1` as it allows me to do a safe truthy check on an enum value.

#### Number Enums as flags ^number-enums-as-flags

One excellent use of enums is the ability to use enums as `Flags`. Flags allow you to check if a certain condition from a set of conditions is true. Consider the following example where we have a set of properties about animals:

```
enum AnimalFlags {
    None           = 0,
    HasClaws       = 1 << 0,
    CanFly         = 1 << 1,
    EatsFish       = 1 << 2,
    Endangered     = 1 << 3
}
```

Here we are using the left shift operator to move `1` around a certain level of bits to come up with bitwise disjoint numbers `0001`, `0010`, `0100` and `1000` (these are decimals `1`,`2`,`4`,`8` if you are curious). The bitwise operators `|` (or) / `&` (and) / `~` (not) are your best friends when working with flags and are demonstrated below:

```
enum AnimalFlags {
    None           = 0,
    HasClaws       = 1 << 0,
    CanFly         = 1 << 1,
}
type Animal = {
    flags: AnimalFlags
}

function printAnimalAbilities(animal: Animal) {
    var animalFlags = animal.flags;
    if (animalFlags & AnimalFlags.HasClaws) {
        console.log('animal has claws');
    }
    if (animalFlags & AnimalFlags.CanFly) {
        console.log('animal can fly');
    }
    if (animalFlags == AnimalFlags.None) {
        console.log('nothing');
    }
}

let animal: Animal = { flags: AnimalFlags.None };
printAnimalAbilities(animal); // nothing
animal.flags |= AnimalFlags.HasClaws;
printAnimalAbilities(animal); // animal has claws
animal.flags &= ~AnimalFlags.HasClaws;
printAnimalAbilities(animal); // nothing
animal.flags |= AnimalFlags.HasClaws | AnimalFlags.CanFly;
printAnimalAbilities(animal); // animal has claws, animal can fly
```

Here:

- we used `|=` to add flags
- a combination of `&=` and `~` to clear a flag
- `|` to combine flags

> Note: you can combine flags to create convenient shortcuts within the enum definition e.g. `EndangeredFlyingClawedFishEating` below:

```
enum AnimalFlags {
    None           = 0,
    HasClaws       = 1 << 0,
    CanFly         = 1 << 1,
    EatsFish       = 1 << 2,
    Endangered     = 1 << 3,

    EndangeredFlyingClawedFishEating = HasClaws | CanFly | EatsFish | Endangered,
}
```

#### String Enums ^string-enums

We've only looked at enums where the member values are `number`s. You are actually allowed to have enum members with string values as well. e.g.

```
export enum EvidenceTypeEnum {
  UNKNOWN = '',
  PASSPORT_VISA = 'passport_visa',
  PASSPORT = 'passport',
  SIGHTED_STUDENT_CARD = 'sighted_tertiary_edu_id',
  SIGHTED_KEYPASS_CARD = 'sighted_keypass_card',
  SIGHTED_PROOF_OF_AGE_CARD = 'sighted_proof_of_age_card',
}
```

These can be easier to deal with and debug as they provide meaningful / debuggable string values.

You can use these values to do simple string comparisons. e.g.

```
// Where `someStringFromBackend` will be '' | 'passport_visa' | 'passport' ... etc.
const value = someStringFromBackend as EvidenceTypeEnum; 

// Sample use in code
if (value === EvidenceTypeEnum.PASSPORT){
    console.log('You provided a passport');
    console.log(value); // `passport`
}
```

#### Const Enums ^const-enums

If you have an enum definition like the following:

```
enum Tristate {
    False,
    True,
    Unknown
}

var lie = Tristate.False;
```

The line `var lie = Tristate.False` is compiled to the JavaScript `var lie = Tristate.False` (yes, output is same as input). This means that at execution the runtime will need to lookup `Tristate` and then `Tristate.False`. To get a performance boost here you can mark the `enum` as a `const enum`. This is demonstrated below:

```
const enum Tristate {
    False,
    True,
    Unknown
}

var lie = Tristate.False;
```

generates the JavaScript:

```
var lie = 0;
```

i.e. the compiler:

1. _Inlines_ any usages of the enum (`0` instead of `Tristate.False`).
2. Does not generate any JavaScript for the enum definition (there is no `Tristate` variable at runtime) as its usages are inlined.

##### Const enum preserveConstEnums

Inlining has obvious performance benefits. The fact that there is no `Tristate` variable at runtime is simply the compiler helping you out by not generating JavaScript that is not actually used at runtime. However, you might want the compiler to still generate the JavaScript version of the enum definition for stuff like _number to string_ or _string to number_ lookups as we saw. In this case you can use the compiler flag `--preserveConstEnums` and it will still generate the `var Tristate` definition so that you can use `Tristate["False"]` or `Tristate[0]` manually at runtime if you want. This does not impact _inlining_ in any way.

### Enum with static functions ^enum-with-static-functions

You can use the declaration `enum` + `namespace` merging to add static methods to an enum. The following demonstrates an example where we add a static member `isBusinessDay` to an enum `Weekday`:

```
enum Weekday {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}
namespace Weekday {
    export function isBusinessDay(day: Weekday) {
        switch (day) {
            case Weekday.Saturday:
            case Weekday.Sunday:
                return false;
            default:
                return true;
        }
    }
}

const mon = Weekday.Monday;
const sun = Weekday.Sunday;
console.log(Weekday.isBusinessDay(mon)); // true
console.log(Weekday.isBusinessDay(sun)); // false
```

#### Enums are open ended ^enums-are-open-ended

> NOTE: open ended enums are only relevant if you are not using modules. You should be using modules. Hence this section is last.

Here is the generated JavaScript for an enum shown again:

```
var Tristate;
(function (Tristate) {
    Tristate[Tristate["False"] = 0] = "False";
    Tristate[Tristate["True"] = 1] = "True";
    Tristate[Tristate["Unknown"] = 2] = "Unknown";
})(Tristate || (Tristate = {}));
```

We already explained the `Tristate[Tristate["False"] = 0] = "False";` portion. Now notice the surrounding code `(function (Tristate) { /*code here */ })(Tristate || (Tristate = {}));` specifically the `(Tristate || (Tristate = {}));` portion. This basically captures a local variable `TriState` that will either point to an already defined `Tristate` value or initialize it with a new empty `{}` object.

This means that you can split (and extend) an enum definition across multiple files. For example below we have split the definition for `Color` into two blocks

```
enum Color {
    Red,
    Green,
    Blue
}

enum Color {
    DarkRed = 3,
    DarkGreen,
    DarkBlue
}
```

Note that you _should_ reinitialize the first member (here `DarkRed = 3`) in a continuation of an enum to get the generated code not clobber values from a previous definition (i.e. the `0`, `1`, ... so on values). TypeScript will warn you if you don't anyways (error message `In an enum with multiple declarations, only one declaration can omit an initializer for its first enum element.`).