import * as vscode from "vscode";
import {
    Block,
    BlockType,
    parseBlocks,
    serializeBlocks,
    getBlockIcon,
    getExtraFields,
} from "./blockManager";

export class JournalEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(
        context: vscode.ExtensionContext
    ): vscode.Disposable {
        const provider = new JournalEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            "journal.editor",
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            }
        );
        return providerRegistration;
    }

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.getHtmlForWebview(
            webviewPanel.webview
        );

        // Send initial document content
        this.updateWebview(document, webviewPanel.webview);

        // Handle document changes
        const changeDocumentSubscription =
            vscode.workspace.onDidChangeTextDocument((e) => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    this.updateWebview(document, webviewPanel.webview);
                }
            });

        // Handle messages from webview
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "update":
                    await this.updateDocument(document, message.content);
                    break;
                case "addBlock":
                    await this.addBlock(document, message.blockType);
                    break;
                case "deleteBlock":
                    const confirmDelete =
                        await vscode.window.showWarningMessage(
                            "Delete this block?",
                            { modal: true },
                            "Delete"
                        );
                    if (confirmDelete === "Delete") {
                        await this.deleteBlock(document, message.index);
                    }
                    break;
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }

    private updateWebview(
        document: vscode.TextDocument,
        webview: vscode.Webview
    ) {
        const doc = parseBlocks(document.getText());
        webview.postMessage({
            type: "update",
            content: doc,
        });
    }

    private async updateDocument(document: vscode.TextDocument, content: any) {
        const edit = new vscode.WorkspaceEdit();
        const markdown = serializeBlocks(content);
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            markdown
        );
        await vscode.workspace.applyEdit(edit);
    }

    private async addBlock(
        document: vscode.TextDocument,
        blockType: BlockType
    ) {
        const doc = parseBlocks(document.getText());
        const newBlock: Block = {
            type: blockType,
            extraFields: {},
            content: "",
        };
        doc.blocks.push(newBlock);
        await this.updateDocument(document, doc);
    }

    private async deleteBlock(document: vscode.TextDocument, index: number) {
        const doc = parseBlocks(document.getText());

        // Don't allow deleting the last block
        if (doc.blocks.length <= 1) {
            vscode.window.showWarningMessage("Cannot delete the last block");
            return;
        }

        doc.blocks.splice(index, 1);
        await this.updateDocument(document, doc);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Journal Editor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            padding: 20px;
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            line-height: 1.6;
        }

        .block {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
            position: relative;
        }

        .block-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .block-type {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .block-icon {
            font-size: 18px;
        }

        .delete-button {
            background: transparent;
            color: var(--vscode-errorForeground);
            border: 1px solid var(--vscode-errorForeground);
            padding: 4px 12px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
        }

        .delete-button:hover {
            background: var(--vscode-errorForeground);
            color: var(--vscode-errorBackground);
        }

        .extra-fields {
            margin-bottom: 12px;
        }

        .field-label {
            display: block;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 4px;
        }

        .field-input {
            width: 100%;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 6px 8px;
            border-radius: 3px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }

        .field-input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .block-content {
            min-height: 100px;
        }

        .content-editor {
            width: 100%;
            min-height: 100px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 8px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            line-height: 1.5;
            resize: vertical;
        }

        .content-editor:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .add-block-section {
            margin-top: 20px;
            padding: 16px;
            background: var(--vscode-editor-background);
            border: 1px dashed var(--vscode-panel-border);
            border-radius: 6px;
            text-align: center;
        }

        .add-block-label {
            display: block;
            margin-bottom: 12px;
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }

        .add-block-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
        }

        .add-button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .add-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <div id="editor"></div>
    
    <div class="add-block-section">
        <span class="add-block-label">+ Add Block</span>
        <div class="add-block-buttons">
            <button class="add-button" onclick="addBlock('Meeting')">
                <span>👥</span> Meeting
            </button>
            <button class="add-button" onclick="addBlock('Note')">
                <span>📝</span> Note
            </button>
            <button class="add-button" onclick="addBlock('Task')">
                <span>✓</span> Task
            </button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentDoc = null;

        const blockIcons = {
            'Meeting': '👥',
            'Note': '📝',
            'Task': '✓'
        };

        const extraFieldsConfig = {
            'Meeting': ['attendees'],
            'Note': [],
            'Task': []
        };

        function updateContent(blockIndex, content) {
            if (!currentDoc) return;
            currentDoc.blocks[blockIndex].content = content;
            saveDocument();
        }

        function updateExtraField(blockIndex, fieldName, value) {
            if (!currentDoc) return;
            currentDoc.blocks[blockIndex].extraFields[fieldName] = value;
            saveDocument();
        }

        function saveDocument() {
            vscode.postMessage({
                type: 'update',
                content: currentDoc
            });
        }

        function addBlock(blockType) {
            vscode.postMessage({
                type: 'addBlock',
                blockType: blockType
            });
        }

        function deleteBlock(index) {
            vscode.postMessage({
                type: 'deleteBlock',
                index: index
            });
        }

        function renderEditor(doc) {
            currentDoc = doc;
            const editor = document.getElementById('editor');
            editor.innerHTML = '';

            doc.blocks.forEach((block, index) => {
                const blockEl = document.createElement('div');
                blockEl.className = 'block';

                // Header
                const header = document.createElement('div');
                header.className = 'block-header';

                const typeEl = document.createElement('div');
                typeEl.className = 'block-type';
                typeEl.innerHTML = \`
                    <span class="block-icon">\${blockIcons[block.type]}</span>
                    <span>\${block.type}</span>
                \`;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteBlock(index);

                header.appendChild(typeEl);
                header.appendChild(deleteBtn);
                blockEl.appendChild(header);

                // Extra fields
                const extraFields = extraFieldsConfig[block.type] || [];
                if (extraFields.length > 0) {
                    const fieldsContainer = document.createElement('div');
                    fieldsContainer.className = 'extra-fields';

                    extraFields.forEach(fieldName => {
                        const fieldValue = block.extraFields[fieldName] || '';
                        
                        const label = document.createElement('label');
                        label.className = 'field-label';
                        label.textContent = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'field-input';
                        input.value = fieldValue;
                        input.placeholder = fieldName === 'attendees' ? 'Comma-separated names' : '';
                        input.oninput = (e) => updateExtraField(index, fieldName, e.target.value);

                        fieldsContainer.appendChild(label);
                        fieldsContainer.appendChild(input);
                    });

                    blockEl.appendChild(fieldsContainer);
                }

                // Content
                const contentContainer = document.createElement('div');
                contentContainer.className = 'block-content';

                const textarea = document.createElement('textarea');
                textarea.className = 'content-editor';
                textarea.value = block.content;
                textarea.placeholder = 'Write your content in Markdown...';
                textarea.oninput = (e) => updateContent(index, e.target.value);

                contentContainer.appendChild(textarea);
                blockEl.appendChild(contentContainer);

                editor.appendChild(blockEl);
            });
        }

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'update') {
                renderEditor(message.content);
            }
        });
    </script>
</body>
</html>`;
    }
}
