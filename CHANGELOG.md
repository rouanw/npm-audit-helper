# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0] - 2022-01-11

Breaking change: drop support for npm 6.

## [3.1.0] - 2021-02-04

### Added

- Support for npm version 7, which uses v2 of `npm-audit-report`.

## [3.0.0] - 2021-01-19

### Removed
- Support for unsupported Node versions (especially <7 that don't support async/await syntax). See https://nodejs.org/en/about/releases/.

[Unreleased]: https://github.com/rouanw/npm-audit-helper/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/rouanw/npm-audit-helper/compare/v2.3.24...v3.0.0
