---
book: "[[..//📓 About꞉ Testing the Obsidian ePub Import.md|Testing the Obsidian ePub Import]]"
tags: Obsidian/Plugin,RegressionTest
---

# Regression Testing Mermaid Diagram Import

## A top level Mermaid diagram ^sigil-toc-id-1

```mermaid
stateDiagram
  direction LR
  [*] --> Still
  Still --> [*]

  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]
```

## An indented Mermaid diagram ^sigil-toc-id-2

**Note:** the code block below is not rendered correctly in preview mode. Switch to **read** mode to see the syntax highlighting

> ```mermaid
> stateDiagram
>   direction LR
>   [*] --> Still
>   Still --> [*]
> 
>   Still --> Moving
>   Moving --> Still
>   Moving --> Crash
>   Crash --> [*]
> 		
> ```

## Mermaid diagram in a 'pre'

```mermaid
stateDiagram
  direction LR  
  [*] --> Still
  Still --> [*]

  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]
```

## Mermaid diagram in a codeblock

```mermaid
stateDiagram
  direction LR  
  [*] --> Still
  Still --> [*]

  Still --> Moving
  Moving --> Still
  Moving --> Crash
  Crash --> [*]
```