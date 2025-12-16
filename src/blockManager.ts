export type BlockType = "Meeting" | "Note" | "Task";

export interface Block {
    type: BlockType;
    extraFields: { [key: string]: string };
    content: string;
}

export interface JournalDocument {
    date: string;
    blocks: Block[];
}

/**
 * Parse a Markdown journal file into structured blocks
 */
export function parseBlocks(markdown: string): JournalDocument {
    const lines = markdown.split("\n");
    const blocks: Block[] = [];
    let currentBlock: Partial<Block> | null = null;
    let inFrontmatter = false;
    let frontmatterLines: string[] = [];
    let contentLines: string[] = [];
    let date = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line === "---") {
            if (inFrontmatter) {
                // End of frontmatter
                inFrontmatter = false;
                const parsed = parseFrontmatter(frontmatterLines);

                if (parsed.type) {
                    // This is a block frontmatter
                    const { type, ...extraFields } = parsed;
                    currentBlock = {
                        type: type as BlockType,
                        extraFields: extraFields,
                        content: "",
                    };
                } else if (parsed.date) {
                    // This is the document frontmatter
                    date = parsed.date;
                }
                frontmatterLines = [];
            } else {
                // Start of frontmatter
                if (currentBlock && currentBlock.type) {
                    // Save previous block
                    currentBlock.content = contentLines.join("\n").trim();
                    blocks.push(currentBlock as Block);
                    contentLines = [];
                    currentBlock = null;
                }
                inFrontmatter = true;
            }
        } else if (inFrontmatter) {
            frontmatterLines.push(line);
        } else if (currentBlock) {
            contentLines.push(line);
        }
    }

    // Save last block
    if (currentBlock && currentBlock.type) {
        currentBlock.content = contentLines.join("\n").trim();
        blocks.push(currentBlock as Block);
    }

    // If no blocks found, create a default Note block
    if (blocks.length === 0) {
        blocks.push({
            type: "Note",
            extraFields: {},
            content: "",
        });
    }

    return { date, blocks };
}

/**
 * Serialize blocks back to Markdown format
 */
export function serializeBlocks(doc: JournalDocument): string {
    let markdown = "---\n";
    markdown += `date: ${doc.date}\n`;
    markdown += "type: journal entry\n";
    markdown += "---\n\n";

    for (const block of doc.blocks) {
        markdown += "---\n";
        markdown += `type: ${block.type}\n`;

        for (const [key, value] of Object.entries(block.extraFields)) {
            markdown += `${key}: ${value}\n`;
        }

        markdown += "---\n\n";
        markdown += block.content;
        markdown += "\n\n";
    }

    return markdown;
}

/**
 * Parse YAML-style frontmatter into an object
 */
function parseFrontmatter(lines: string[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};

    for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
            result[match[1]] = match[2].trim();
        }
    }

    return result;
}

/**
 * Get icon for block type
 */
export function getBlockIcon(type: BlockType): string {
    switch (type) {
        case "Meeting":
            return "👥";
        case "Note":
            return "📝";
        case "Task":
            return "✓";
        default:
            return "📄";
    }
}

/**
 * Get extra field configuration for block type
 */
export function getExtraFields(type: BlockType): string[] {
    switch (type) {
        case "Meeting":
            return ["attendees"];
        default:
            return [];
    }
}
