---
book: "[[../§ Title Page.md|Testing the Obsidian ePub Import]]"
tags: Obsidian/Plugin,RegressionTest
---

# Regression Testing Code Syntax Highlighting Import

## A top level code block ^sigil-toc-id-1

```cpp
#include <iostream>

int main(int argc, char *argv[]) {

  /* An annoying "Hello World" example */
  for (auto i = 0; i < 0xFFFF; i++)
    cout << "Hello, World!" << endl;

  char c = '\n';
  unordered_map <string, vector<string> > m;
  m["key"] = "\\\\"; // this is an error

  return -2e3 + 12l;
}
```

## An indented code block ^sigil-toc-id-2

**Note:** the code block below is not rendered correctly in preview mode. Switch to **read** mode to see the syntax highlighting

> ```cpp
> #include <iostream>
> 
> int main(int argc, char *argv[]) {
> 
>   /* An annoying "Hello World" example */
>   for (auto i = 0; i < 0xFFFF; i++)
>     cout << "Hello, World!" << endl;
> 
>   char c = '\n';
>   unordered_map <string, vector<string> > m;
>   m["key"] = "\\\\"; // this is an error
> 
>   return -2e3 + 12l;
> }
> ```