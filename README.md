# Journal Extension for VS Code

A lightweight personal and work journaling extension for Visual Studio Code.

## Features

-   **Daily Journal Entries**: One Markdown file per day with YAML frontmatter
-   **Calendar View**: Interactive calendar in the sidebar
-   **Auto-create Entries**: Click any day to create/open a journal entry
-   **Visual Indicators**:
    -   Dots show days with existing entries
    -   Weekend highlighting
    -   Last opened day indicator
-   **Smart File Management**: Organized in `journal/yyyy/mm/yyyy-mm-dd.md` structure
-   **Built-in Markdown Editor**: Uses VS Code's native Markdown editing

## Usage

1. Open a workspace folder in VS Code
2. Click the Journal icon in the Activity Bar
3. Click any day in the calendar to create or open a journal entry
4. Use the navigation arrows to browse different months

## Journal Entry Format

Each entry is created with YAML frontmatter:

```markdown
---
date: yyyy-mm-dd
type: journal entry
---
```

## Requirements

-   VS Code 1.85.0 or higher

## Extension Settings

This extension works out of the box with no configuration required. All journal entries are stored in a `journal/` folder in your workspace root.

## Known Issues

None at this time.

## Release Notes

### 0.1.0

Initial release with calendar view and daily journal entries.

## License

MIT
