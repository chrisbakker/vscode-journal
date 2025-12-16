import * as vscode from "vscode";
import { JournalManager } from "./journalManager";
import { StateManager } from "./stateManager";

export class CalendarViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private journalManager: JournalManager,
        private stateManager: StateManager
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "openDay":
                    const date = new Date(data.year, data.month, data.day);
                    await this.journalManager.openEntry(date);
                    this.stateManager.setLastOpenedDay(date);
                    this.refresh();
                    break;
                case "previousMonth":
                    this.previousMonth();
                    break;
                case "nextMonth":
                    this.nextMonth();
                    break;
                case "ready":
                    // Webview is ready, send initial data
                    this.refresh();
                    break;
            }
        });

        // Handle visibility changes
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.refresh();
            }
        });
    }

    public refresh() {
        if (this._view) {
            this._view.webview.postMessage({
                type: "update",
                data: this._getCalendarData(),
            });
        }
    }

    private _getCalendarData() {
        const currentMonth = this.stateManager.getCurrentMonth();
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const entries = this.journalManager.getEntriesForMonth(year, month);
        const lastOpened = this.stateManager.getLastOpenedDay();

        return {
            year,
            month,
            entries: Array.from(entries),
            lastOpenedDay: lastOpened ? lastOpened.getDate() : null,
            lastOpenedMonth: lastOpened ? lastOpened.getMonth() : null,
            lastOpenedYear: lastOpened ? lastOpened.getFullYear() : null,
        };
    }

    public previousMonth() {
        this.stateManager.previousMonth();
        this.refresh();
    }

    public nextMonth() {
        this.stateManager.nextMonth();
        this.refresh();
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            padding: 10px;
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 5px 0;
        }

        .month-year {
            font-weight: 600;
            font-size: 14px;
            flex-grow: 1;
            text-align: center;
        }

        .nav-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 16px;
            line-height: 1;
        }

        .nav-button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        .calendar {
            width: 100%;
        }

        .weekday-labels {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            margin-bottom: 5px;
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
        }

        .weekday {
            text-align: center;
            padding: 4px 0;
        }

        .days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
        }

        .day {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 3px;
            position: relative;
            font-size: 13px;
            transition: background-color 0.1s;
        }

        .day:hover {
            background: var(--vscode-list-hoverBackground);
        }

        .day.weekend {
            color: var(--vscode-descriptionForeground);
        }

        .day.today {
            font-weight: 700;
            background: var(--vscode-list-activeSelectionBackground);
            color: var(--vscode-list-activeSelectionForeground);
        }

        .day.last-opened {
            outline: 2px solid var(--vscode-focusBorder);
            outline-offset: -2px;
        }

        .day.empty {
            cursor: default;
            pointer-events: none;
        }

        .day-number {
            position: relative;
        }

        .entry-indicator {
            width: 4px;
            height: 4px;
            background: var(--vscode-charts-blue);
            border-radius: 50%;
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <div class="header">
        <button class="nav-button" onclick="previousMonth()">◀</button>
        <div class="month-year" id="monthYear"></div>
        <button class="nav-button" onclick="nextMonth()">▶</button>
    </div>
    
    <div class="calendar">
        <div class="weekday-labels">
            <div class="weekday">Su</div>
            <div class="weekday">Mo</div>
            <div class="weekday">Tu</div>
            <div class="weekday">We</div>
            <div class="weekday">Th</div>
            <div class="weekday">Fr</div>
            <div class="weekday">Sa</div>
        </div>
        <div class="days" id="days"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentData = null;

        function previousMonth() {
            vscode.postMessage({ type: 'previousMonth' });
        }

        function nextMonth() {
            vscode.postMessage({ type: 'nextMonth' });
        }

        function openDay(day) {
            if (!currentData || !day) return;
            vscode.postMessage({ 
                type: 'openDay',
                year: currentData.year,
                month: currentData.month,
                day: day
            });
        }

        function renderCalendar(data) {
            currentData = data;
            const { year, month, entries, lastOpenedDay, lastOpenedMonth, lastOpenedYear } = data;
            
            // Update header
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            document.getElementById('monthYear').textContent = \`\${monthNames[month]} \${year}\`;

            // Get calendar data
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDayOfWeek = firstDay.getDay();
            
            const today = new Date();
            const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
            const todayDate = today.getDate();

            // Build calendar
            const daysContainer = document.getElementById('days');
            daysContainer.innerHTML = '';

            // Add empty cells before first day
            for (let i = 0; i < startDayOfWeek; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'day empty';
                daysContainer.appendChild(emptyDay);
            }

            // Add days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                
                let classes = ['day'];
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    classes.push('weekend');
                }
                if (isCurrentMonth && day === todayDate) {
                    classes.push('today');
                }
                if (lastOpenedYear === year && lastOpenedMonth === month && lastOpenedDay === day) {
                    classes.push('last-opened');
                }
                
                dayElement.className = classes.join(' ');
                dayElement.onclick = () => openDay(day);
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = day;
                dayElement.appendChild(dayNumber);
                
                if (entries.includes(day)) {
                    const indicator = document.createElement('div');
                    indicator.className = 'entry-indicator';
                    dayElement.appendChild(indicator);
                }
                
                daysContainer.appendChild(dayElement);
            }
        }

        // Listen for updates from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'update') {
                renderCalendar(message.data);
            }
        });
        // Signal that the webview is ready
        vscode.postMessage({ type: 'ready' });    </script>
</body>
</html>`;
    }
}
