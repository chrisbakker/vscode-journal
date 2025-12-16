import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class JournalManager {
  private workspaceRoot: string;
  private journalDir: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.journalDir = path.join(workspaceRoot, "journal");
  }

  /**
   * Get the file path for a journal entry on a specific date
   */
  getEntryPath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return path.join(this.journalDir, String(year), month, `${dateStr}.md`);
  }

  /**
   * Check if a journal entry exists for a specific date
   */
  entryExists(date: Date): boolean {
    const entryPath = this.getEntryPath(date);
    return fs.existsSync(entryPath);
  }

  /**
   * Get all dates that have journal entries for a specific month
   */
  getEntriesForMonth(year: number, month: number): Set<number> {
    const monthStr = String(month + 1).padStart(2, "0");
    const monthDir = path.join(this.journalDir, String(year), monthStr);
    const entries = new Set<number>();

    if (!fs.existsSync(monthDir)) {
      return entries;
    }

    const files = fs.readdirSync(monthDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const match = file.match(/^\d{4}-\d{2}-(\d{2})\.md$/);
        if (match) {
          entries.add(parseInt(match[1], 10));
        }
      }
    }

    return entries;
  }

  /**
   * Create a journal entry for a specific date
   */
  async createEntry(date: Date): Promise<string> {
    const entryPath = this.getEntryPath(date);
    const entryDir = path.dirname(entryPath);

    // Create directory structure if it doesn't exist
    if (!fs.existsSync(entryDir)) {
      fs.mkdirSync(entryDir, { recursive: true });
    }

    // Create file with metadata if it doesn't exist
    if (!fs.existsSync(entryPath)) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const content = `---
date: ${dateStr}
type: journal entry
---

> Meeting: title

Attendees:




> Notes: title


`;
      fs.writeFileSync(entryPath, content, "utf8");
    }

    return entryPath;
  }

  /**
   * Open a journal entry in the editor
   */
  async openEntry(date: Date): Promise<void> {
    const entryPath = await this.createEntry(date);
    const uri = vscode.Uri.file(entryPath);

    // Check if current editor has unsaved changes
    const activeEditor = vscode.window.activeTextEditor;
    const hasUnsavedChanges = activeEditor?.document.isDirty ?? false;

    // Open in new tab if there are unsaved changes, otherwise replace
    const viewColumn = hasUnsavedChanges
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.Active;

    await vscode.window.showTextDocument(uri, {
      viewColumn,
      preview: false,
    });
  }

  /**
   * Get the journal directory path
   */
  getJournalDir(): string {
    return this.journalDir;
  }
}
