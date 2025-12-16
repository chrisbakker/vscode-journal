# TODO Before Publishing

## Required for Marketplace Publication

-   [x] Create PNG icon (128x128 minimum) from `resources/journal-icon.svg`
    -   Can use: https://cloudconvert.com/svg-to-png
    -   Or ImageMagick: `convert -background none -size 128x128 journal-icon.svg journal-icon.png`
    -   Add `"icon": "resources/journal-icon.png"` to package.json

## Optional Improvements

-   [ ] Add demo GIF or screenshots to README
-   [ ] Add unit tests
-   [ ] Set up GitHub Actions for CI/CD
-   [ ] Add more comprehensive error handling
-   [ ] Implement keyboard shortcuts for common actions
-   [ ] Add telemetry (opt-in) for usage analytics

## Documentation

-   [x] Add LICENSE file
-   [x] Add CONTRIBUTING.md
-   [x] Update README with installation and development instructions
-   [x] Add repository URL to package.json
-   [x] Remove redundant activation events
-   [x] Add keywords for discoverability
