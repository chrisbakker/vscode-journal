# VS Code Journal Extension – Phase 2 Design Document

## 1. Overview

Phase 2 introduces a **custom day editor** for journal entries. While the underlying file format remains Markdown, the editor presents **structured, inline blocks** for different content types (e.g., Meeting, Note, Task). Each block is visually distinct, editable separately, and can include extra fields specific to its type.

**Goals for Phase 2:**

-   Structured blocks within a day’s journal file.
-   Blocks editable independently but not reorderable.
-   Support extra fields per block type (e.g., Meeting attendees).
-   Fully rely on Markdown backend with YAML frontmatter per block.
-   Option to switch between standard VS Code editor (phase 1) and custom editor (phase 2).

---

## 2. Functional Requirements

### 2.1 Block Management

-   **Add Block:**

    -   Button “+ Add Block” at bottom of last block.
    -   User selects block type from fixed list (Meeting, Note, Task).
    -   New block inserted at end of file.

-   **Delete Block:**

    -   Blocks can be deleted via a confirmation popup.
    -   Cannot delete the last block in the file.

-   **Edit Block:**

    -   Each block is independently editable.
    -   Markdown content supports bold, lists, code, etc.
    -   Extra fields (like attendees for Meeting) editable inline.

### 2.2 Block Types and Fields

| Block Type | Extra Fields                | Notes                                   |
| ---------- | --------------------------- | --------------------------------------- |
| Meeting    | Attendees (comma-separated) | Inline editing, displayed above content |
| Note       | None                        | Freeform Markdown                       |
| Task       | None                        | Freeform Markdown                       |

-   Blocks identified by **position in file**, not unique IDs.
-   Visual separation via card-like blocks stretching with content.
-   Type-specific icon displayed in each block; no additional styling.
-   All blocks fully expanded; no collapse.

### 2.3 Editor Behavior

-   **Markdown Backend:** Each block serialized in Markdown with frontmatter-style metadata.
    Example:

    ```markdown
    ---
    type: Meeting
    attendees: Alice, Bob
    ---

    Discussed project timelines and deliverables.
    ```

-   **VS Code Integration:**

    -   Buffered editing: follow VS Code’s standard undo/redo and save behavior.
    -   Single-day focus: only one day’s file open at a time.
    -   Start at top of file; no scroll memory.
    -   Mouse-only interaction (add/delete blocks).
    -   Copy/paste allowed only within block Markdown content.

### 2.4 Extension-Level Editor Option

-   Global setting: choose between **phase 1 editor** (VS Code Markdown) and **phase 2 editor** (custom structured blocks).
-   Change affects only files opened after the setting is updated.

---

## 3. Non-Functional Requirements

-   Lightweight and fast.
-   Maintain compatibility with VS Code’s Markdown features.
-   Minimal configuration for phase 2.
-   Easily extendable for additional block types and extra fields in future phases.

---

## 4. Architecture

### 4.1 Components

| Component                 | Responsibility                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **Custom Day Editor**     | Render structured blocks, handle add/delete/edit, display extra fields inline, show icons.  |
| **Block Manager**         | Maintain block positions, serialize/deserialize blocks to/from Markdown with YAML metadata. |
| **Block Renderer**        | Visual card-like rendering for each block; stretch with content.                            |
| **Extension Settings**    | Global option for editor choice; toggle between standard and custom editor.                 |
| **VS Code Editor Buffer** | Maintain in-memory content; rely on VS Code for undo/redo, save, and file I/O.              |

---

### 4.2 Data Flow

1. **File Opened:**

    - Extension checks editor setting.
    - If phase 2 enabled, parse Markdown file into block objects.

2. **Block Rendering:**

    - Each block rendered as a card with icon, extra fields, and Markdown editor.

3. **User Edits:**

    - Changes immediately update the VS Code buffer.
    - Extra fields validated (e.g., comma-separated attendees).

4. **Add/Delete Block:**

    - Add: append new block object, render card, update buffer.
    - Delete: confirmation popup, remove block, update buffer.

5. **File Save:**

    - VS Code handles saving buffer to disk.
    - Markdown serialization maintains block frontmatter and content.

---

## 5. Block Structure

```ts
interface Block {
    type: "Meeting" | "Note" | "Task";
    extraFields: { [key: string]: string }; // e.g., { attendees: "Alice, Bob" }
    content: string; // freeform Markdown
}
```

-   Serialized to Markdown with YAML frontmatter at the top of each block.
-   Position in file determines block identity.

---

## 6. UI Layout

```
[Custom Day Editor]

[Icon] Meeting    Attendees: Alice, Bob
---------------------------------------
Discuss project timelines.
---------------------------------------

[Icon] Note
---------------------------------------
Reminder: Follow up on email.
---------------------------------------

[Icon] Task
---------------------------------------
Finish report draft.
---------------------------------------

+ Add Block  <-- appears at bottom, scrolls naturally
```

-   Blocks stretch with content.
-   Icons indicate type.
-   Extra fields displayed inline above Markdown content.
-   “+ Add Block” visible at bottom, scrolls with content.

---

## 7. Markdown File Example

```markdown
---
type: Meeting
attendees: Alice, Bob
---

Discussed project timelines and deliverables.

---

## type: Note

---

Reminder: Follow up on email.

---

## type: Task

---

Finish report draft.
```

---

## 8. Phase 2 Constraints

-   Mouse-only interaction.
-   No block reordering or splitting.
-   Fully expanded blocks.
-   One day file at a time.
-   Undo/redo relies on VS Code.
-   No preview mode, only edit mode.
-   Last block cannot be deleted.

---

## 9. Future Enhancements

-   Multiple extra fields per block type.
-   Drag-and-drop block reordering.
-   Block-level preview mode.
-   Inline linking between blocks.
-   Keyboard shortcuts for block management.
-   Templates for different block types.

---

This document provides a complete blueprint for implementing **Phase 2**, ensuring smooth integration with VS Code while introducing structured block editing.
