// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "fao-html-scripts" is now active!');

	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Get Text in Selection or Document
	const getCurrentSelectionOrDocumentText = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		const document = editor.document;
		const selection = editor.selection;
		if (selection.isEmpty) {
			return document.getText();
		}else {
			return document.getText(selection);
		}
	};
			
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Replace Text in Selection or Document
	const replaceCurrentSelectionOrDocumentText = (textOut: string) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		const document = editor.document;
		const selection = editor.selection;
		if (selection.isEmpty) {
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);
			const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			editor.edit(editBuilder => { editBuilder.replace(textRange, textOut); });
		}else {
			editor.edit(editBuilder => { editBuilder.replace(selection, textOut); });
		}
	};


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Hello World
	const helloWorld = vscode.commands.registerCommand('fao-html-scripts.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from FAO HTML Scripts!');
	});
	context.subscriptions.push(helloWorld);


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Strip Styles
	const stripStyles = vscode.commands.registerCommand('fao-html-scripts.stripStyles', () => {
		vscode.window.showInformationMessage('FAO Strip Styles');		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { return; }

		// get text
		let textIn = getCurrentSelectionOrDocumentText() || '';
		let textOut = '';

		// run the script
		textOut = textIn.split('').reverse().join('');

		// replace text
		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(stripStyles);

}

// This method is called when your extension is deactivated
export function deactivate() {}
