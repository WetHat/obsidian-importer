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

# Testing the Obsidian ePub Import
# Book Content Map
- [[Text/Code Syntax highlighting.md|Regression Testing Code Syntax Highlighting Import]]
  - [[Text/Code Syntax highlighting.md#^sigil-toc-id-1|A top level code block]]
  - [[Text/Code Syntax highlighting.md#^sigil-toc-id-2|An indented code block]]
- [[Text/Mermaid Diagrams.md|Regression Testing Mermaid Diagram Import]]
  - [[Text/Mermaid Diagrams.md#^sigil-toc-id-1|A top level Mermaid diagram]]
  - [[Text/Mermaid Diagrams.md#^sigil-toc-id-2|An indented Mermaid diagram]]
  - [[Text/Mermaid Diagrams.md#^sigil-toc-id-1|Mermaid diagram in a 'pre']]
  - [[Text/Mermaid Diagrams.md#^sigil-toc-id-1|Mermaid diagram in a codeblock]]
- [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md|Unmarked code blocks and html entities (< & >)]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-17|Chapter 24. Span<T> and Memory<T>]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-3|Note]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-4|Note]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-5|Note]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-6|Spans and Slicing]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-7|Note]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-8|CopyTo and TryCopyTo]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-9|Working with Text]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-10|Note]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-11|Memory<T>]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-12|Note]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-13|Note]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-14|Forward-Only Enumerators]]
  - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-15|Working with Stack-Allocated and Unmanaged Memory]]
    - [[Text/Unmarked code blocks and html entities (＜ ＆ ＞).md#^sigil-toc-id-16|Note]]
- [[Text/LaTeX Math.md|Regression Testing LaTex Math Import]]
  - [[Text/LaTeX Math.md#^sigil-toc-id-1|Inline Math]]
  - [[Text/LaTeX Math.md#^sigil-toc-id-2|Math Block]]