# VS Code Journal Extension – Phase 1 Design Document

## 1. Overview

The VS Code Journal extension provides a lightweight personal and work journaling experience within the VS Code environment. It allows users to create, open, and navigate daily journal entries via a calendar pane. Each journal entry is stored as a Markdown file with YAML frontmatter metadata.

**Goals for Phase 1:**

-   One file per day, automatically created under a `journal/yyyy/mm/yyyy-mm-dd.md` structure.
-   Calendar pane integrated into VS Code sidebar.
-   Left-click on a calendar day opens the associated file.
-   Highlight days with existing entries and differentiate weekends.
-   No custom editing—use built-in VS Code Markdown editor.
-   Minimal configuration: default journal folder only.

---

## 2. Functional Requirements

### 2.1 Journal Entry Creation

-   Clicking a day in the calendar will:

    1. Automatically create the file if it does not exist.
    2. Prepopulate a YAML frontmatter with:

        ```yaml
        date: yyyy-mm-dd
        type: journal entry
        ```

    3. Open the file in the editor.

-   File naming: `yyyy-mm-dd.md` under `journal/yyyy/mm/`.
-   Auto-create directories if they do not exist.
-   Open behavior:

    -   If current file has unsaved changes → open new file in a new tab.
    -   If current file has no unsaved changes → replace it with new file.

### 2.2 Calendar Pane

-   Docked in the VS Code activity bar with a “Journal” icon.
-   Default view: current month.
-   Navigation: previous/next month arrows.
-   Days with entries: show a small dot.
-   Weekends: visually differentiated with a different shade.
-   Clicking a day opens the corresponding journal file.
-   Remember last opened day within the session.

### 2.3 Editing

-   Fully rely on VS Code Markdown editor.
-   No custom undo/redo or versioning.
-   No tagging, linking, or advanced metadata for phase 1.
-   Auto-update calendar highlights if files are created or modified outside VS Code.

### 2.4 File Access

-   Single journal directory per workspace: `journal/`.
-   Files are not listed in any sidebar; accessed only through the calendar.
-   Users can use file explorer if desired.

### 2.5 Error Handling

-   Use VS Code default error handling (e.g., permission errors).

### 2.6 Time & Localization

-   Use local system/VS Code time.

---

## 3. Non-Functional Requirements

-   Lightweight and fast.
-   Minimal configuration for phase 1.
-   Compatible with all VS Code-supported platforms.
-   Low memory footprint.

---

## 4. Architecture

### 4.1 Components

| Component                  | Responsibility                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Calendar View**          | Display current month, highlight existing entries, navigate months, handle left-click events. |
| **Journal Manager**        | Create directories/files, prepopulate metadata, determine file path from date.                |
| **Editor Integration**     | Open files in built-in editor, handle tab behavior based on unsaved changes.                  |
| **File Watcher**           | Detect external changes to journal files and update calendar highlights.                      |
| **State Manager**          | Keep track of last opened day for session persistence.                                        |
| **VS Code Extension Host** | Provide APIs, command registration, and event handling.                                       |

---

### 4.2 Data Flow

1. **User Action:** Clicks a day in the calendar.
2. **Journal Manager:**

    - Constructs file path (`journal/yyyy/mm/yyyy-mm-dd.md`).
    - Checks if file exists; creates it if not, with YAML metadata.
    - Ensures parent directories exist.

3. **Editor Integration:**

    - Checks if current journal file has unsaved changes.
    - Opens new file in new tab or replaces existing tab accordingly.

4. **State Manager:**

    - Updates last opened day in session.

5. **File Watcher:**

    - Observes `journal/` directory.
    - Updates calendar highlights if files are added/removed externally.

6. **Calendar View:** Updates dot indicators for existing entries.

---

## 5. Directory Structure

```
workspace/
└── journal/
    └── yyyy/
        └── mm/
            └── yyyy-mm-dd.md
```

---

## 6. File Format

**Markdown with YAML Frontmatter:**

```markdown
---
date: 2025-12-14
type: journal entry
---

# Work

...

# Personal

...

# Projects

...
```

-   Users can edit freely in Markdown.
-   Frontmatter metadata is minimal for phase 1.

---

## 7. VS Code Integration

-   **Activity Bar:** Journal icon opens the calendar pane.
-   **Calendar Pane:** Left-click navigation only.
-   **Editor Tabs:** Uses standard VS Code editor; no custom editing UI.
-   **File Watching:** Leverages VS Code `workspace.createFileSystemWatcher` API.

---

## 8. UI Mockup

```
[Activity Bar]
[ ] Explorer
[ ] Search
[ ] Git
[ ] Journal  <-- click opens calendar pane

[Calendar Pane]
< Prev Month   Month Year   Next Month >
Su Mo Tu We Th Fr Sa
   1  2  3  4  5  6  7
   8  9 10 11 12 13 14
  ...
* dot indicates existing entry
* weekends shaded differently
* last opened day highlighted
```

---

## 9. Extension Commands (Phase 1)

-   `journal.openDay` – Open journal entry for selected day (internal).
-   `journal.createFileIfNotExist` – Create file with metadata.
-   Navigation is mouse-only; no keyboard shortcuts in phase 1.

---

## 10. Phase 1 Constraints

-   Single journal folder per workspace.
-   Mouse-only interaction.
-   One month visible at a time.
-   Default file structure, no configuration.
-   Local time only.
-   Rely on VS Code for editing, undo/redo, versioning, error handling.

---

## 11. Future Phases (Not in Phase 1)

-   Tagging and linking between entries.
-   Multiple journals per workspace.
-   Advanced metadata (projects, people, programs).
-   Keyboard shortcuts.
-   Entry previews, tooltips, or inline calendar popups.
-   Custom templates.
-   Sorting, filtering, or search within journal entries.

---

This design provides a clear roadmap for implementation of phase 1 and sets a solid foundation for future enhancements.
