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
	const replaceCurrentSelectionOrDocumentText = (textIn: string) => {
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
			editor.edit(editBuilder => { editBuilder.replace(textRange, textIn); });
		}else {
			editor.edit(editBuilder => { editBuilder.replace(selection, textIn); });
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
	// This script removes almost all formating from an HTML document, retaining
	// only P, B, STRONG, I, EM, IMG, A, TABLE (and associated tags); leaving 
	// the content ready to be modified by other scripts.
	const stripStyles = vscode.commands.registerCommand('fao-html-scripts.stripStyles', () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { 
			vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [stripStyles]');
			return; 
		}

		// get text from selection or document
		const textIn = getCurrentSelectionOrDocumentText() || '';
		if (textIn.trim() === '') {
			vscode.window.showInformationMessage('Error: No text found in the current selection or document. [stripStyles]');
			return;
		}
		let textOut = textIn;


		// START SCRIPT - - - - - - - - - - - - - - - - -
		// remove comments
		const rComments = new RegExp('<!--[\\s\\S]*?-->', 'gim');
		textOut = textOut.replace(rComments, '');

		// remove XML style self closing tags (e.g. <br />) and replace with HTML style (e.g. <br>)
		const rSelfClosing = new RegExp('<(\\w+)([^>]*)\\/>', 'gim');
		textOut = textOut.replace(rSelfClosing, '<$1$2>');
		
		// replace nbsp
		const rNBSP = new RegExp('&nbsp;', 'gim');
		textOut = textOut.replace(rNBSP, ' ');

		// collapse whitesapce (including newlines) to single spaces
		textOut = textOut.replace(/ +/g, ' ');


		// remove cruft strings
		const cruftStrings = [
			'<!--[\\s\\S]*?-->',
			'<!--!\\[endif\\]---->',
			'<!--\\[endif\\]---->',
			'<!\\[endif\\]>',
			'<![\\s\\S]*?>',
			'<o:p>','</o:p>',
			'<w:Sdt>','</w:Sdt>',
			'<w:sdtPr>','</w:sdtPr>',
			'<v:rect>','</v:rect>',
    ];
		cruftStrings.forEach(cruft => {
			const regex = new RegExp(cruft, 'gim');
			textOut = textOut.replace(regex, '');
		});


		// remove elements and all their content
		const elementsWithContent = [
			'head',
			'style',
			// 'script', //this could capture content between void script tag and open-close script tag
			'template',
			'xml',
			'v:shapes',
		];
		elementsWithContent.forEach(element => {
			const regex = new RegExp(`<${element}[^>]*>[\\s\\S]*?<\\/${element}>`, 'gi');
			textOut = textOut.replace(regex, '');
		});


		// remove elements, leave content
		const unwrapElements = [
			'br',
			'hr',
			'head',
			'meta',
			'link',
			'span',
			'div',
			'body',
			'html',
			'sub',
			'sup',
			'thead',
			'tbody',
			'tfoot',
			'title',
			'm:',
			'o:',
			'o:gfxdata',
			'o:spid',
			'o:wrapblock',
			'o:lock',
			'o:',
			'v:',
			'v:fill',
			'v:formulas',
			'v:imagedata',
			'v:line',
			'v:path',
			'v:shape',
			'v:shapetype',
			'v:stroke',
			'v:textbox',
			'w:',
			'w:Sdt',
			'w:wrap',
    ];
		unwrapElements.forEach(element => {
			const regex = new RegExp(`<${element}[^>]*>|</${element}>`, 'gi');
			textOut = textOut.replace(regex, '');
		});


		// remove elements if empty
		const emptyElements = [
			'a',
			'b',
			'em',
			'h1','h2','h3','h4','h5',
			'i',
			'li',
			'ol',
			'o',
			'p',
			'u',
			'ul',
			's',
			'strong',
    ];
		emptyElements.forEach(element => {
			const regex = new RegExp(`<${element}[^>]*>\\s*</${element}>`, 'gi');
			textOut = textOut.replace(regex, '');
		});

		// remove pointless close open tags (eg <b>bold</b> <b>text<b>)
		const closeOpen = [
			'b',
			'em',
			'i',
			'strong',
			'u',
		];
		closeOpen.forEach(tag => {
			const rCloseSpaceOpen = new RegExp(`</${tag}>\\s+<${tag}>`, 'gi'); // keep space separation
			textOut = textOut.replace(rCloseSpaceOpen, ' ');
			const rCloseOpen = new RegExp(`</${tag}><${tag}>`, 'gi'); // no space separation
			textOut = textOut.replace(rCloseOpen, '');
		});


		// normalize attribute quotes to double quotes
		const rSingleQuotes = new RegExp(" (\\w+)\\s*=\\s*'([^']*)'", 'gi');
		textOut = textOut.replace(rSingleQuotes, ' $1="$2"');

		// remove attributes, except for href, src, colspan, rowspan
		const keepAttributes = [
			'alt', 
			'colspan', 
			'href', 
			'id', 
			'rowspan', 
			'src', 
		];
		const removeAttributes = [
			'align',
			'anchorx',
			'anchory',
			'bgcolor',
			'border',
			'cellpadding',
			'cellspacing',
			'clear',
			'color',
			'class',
			'disabled',
			'eqn',
			'float',
			'height',
			'hidden',
			'hspace',
			'name',
			'nowrap',
			'size',
			'style',
			'tabindex',
			'type',
			'valign',
			'v:shapes',
			'vspace',
			'width',
			'wrap',    
			'o:gfxdata',
			'o:spid',
			'o:wrapblock',
			'o:lock',
			'v:f',
			'v:fill',
			'v:formulas',
			'v:imagedata',
			'v:line',
			'v:path',
			'v:shape',
			'v:shapetype',
			'v:stroke',
			'v:textbox',
			'w:Sdt',
			'w:wrap',
		];
		removeAttributes.forEach(attr => {
			if (!keepAttributes.includes(attr)) {
				const regex = new RegExp(`\\s${attr}\\s*=\\s*"[^"]*"`, 'gi');
				textOut = textOut.replace(regex, '');
			}
		});



		// remove style tags and their content
		textOut = textOut.replace(/<style[\s\S]*?<\/style>/gi, '');

		// remove inline styles
		// textOut = textOut.replace(/ style="[^"]*"/gi, '');




		// END SCRIPT - - - - - - - - - - - - - - - - - -


		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(stripStyles);


	// Normalize Format
	// This function formats HTML in a consistent way for easier manipulation by 
	// other scrips. No empty lines, every tag on a new line
	const normalizeFormat = vscode.commands.registerCommand('fao-html-scripts.normalizeFormat', (textIn: string) => {
		let textOut = textIn;
		// tags should not have whitespace immediatley after opening tag, or before closing tag
		textOut = textOut.replace(/(\s)<([^>\/]+)>(\s+)/g, ' <$2>'); // outside <tag> inside
		textOut = textOut.replace(/([^\s])<([^>\/]+)>(\s+)/g, '$1 <$2>'); // outside<tag> inside

		// attributes should be formatted as attr="value" with no whitespace around the equals sign
		textOut = textOut.replace(/(\w+)\s*=\s*"([^"]*)"/g, '$1="$2"');

		// remove XML style self closing tags (e.g. <br />) and replace with HTML style (e.g. <br>)
		textOut = textOut.replace(/<(\w+)([^>]*)\/>/g, '<$1$2>');

		// all whitespace (including newlines) to single spaces
		textOut = textOut.replace(/\s+/g, ' ');
		// every tag on a new line
		textOut = textOut.replace(/>\s*</g, '>\n<');
		// Remove leading/trailing whitespace
		textOut = textOut.trim();
		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(normalizeFormat);



	const pasteAsHTML = vscode.commands.registerCommand('fao-html-scripts.pasteAsHTML', () => {
		vscode.window.showInformationMessage('FAO Paste as HTML is not yet implemented.');
		vscode.commands.executeCommand('editor.action.pasteAs', { 'kind': 'html', 'id': 'html' });
	});
	context.subscriptions.push(pasteAsHTML);



	const formatCharts = vscode.commands.registerCommand('fao-html-scripts.formatCharts', () => {
		vscode.window.showInformationMessage('FAO Format Charts is not yet implemented.');
	});
	context.subscriptions.push(formatCharts);	






}

export function deactivate() {}
