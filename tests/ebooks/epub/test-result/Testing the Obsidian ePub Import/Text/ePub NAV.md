---
book: "Testing the Obsidian ePub Import"
author: "Unkown author"
aliases: 
  - "Testing the Obsidian ePub Import"
publisher: "Unknown publisher"
tags: [e-book]
---

> [!abstract] Testing the Obsidian ePub Import
> <span style="float:Right;">![[undefined|300]]</span>
> This book contains regression test for the Obsidian epub importer. The pages in this book are partially handcrafted but also ectracted from other books to verify that the importer is fully operational. The import result is indended to be copied to the `test-result` folder snd checked-in, so that a git diff can be used to detect differences

  

# Table of Contents

1. [Regression Testing Code Syntax Highlighting Import](Code%20Syntax%20highlighting.md)
    1. [A top level code block](Code%20Syntax%20highlighting.md#^sigil-toc-id-1)
    2. [An indented code block](Code%20Syntax%20highlighting.md#^sigil-toc-id-2)
2. [Regression Testing Mermaid Diagram Import](Mermaid%20Diagrams.md)
    1. [A top level Mermaid diagram](Mermaid%20Diagrams.md#^sigil-toc-id-1)
    2. [An indented Mermaid diagram](Mermaid%20Diagrams.md#^sigil-toc-id-2)
    3. [Mermaid diagram in a 'pre'](Mermaid%20Diagrams.md#^sigil-toc-id-1)
    4. [Mermaid diagram in a codeblock](Mermaid%20Diagrams.md#^sigil-toc-id-1)
3. [Static HTML Site Project Template - Readme](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md)
    1. [What Next?](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^what-next)
4. [Feature Showcase](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^feature-showcase)
    1. [Mermaid Diagrams](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^mermaid-diagrams)
    2. [LaTeX Math](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^latex-math)
    3. [Code Syntax Highlighting](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^code-syntax-highlighting)
    4. [Svgbob Plain Text Diagrams](Static%20HTML%20Site%20Project%20Template%20-%20Readme.md#^svgbob-plain-text-diagrams)
5. [Regression Testing unmarked code blocks and html entities (< & >)](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md)
6. [Chapter 24. Span<T> and Memory<T>](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-17)
    1. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-3)
    2. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-4)
    3. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-5)
7. [Spans and Slicing](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-6)
    1. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-7)
    2. [CopyTo and TryCopyTo](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-8)
    3. [Working with Text](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-9)
        1. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-10)
8. [Memory<T>](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-11)
    1. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-12)
    2. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-13)
9. [Forward-Only Enumerators](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-14)
10. [Working with Stack-Allocated and Unmanaged Memory](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-15)
    1. [Note](Regression%20Testing%20unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-16)

# Landmarks

1. [Table of Contents](ePub%20NAV.md)