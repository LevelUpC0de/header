const vscode = require('vscode');
const WIDTH = 79;

function formatLine(label, content) {
    let text = `${label} ${content}`;
    if (text.length > WIDTH - 4) text = text.slice(0, WIDTH - 4);
    const padding = ' '.repeat(WIDTH - 4 - text.length);
    return `/* ${text}${padding} */`;
}

function activate(context) {
    // --- COMMAND: Insert Header ---
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

        let header = [];
        header.push("/*******************************************************************************/");
        header.push("/*                                                                             */");
        header.push("/*                                                                             */");
        ascii.forEach(line => {
            let content = line.length > WIDTH - 4 ? line.slice(0, WIDTH - 4) : line;
            let padding = ' '.repeat(Math.max(0, WIDTH - 4 - content.length));
            header.push(`/* ${content}${padding} */`);
        });
        header.push("/*                                                                             */");
        header.push(formatLine("File:", fileName));
        header.push(formatLine("By:", username));
        header.push(formatLine("Created:", timestamp));
        header.push(formatLine("Updated:", timestamp));
        header.push("/*                                                                             */");
        header.push("/*******************************************************************************/\n");

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
