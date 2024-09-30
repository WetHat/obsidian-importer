---
book: "Testing the Obsidian ePub Import"
author: "@WetHat"
aliases: 
  - "Testing the Obsidian ePub Import"
publisher: "WetHat Lab"
tags: [Obsidian/Plugin,RegressionTest]
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
3. [Unmarked code blocks and html entities (< & >)](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md)
    1. [Chapter 24. Span<T> and Memory<T>](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-17)
        1. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-3)
        2. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-4)
        3. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-5)
    2. [Spans and Slicing](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-6)
        1. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-7)
    3. [CopyTo and TryCopyTo](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-8)
    4. [Working with Text](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-9)
        1. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-10)
    5. [Memory<T>](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-11)
        1. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-12)
        2. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-13)
    6. [Forward-Only Enumerators](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-14)
    7. [Working with Stack-Allocated and Unmanaged Memory](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-15)
        1. [Note](Unmarked%20code%20blocks%20and%20html%20entities%20(＜%20＆%20＞).md#^sigil-toc-id-16)
4. [Regression Testing LaTex Math Import](LaTeX%20Math.md)
    1. [Inline Math](LaTeX%20Math.md#^sigil-toc-id-1)
    2. [Math Block](LaTeX%20Math.md#^sigil-toc-id-2)

# Landmarks

1. [Table of Contents](ePub%20NAV.md)