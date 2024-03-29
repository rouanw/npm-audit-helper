# npm-audit-helper

> Are your `npm audit` results overwhelming you? This library helps you resolve them step by step.

[![npm version](https://badge.fury.io/js/npm-audit-helper.svg)](https://badge.fury.io/js/npm-audit-helper)
[![npm](https://img.shields.io/npm/dt/npm-audit-helper)](https://www.npmjs.com/package/npm-audit-helper)
[![Build Status](https://travis-ci.org/rouanw/npm-audit-helper.svg?branch=master)](https://travis-ci.org/rouanw/npm-audit-helper)

## Overview

It can be really overwhelming to stare at an npm audit report with 50+ vulnerabilities. Where do you start? `npm-audit-helper` helps answer that question, by providing smaller sets of output and a few hints. Example output:

```sh
found 155 vulnerabilities (60 low, 76 moderate, 18 high, 1 critical) in 22715 scanned packages
  3 vulnerabilities require manual review. See the full report for details.

=== A little bit of help ===

Where to start:

- run `npm audit fix` to automatically fix 13 issues. These should all be non-breaking upgrades, so don't stress.

- Resolve the 3 high severity issues above and run this command again to move to the next severity.

- The most problematic dependency seems to be example-lib with 18 issues that need your attention.
```

## Getting started

All you need to do is run `npm audit --json` and pipe the output to `npm-audit-helper`. There are a few different installation options:

### npx (no installation)

```sh
npm audit --json | npx npm-audit-helper
```

### Global installation

```sh
npm install -g npm-audit-helper
npm audit --json | npm-audit-helper
```

### Per-project installation

(1) __Install:__

```sh
npm install --save-dev npm-audit-helper
```

(2) __Create task in `package.json`:__

```jsonc
{
  "scripts": {
    // ...
    "vuln": "npm audit --json | npm-audit-helper"
  }
}
```

(3) __Run:__

```sh
npm run vuln
```

This last approach is great for setting up a `prepush` hook with a tool like [`husky`](https://github.com/typicode/husky). `npm-audit-helper` will return a non-zero exit code if vulnerabilities are found.

## Options

| Flag          | Description                                                                                                                 | Default |
|---------------|-----------------------------------------------------------------------------------------------------------------------------|---------|
| `--exit-zero` | Return a zero exit code even when there are vulnerabilities. Useful while you're working your way down to 0 vulnerabilities | `false` |
| `--prod-only` | Only available for npm < 7. Filter out vulnerability information for `devDependencies`                                      | `false` |

To filter our dev dependencies on npm 7+, pass the `--only=prod` option directly to npm:

```sh
npm audit --json --only=prod | npx npm-audit-helper
```

## Dependencies

- `npm-audit-helper` requires `npm` >= `6.1.0` because it relies on the `--json` option. `npm install -g npm` to upgrade.
- `npm-audit-helper` won't work if it's piped invalid JSON, so you should check the output of `npm audit --json` if you have any trouble. A likely cause of invalid JSON is additional `npm` logging, so check the `loglevel` option in your `.npmrc` or `~/.npmrc` file.
- This has been tested on *nix, not Windows. Let me know if you use Windows and you'd like to use this library by opening an issue.

## `npm audit` hints

- You can get `npm audit` to ignore issues of a certain severity (but only for its exit code) by setting the [`audit-level` option](https://docs.npmjs.com/misc/config#audit-level).
- You can tell `npm audit fix` to only fix production dependencies with `npm audit fix --only=prod`.
- If you want to add exclusions to your project (i.e. these are vulnerabilities I've reviewed and want to ignore), take a look at [npm-audit-resolver](https://www.npmjs.com/package/npm-audit-resolver). There is [an RFC open](https://github.com/npm/rfcs/pull/18) to get `npm audit resolve` built into `npm`.

## License

MIT
