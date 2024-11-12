---
book: "[[§ About꞉ TypeScript Deep Dive.md|TypeScript Deep Dive]]"
tags: BackendDevelopment,DeepDive,Programming,Tutorial,TypeScript,WebDevelopment
---

# Changelog

## Changelog

> Reading a markdown file with the progress in the project is easier than reading a commit log.

Automatic changelog generation from commit messages is a fairly common pattern nowadays. There is a project called [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) that generates a changelog from commit messages that follow a _convention_.

### Commit message convention

The most common convention is the _angular_ commit messages convention which is [detailed here](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

### Setup

- Install:

```
npm install standard-version -D
```

- Add a `script` target to your `package.json`:

```
{
  "scripts": {
    "release": "standard-version"
  }
}
```

- Optionally : To automatically push the new _git commit and tag_ plus publish to npm add a `postrelease` script:

```
{
  "scripts": {
    "release": "standard-version",
    "postrelease": "git push --follow-tags origin master && npm publish"
  }
}
```

### Releasing

Simply run:

```
npm run release
```

Based on the commit messages `major` | `minor` | `patch` is automatically determined. To _explicitly_ specify a version you can specify `--release-as` e.g.:

```
npm run release -- --release-as minor
```