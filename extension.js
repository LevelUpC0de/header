const vscode = require('vscode');
const WIDTH = 79;

/**
 * Retourne le style de commentaire en fonction du languageId
 */
function getCommentStyle(languageId) {
    const styles = {
        "javascript":  { type: "block" },
        "typescript":  { type: "block" },
        "java":        { type: "block" },
        "c":           { type: "block" },
        "cpp":         { type: "block" },
        "csharp":      { type: "block" },
        "go":          { type: "block" },
        "css":         { type: "block" },
        "php":         { type: "block" },

        "python":      { type: "line", mid: "# " },
        "shellscript": { type: "line", mid: "# " },
        "ruby":        { type: "line", mid: "# " },
        "lua":         { type: "line", mid: "-- " },
        "sql":         { type: "line", mid: "-- " },
        "r":           { type: "line", mid: "# " },

        "javascriptreact": { type: "line", mid: "// " },
        "typescriptreact": { type: "line", mid: "// " },
        "rust":        { type: "line", mid: "// " },
        "swift":       { type: "line", mid: "// " },

        "html":        { type: "html" },
        "markdown":    { type: "html" },

        "default":     { type: "block" }
    };

    return styles[languageId] || styles["default"];
}

// === Fonctions pour générer les lignes ===

function formatBlockLine(content = "") {
    let truncated = content.length > WIDTH - 4 ? content.slice(0, WIDTH - 4) : content;
    let padding = ' '.repeat(Math.max(0, WIDTH - 4 - truncated.length));
    return `/* ${truncated}${padding} */`;
}

function makeBlockBorder() {
    return `/${"*".repeat(WIDTH - 2)}/`;
}

function formatLineComment(content, mid) {
    let truncated = content.length > WIDTH - mid.length ? content.slice(0, WIDTH - mid.length) : content;
    let padding = ' '.repeat(Math.max(0, WIDTH - mid.length - truncated.length));
    return `${mid}${truncated}${padding}`;
}

function formatHtmlLine(content) {
    let truncated = content.length > WIDTH - 7 ? content.slice(0, WIDTH - 7) : content; // 7 for "<!--  -->"
    let padding = ' '.repeat(Math.max(0, WIDTH - 7 - truncated.length));
    return `<!-- ${truncated}${padding} -->`;
}

// === Activation ===
function activate(context) {
    let disposableInsert = vscode.commands.registerCommand('levelupcode.insertHeader', async function () {
        const config = vscode.workspace.getConfiguration('levelupcode');
        let username = config.get('username');

        if (!username) {
            username = await vscode.window.showInputBox({
                placeHolder: 'Entre ton pseudo (sera utilisé dans les headers)'
            });
            if (username) {
                await config.update('username', username, vscode.ConfigurationTarget.Global);
            } else {
                vscode.window.showWarningMessage("Pseudo non défini, header annulé.");
                return;
            }
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Aucun éditeur ouvert.");
            return;
        }

        const fileName = editor.document.fileName.split('/').pop();
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').split('.')[0];

        const ascii = [
            " ▄                           ▀▀█    ▄    ▄          ▄▄▄             █        ",
            " █       ▄▄▄   ▄   ▄   ▄▄▄     █    █    █ ▄▄▄▄   ▄▀   ▀  ▄▄▄    ▄▄▄█   ▄▄▄  ",
            " █      █▀  █  ▀▄ ▄▀  █▀  █    █    █    █ █▀ ▀█  █      █▀ ▀█  █▀ ▀█  █▀  █ ",
            " █      █▀▀▀▀   █▄█   █▀▀▀▀    █    █    █ █   █  █      █   █  █   █  █▀▀▀▀ ",
            " █▄▄▄▄▄ ▀█▄▄▀    █    ▀█▄▄▀    ▀▄▄  ▀▄▄▄▄▀ ██▄█▀   ▀▄▄▄▀ ▀█▄█▀  ▀█▄██  ▀█▄▄▀ ",
            "                                           █                                 ",
            "                                           ▀                                 "
        ];

        const languageId = editor.document.languageId;
        const style = getCommentStyle(languageId);

        let header = [];

        if (style.type === 'block') {
            header.push(makeBlockBorder());
            header.push(formatBlockLine(""));
            ascii.forEach(line => header.push(formatBlockLine(line)));
            header.push(formatBlockLine(""));
            header.push(formatBlockLine(`File: ${fileName}`));
            header.push(formatBlockLine(`By: ${username}`));
            header.push(formatBlockLine(`Created: ${timestamp}`));
            header.push(formatBlockLine(`Updated: ${timestamp}`));
            header.push(formatBlockLine(""));
            header.push(makeBlockBorder());
            header.push('');
        } else if (style.type === 'line') {
            header.push(formatLineComment('*'.repeat(WIDTH - style.mid.length), style.mid));
            header.push(formatLineComment("", style.mid));
            ascii.forEach(line => header.push(formatLineComment(line, style.mid)));
            header.push(formatLineComment("", style.mid));
            header.push(formatLineComment(`File: ${fileName}`, style.mid));
            header.push(formatLineComment(`By: ${username}`, style.mid));
            header.push(formatLineComment(`Created: ${timestamp}`, style.mid));
            header.push(formatLineComment(`Updated: ${timestamp}`, style.mid));
            header.push(formatLineComment("", style.mid));
            header.push(formatLineComment('*'.repeat(WIDTH - style.mid.length), style.mid));
            header.push('');
        } else if (style.type === 'html') {
            header.push(formatHtmlLine('*'.repeat(WIDTH - 7)));
            ascii.forEach(line => header.push(formatHtmlLine(line)));
            header.push(formatHtmlLine('*'.repeat(WIDTH - 7)));
            header.push(formatHtmlLine(`File: ${fileName}`));
            header.push(formatHtmlLine(`By: ${username}`));
            header.push(formatHtmlLine(`Created: ${timestamp}`));
            header.push(formatHtmlLine(`Updated: ${timestamp}`));
            header.push(formatHtmlLine('*'.repeat(WIDTH - 7)));
            header.push('');
        }

        editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(0, 0), header.join('\n'));
        });
    });

    // --- COMMAND: Change Pseudo ---
    let disposableChange = vscode.commands.registerCommand('levelupcode.changeUsername', async function () {
        const config = vscode.workspace.getConfiguration('levelupcode');
        const newUsername = await vscode.window.showInputBox({
            placeHolder: 'Nouveau pseudo à utiliser dans le header'
        });

        if (newUsername) {
            await config.update('username', newUsername, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Pseudo mis à jour : ${newUsername}`);
        } else {
            vscode.window.showWarningMessage("Aucun pseudo saisi, opération annulée.");
        }
    });

    context.subscriptions.push(disposableInsert, disposableChange);
}

function deactivate() {}

module.exports = { activate, deactivate };
