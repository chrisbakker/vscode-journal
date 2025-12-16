import * as vscode from "vscode";
import { JournalManager } from "./journalManager";
import { StateManager } from "./stateManager";
import { CalendarViewProvider } from "./calendarView";
import { JournalEditorProvider } from "./journalEditor";

export function activate(context: vscode.ExtensionContext) {
    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            "Journal extension requires an open workspace folder."
        );
        return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Initialize managers
    const journalManager = new JournalManager(workspaceRoot);
    const stateManager = new StateManager(context);

    // Create calendar view provider
    const calendarProvider = new CalendarViewProvider(
        context.extensionUri,
        journalManager,
        stateManager
    );

    // Register webview view provider
    const webviewView = vscode.window.registerWebviewViewProvider(
        "journalCalendar",
        calendarProvider
    );

    // Register custom editor provider
    const customEditorProvider = JournalEditorProvider.register(context);

    // Set up file watcher for journal directory
    const journalDir = journalManager.getJournalDir();
    const fileWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, "journal/**/*.md")
    );

    // Refresh calendar when files are created, deleted, or changed
    fileWatcher.onDidCreate(() => calendarProvider.refresh());
    fileWatcher.onDidDelete(() => calendarProvider.refresh());
    fileWatcher.onDidChange(() => calendarProvider.refresh());

    // Register commands
    const openDayCommand = vscode.commands.registerCommand(
        "journal.openDay",
        async (date: Date) => {
            await journalManager.openEntry(date);
            stateManager.setLastOpenedDay(date);
            calendarProvider.refresh();
        }
    );

    const previousMonthCommand = vscode.commands.registerCommand(
        "journal.previousMonth",
        () => {
            calendarProvider.previousMonth();
        }
    );

    const nextMonthCommand = vscode.commands.registerCommand(
        "journal.nextMonth",
        () => {
            calendarProvider.nextMonth();
        }
    );

    // Add subscriptions
    context.subscriptions.push(
        webviewView,
        customEditorProvider,
        fileWatcher,
        openDayCommand,
        previousMonthCommand,
        nextMonthCommand
    );

    console.log("Journal extension activated");
}

export function deactivate() {
    console.log("Journal extension deactivated");
}
