// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "fao-html-scripts" is now active!');

	const helloWorld = vscode.commands.registerCommand('fao-html-scripts.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from FAO HTML Scripts!');
	});
	context.subscriptions.push(helloWorld);

	const stripStyles = vscode.commands.registerCommand('fao-html-scripts.stripStyles', () => {
		vscode.window.showInformationMessage('FAO Strip Styles');
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			if (selection.isEmpty) {
				// If no text is selected, replace entire document with reversed content
				const fullText = document.getText();
				const reversed = fullText.split('').reverse().join('');
				const firstLine = document.lineAt(0);
				const lastLine = document.lineAt(document.lineCount - 1);
				const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
				editor.edit(editBuilder => {
					editBuilder.replace(textRange, reversed);
				});
			}else {
				// Get the word within the selection
				const word = document.getText(selection);
				const reversed = word.split('').reverse().join('');
				editor.edit(editBuilder => {
					editBuilder.replace(selection, reversed);
				});
			}

		}

	});
	context.subscriptions.push(stripStyles);

}

// This method is called when your extension is deactivated
export function deactivate() {}
