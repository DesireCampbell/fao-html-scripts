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


	const formatAsString = (textIn: string) => {
		// vscode.window.showInformationMessage('FAO Format as String is not yet implemented.');
		let textOut = textIn;
		// all whitespace (including newlines) to single spaces
		textOut = textOut.replace(/\s+/gm, ' ');
		// Remove leading/trailing whitespace
		textOut = textOut.trim();
		return textOut;
	};


	const formatAsPretty = (textIn: string) => {
		// vscode.window.showInformationMessage('FAO Format as Pretty is not yet implemented.');
		let textOut = textIn;
		
		const newlineBeforeTags = [
			'p',
			'hr',
			'img',
			'div',
			'figure','figcaption',
			'table', 'tr', 'td', 'th', 'caption', 'thead', 'tbody', 'tfoot',
			'ul', 'ol', 'dl', 'li', 'dt', 'dd',
			'h1','h2','h3','h4','h5','h6',
		];
		newlineBeforeTags.forEach(tag => {
			const rOpenTag = new RegExp(`<${tag}[\\s>]`, 'gi');
			textOut = textOut.replace(rOpenTag, '\n$&');
			// const rCloseTag = new RegExp(`</${tag}>`, 'gi');
			// textOut = textOut.replace(rCloseTag, '\n$&');
		});


		// indentation for nested tags
		const indentTags = [
			'table', 'tr', 'td', 'th',
			'ul', 'ol', 'dl', 'li', 'dt', 'dd',
		];
		let indentLevel = 0;
		indentTags.forEach(tag => {
			const rOpenTag = new RegExp(`<${tag}[^>]*>`, 'gi');
			textOut = textOut.replace(rOpenTag, match => {
				const indentedMatch = '  '.repeat(indentLevel) + match;
				indentLevel++;
				return indentedMatch;
			});
			const rCloseTag = new RegExp(`</${tag}>`, 'gi');
			textOut = textOut.replace(rCloseTag, match => {
				indentLevel = Math.max(indentLevel - 1, 0);
				return '  '.repeat(indentLevel) + match;
			});
		});


		// extra newlines
		const moreNewlinesBeforeTags = [
			'h1','h2','h3','h4','h5','h6',
		];
		textOut = textOut.replace(/\n+/g, '\n');

		
		return textOut;
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
	// Paste as HTML
	// This function uses the built in paste as HTML command, which captures the 
	// HTML from the clipboard and pastes it into the document. 
	const pasteAsHTML = vscode.commands.registerCommand('fao-html-scripts.pasteAsHTML', () => {
		// vscode.window.showInformationMessage('FAO Paste as HTML is not yet implemented.');
		vscode.commands.executeCommand('editor.action.pasteAs', { 'kind': 'html', 'id': 'html' });
	});
	context.subscriptions.push(pasteAsHTML);


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
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

		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(normalizeFormat);


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
		let textOut = formatAsString(textIn);

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
			const rQuotedAttr = new RegExp(`\\s${attr}\\s*=\\s*"[^"]*"`, 'gi');
			textOut = textOut.replace(rQuotedAttr, '');
			const rUnQuotedAttr = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*([\\s>])`, 'gi');
			textOut = textOut.replace(rUnQuotedAttr, '$1');
		});

		// remove attributes only if empty
		const emptyAttributes = [
			'id',
			'href',
			'id',
			'name',
			'target',
		];
		emptyAttributes.forEach(attr => {
			const rEmptyAttr = new RegExp(`\\s${attr}\\s*=\\s*""`, 'gi');
			textOut = textOut.replace(rEmptyAttr, '');
		});

		// remove boolean attributes
		const booleanAttributes = [
			'hidden',
			'disabled',
			'reversed',
			'nowrap',
		];
		booleanAttributes.forEach(attr => {
			const rBooleanAttr = new RegExp(`\\s${attr}(\\s|>)`, 'gi');
			textOut = textOut.replace(rBooleanAttr, '$1');
		});

		// remove anchors with no href, leave content
		const rUnlinkedA = new RegExp('<a(?![^>]*\\shref=)[^>]*>([\\s\\S]*?)<\\/a>', 'gi');
		textOut = textOut.replace(rUnlinkedA, '$1');

		// replace data images with placeholder
		const rDataImages = new RegExp('src="data:image[^"]*"', 'gi');
		textOut = textOut.replace(rDataImages, 'src="/wp-content/uploads/report/slug/en/fig1.png"');

		// remove style tags and their content
		textOut = textOut.replace(/<style[\s\S]*?<\/style>/gi, '');

		// remove inline styles
		// textOut = textOut.replace(/ style="[^"]*"/gi, '');

		// clean up extra spaces inside tags
		textOut = textOut.replace(/<\s*([^>]*?)\s*>/gi, '<$1>');

		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(formatAsPretty(textOut));
	});
	context.subscriptions.push(stripStyles);


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Fix lists
	const fixLists = vscode.commands.registerCommand('fao-html-scripts.fixLists', () => {
		// vscode.window.showInformationMessage('SCRIPT: fixLists');
		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { 
			vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [fixLists]');
			return; 
		}
		// get text from selection or document
		const textIn = getCurrentSelectionOrDocumentText() || '';
		if (textIn.trim() === '') {
			vscode.window.showInformationMessage('Error: No text found in the current selection or document. [fixLists]');
			return;
		}
		let textOut = formatAsString(textIn);

		const rLists = new RegExp(`<p>[·•o§][\s\S]*?</p>(?!\s*<p>[·•o§])`, 'gi');
		const matchedLists = textOut.matchAll(rLists);
		// matchedLists.forEach(match => {
			
		// });


		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(formatAsPretty(textOut));
	});
	context.subscriptions.push(fixLists);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// format charts
	const formatCharts = vscode.commands.registerCommand('fao-html-scripts.formatCharts', () => {
		vscode.window.showInformationMessage('SCRIPT: formatCharts');
	});
	context.subscriptions.push(formatCharts);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// format tables
	const formatTables = vscode.commands.registerCommand('fao-html-scripts.formatTables', () => {
		vscode.window.showInformationMessage('SCRIPT: formatTables');
	});
	context.subscriptions.push(formatTables);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// footnote ref
	const footnoteRef = vscode.commands.registerCommand('fao-html-scripts.footnoteRef', () => {
		vscode.window.showInformationMessage('SCRIPT: footnoteRef');
	});
	context.subscriptions.push(footnoteRef);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// target blank
	const targetBlank = vscode.commands.registerCommand('fao-html-scripts.targetBlank', () => {
		vscode.window.showInformationMessage('SCRIPT: targetBlank');
	});
	context.subscriptions.push(targetBlank);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// fix headings
	const fixHeadings = vscode.commands.registerCommand('fao-html-scripts.fixHeadings', () => {
		vscode.window.showInformationMessage('SCRIPT: fixHeadings');
	});
	context.subscriptions.push(fixHeadings);
	
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// en to fr
	const englishToFrench = vscode.commands.registerCommand('fao-html-scripts.englishToFrench', () => {
		vscode.window.showInformationMessage('SCRIPT: englishToFrench');
	});
	context.subscriptions.push(englishToFrench);

	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Rename fig files
	// This script expects the fig files to be in either a subfolder named "en" 
	// or "fr" and will attempt to rename the image files to match the filenames 
	// present in the HTML.
	// https://www.eliostruyf.com/devhack-rename-file-vscode-extension/
	const renameFigFiles = vscode.commands.registerCommand('fao-html-scripts.renameFigFiles', () => {
		vscode.window.showInformationMessage('SCRIPT: renameFigFiles');
	});
	context.subscriptions.push(renameFigFiles);
}

export function deactivate() {}
