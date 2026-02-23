import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// console.log('fao-html-scripts is now active.');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// HELPER FUNCTIONS  - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Get Text in Selection or Document
	const getCurrentSelectionOrDocumentText = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { 
			vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [getCurrentSelectionOrDocumentText]');
			return; 
		}
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
		if (!editor) { 
			vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [replaceCurrentSelectionOrDocumentText]');
			return; 
		}
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
	// SCRIPTS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Hello World
	const helloWorld = vscode.commands.registerCommand('fao-html-scripts.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from FAO HTML Scripts!');
	});
	context.subscriptions.push(helloWorld);


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Strip Styles
	const stripStyles = vscode.commands.registerCommand('fao-html-scripts.stripStyles', () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { 
			vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [stripStyles]');
			return; 
		}

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

export function deactivate() {}