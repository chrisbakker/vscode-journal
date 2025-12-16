# Contributing to Journal Extension

Thank you for your interest in contributing to the Journal extension for VS Code!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/vscode-journal.git`
3. Install dependencies: `npm install`
4. Build the extension: `npm run compile`

## Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes by pressing `F5` to launch the Extension Development Host
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Create a Pull Request

## Code Style

-   Use TypeScript for all source files
-   Follow the existing code style and formatting
-   Run `npm run lint` to check for linting errors
-   Ensure all TypeScript compiles without errors

## Testing

-   Manually test all changes in the Extension Development Host
-   Test both Phase 1 (standard Markdown) and Phase 2 (structured blocks) editors
-   Verify calendar functionality and file creation
-   Test with different months and years

## Project Structure

-   `src/extension.ts` - Main extension entry point
-   `src/calendarView.ts` - Calendar sidebar webview
-   `src/journalManager.ts` - File system operations
-   `src/journalEditor.ts` - Custom block editor (Phase 2)
-   `src/blockManager.ts` - Block parsing/serialization
-   `src/stateManager.ts` - Session state management
-   `docs/` - Requirements and design documents

## Reporting Issues

-   Check if the issue already exists
-   Provide clear steps to reproduce
-   Include VS Code version and OS information
-   Describe expected vs actual behavior

## Feature Requests

We welcome feature requests! Please:

-   Check if it's already been requested
-   Describe the use case clearly
-   Explain how it would benefit users

## Questions?

Feel free to open an issue for questions or discussion.

Thank you for contributing! 🎉
