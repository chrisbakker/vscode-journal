import * as vscode from "vscode";

export class StateManager {
    private context: vscode.ExtensionContext;
    private currentMonth: Date;
    private lastOpenedDay: Date | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.currentMonth = new Date();
        this.currentMonth.setDate(1); // Set to first day of month

        // Try to restore last opened day from workspace state
        const savedDate = context.workspaceState.get<string>("lastOpenedDay");
        if (savedDate) {
            this.lastOpenedDay = new Date(savedDate);
        }
    }

    /**
     * Get the current month being displayed
     */
    getCurrentMonth(): Date {
        return new Date(this.currentMonth);
    }

    /**
     * Set the current month being displayed
     */
    setCurrentMonth(month: Date): void {
        this.currentMonth = new Date(month);
        this.currentMonth.setDate(1);
    }

    /**
     * Navigate to the previous month
     */
    previousMonth(): Date {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        return this.getCurrentMonth();
    }

    /**
     * Navigate to the next month
     */
    nextMonth(): Date {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        return this.getCurrentMonth();
    }

    /**
     * Get the last opened day
     */
    getLastOpenedDay(): Date | undefined {
        return this.lastOpenedDay ? new Date(this.lastOpenedDay) : undefined;
    }

    /**
     * Set the last opened day and persist to workspace state
     */
    setLastOpenedDay(date: Date): void {
        this.lastOpenedDay = new Date(date);
        this.context.workspaceState.update("lastOpenedDay", date.toISOString());
    }

    /**
     * Check if a date matches the last opened day
     */
    isLastOpenedDay(date: Date): boolean {
        if (!this.lastOpenedDay) {
            return false;
        }
        return (
            date.getFullYear() === this.lastOpenedDay.getFullYear() &&
            date.getMonth() === this.lastOpenedDay.getMonth() &&
            date.getDate() === this.lastOpenedDay.getDate()
        );
    }
}
