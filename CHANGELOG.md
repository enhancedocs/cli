# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.7] - 2023-04-19

### Changed
- Double quotes to single quotes

### Removed
- Unused variables

### Added
- Add support to pass custom server URL

## [0.4.6] - 2023-04-19

### Added
- Add support to pass custom server URL

### Changed
- Now `push` option does not require projectId
- Handle `https` and `http` from `baseURL`
- Other internal logic not changelog relevant

## [0.4.5] - 2023-04-17

### Changed
- Update repository name to `enhancedocs/cli`

## [0.4.4] - 2023-04-16

### Added
- Support multiple folder path on `enhancedocs build` Eg. `enhancedocs build docs_folder_1 docs_folder_2`

## [0.4.3] - 2023-04-16

### Added
- Add -h, --help arguments
- Update help print for better readability
- Add --version option

## [0.4.2] - 2023-04-09

### Added
- Configure project settings on push with docusaurus based docs
- Telemetry with option to opt out with env variable `ENHANCEDOCS_TELEMETRY_DISABLED=true`

## [0.4.1] - 2023-04-06

### Added
- throw Required ENHANCEDOCS_API_KEY before calling API

## [0.4.0] - 2023-04-04

### Added
- Added `CHANGELOG.md`

### Changed

- **BREAKING**: `enhancedocs push` now requires <project_id> param. Eg. `enhancedocs push 642804b142f493e8962cb6d7`
