import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// console.log('fao-html-scripts is now active.');

	//Create output channel
	let faodebug = vscode.window.createOutputChannel("FAO debug");
	faodebug.show();
	//Write to output.
	faodebug.appendLine("FAO HTML extention is active. \n");






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// HELPER FUNCTIONS  - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// debug log
	const consoleLog = (text: string) => {
		vscode.window.showInformationMessage(text);
		faodebug.appendLine(new Date().toISOString() + ': ' + text);
	};


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
	const formatAsString = (textIn: string) => {
		let textOut = textIn;
		// all whitespace (including newlines) to single spaces
		textOut = textOut.replace(/\s+/gim,' ');
		// Remove leading/trailing whitespace
		textOut = textOut.trim();
		return textOut;
	};


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// formatAsNormal
	// This function formats HTML in a consistent way for easier manipulation by 
	// other scrips. No empty lines, most tags on a new line, clean up errant 
	// spaces, etc.
	const formatAsNormal = (textIn: string) => {
		let textOut = textIn;
		// prep by removing all newlines
		textOut = formatAsString(textOut);

		// remove XML style self closing tags (e.g. <br />) and replace with HTML style (e.g. <br>)
		textOut = textOut.replace(/<(\w+)([^>]*) \/>/gim, '<$1$2>');

		// attributes should be formatted as attr="value" with no whitespace around 
		// the equals sign and double quotes
		textOut = textOut.replace(/(\w+)\s*=\s*"([^"]*)"/gim, '$1="$2"'); // double quotes
		textOut = textOut.replace(/(\w+)\s*=\s*'([^']*)'/gim, '$1="$2"'); // single quotes
		textOut = textOut.replace(/(\w+)\s*=\s*([^"'][^>\s]*)/gim, '$1="$2"'); // no quotes



		// tags should not have spaces immediatley after opening tag, or before the 
		// closing tag. 
		// textOut = textOut.replace(/<([^>\/]+)>\s+/gim, '<$1>'); // open tag then space
		// textOut = textOut.replace(/\s<\/([^>\/]+)>/gim, '<$1>'); // space then close tag
		// todo: add spaces between words




		// move certain tags to new lines
		const newlineBeforeTags = [
			'p',
			'hr',
			'img',
			'div','/div',
			'figure', '/figure', 
			'figcaption', '/figcaption',
			'table', '/table', 
			'thead', '/thead', 
			'tbody', '/tbody', 
			'tfoot','/tfoot',
			'tr', '/tr', 
			'caption', 
			'td', 
			'th', 
			'ul', '/ul', 'ol', '/ol', 'dl', '/dl', 
			'li', 'dt', 'dd',
			'h1','h2','h3','h4','h5','h6',
		];
		newlineBeforeTags.forEach(tag => {
			// const cleanTag = RegExp.escape(tag);
			// const rTag = new RegExp(`<${cleanTag}[\\s>]`, 'gi');
			// const rTag = new RegExp(`<${RegExp.escape(tag)}[\\s>]`, 'gim');
			const rTag = new RegExp(`<${tag}[\\s>]`, 'gim');
			// const rCloseTag = new RegExp(`</${tag}>`, 'gi');
			// textOut = textOut.replace(rCloseTag, '\n$&');
		});


		// remove leading/trailing spaces from each line
		textOut = textOut.replace(/^ */gim, '');
		textOut = textOut.replace(/ *$/gim, '');

		// remove empty lines
		textOut = textOut.replace(/^\s*[\r\n]/gim, '');



		// Finally, replace text
		return textOut;
	};





	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	const formatAsPretty = (textIn: string) => {
		// vscode.window.showInformationMessage('FAO Format as Pretty is not yet implemented.');
		let textOut = textIn;

		//remove extra whitespace between tags	
		textOut = textOut.replace(/[ ]{2,}/, ' ');
		
		// P tags should not have space before closing tag, or after opening tag.
		textOut = textOut.replace(/<p>\s+/gim, '<p>');
		textOut = textOut.replace(/\s+<\/p>/gim, '</p>');

	
		const newlineBeforeTags = [
			'p',
			'hr',
			// 'img',
			'div','/div',
			'figure', '/figure', 'figcaption', '/figcaption',
			'table', 'tr', '/tr', 'td', 'th', 'caption', 'thead', 'tbody', 'tfoot',
			'/table', '/tr', '/thead', '/tbody', '/tfoot',
			'ul', '/ul', 'ol', '/ol', 'dl', '/dl', 'li', 'dt', 'dd',
			'h1','h2','h3','h4','h5','h6',
		];
		newlineBeforeTags.forEach(tag => {
			// const cleanTag = RegExp.escape(tag);
			// const rTag = new RegExp(`<${cleanTag}[\\s>]`, 'gi');
			const rTag = new RegExp(`<${tag}[\\s>]`, 'gim');
			textOut = textOut.replace(rTag, '\n$&');
			// const rCloseTag = new RegExp(`</${tag}>`, 'gi');
			// textOut = textOut.replace(rCloseTag, '\n$&');
		});

		// const newlineAfterTags = [
		// 	'p',
		// 	'hr',
		// 	'img',
		// 	'div','/div',
		// 	'figure', '/figure', 'figcaption', '/figcaption',
		// 	'table', 'tr', 'td', 'th', 'caption', 'thead', 'tbody', 'tfoot',
		// 	'/table', '/tr', '/thead', '/tbody', '/tfoot',
		// 	'ul', '/ul', 'ol', '/ol', 'dl', '/dl', 'li', 'dt', 'dd',
		// 	'h1','h2','h3','h4','h5','h6',
		// ];
		// newlineAfterTags.forEach(tag => {
		// 	// const cleanTag = RegExp.escape(tag);
		// 	// const rTag = new RegExp(`<${cleanTag}[\\s>]`, 'gi');
		// 	const rTag = new RegExp(`<${tag}[\\s>]`, 'gi');
		// 	textOut = textOut.replace(rTag, '\n$&');
		// 	// const rCloseTag = new RegExp(`</${tag}>`, 'gi');
		// 	// textOut = textOut.replace(rCloseTag, '\n$&');
		// });


		// indentation for nested tags
		// const indentTags = [
		// 	'table', 'tr', 'td', 'th',
		// 	'ul', 'ol', 'dl', 'li', 'dt', 'dd',
		// ];
		// let indentLevel = 0;
		// indentTags.forEach(tag => {
		// 	const rTag = new RegExp(`<${tag}[^>]*>`, 'gi');
		// 	textOut = textOut.replace(rTag, match => {
		// 		const indentedMatch = '  '.repeat(indentLevel) + match;
		// 		indentLevel++;
		// 		return indentedMatch;
		// 	});
		// 	const rCloseTag = new RegExp(`</${tag}>`, 'gi');
		// 	textOut = textOut.replace(rCloseTag, match => {
		// 		indentLevel = Math.max(indentLevel - 1, 0);
		// 		return '  '.repeat(indentLevel) + match;
		// 	});
		// });


		// format lists
		textOut = textOut.replace(/\/(ul|ol)><\/li/gim, '$1\n</li');

		// format tables


		// IMG should be on own line if not inside a P tag
		textOut = textOut.replace(/<\/p>\s*(<img[^>]*>)(?![^<]*<\/)\s*/gim, '</p>\n$1\n');

		// remove extra newlines
		textOut = textOut.replace(/\n+/g, '\n');
		//trim leading/trailing whitespace from each line
		textOut = textOut.replace(/\s+$/gim, '');
		
		// insert extra newlines
		const moreNewlinesBeforeTags = [
			'h1','h2','h3','h4','h5','h6',
		];
		moreNewlinesBeforeTags.forEach(tag => {
			const rTag = new RegExp(`<${tag}[\\s>]`, 'gi');
			textOut = textOut.replace(rTag, '\n\n\n$&');
			// const rCloseTag = new RegExp(`</${tag}>`, 'gi');
			// textOut = textOut.replace(rCloseTag, '\n$&');
		});

		
		// finally, return changed text
		return textOut;
	};



	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	const textHasChanged = (textOld: string, textNew: string) => {
		return textOld !== textNew;
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	const lengthDiff = (textOld: string, textNew: string) => {
		return textOld.length - textNew.length;
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
		// todo: check if command was successful, if not try again with a delay. Try maxmum of 3 times. If still not successful, show error message.
		vscode.commands.executeCommand('editor.action.pasteAs', { 'kind': 'html', 'id': 'html' });
	});
	context.subscriptions.push(pasteAsHTML);










	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Strip Styles
	// This script removes almost all formating from an HTML document, retaining
	// only P, B, STRONG, I, EM, IMG, A, TABLE (and associated tags); leaving 
	// the content ready to be modified by other scripts.
	const stripStyles = vscode.commands.registerCommand('fao-html-scripts.stripStyles', () => {
		consoleLog("fao-html-scripts.stripStyles");
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { 
			consoleLog('Error: FAO HTML Scripts needs an active document to work on. [stripStyles]');
			return; 
		}
		// get text from selection or document
		const textIn = getCurrentSelectionOrDocumentText() || '';
		if (textIn.trim() === '') {
			consoleLog('Error: No text found in the current selection or document. [stripStyles]');
			return;
		}
		let textOut = formatAsString(textIn);

		// remove comments
		textOut = textOut.replace(/<!--[\s\S]*?-->/gim, '');

		// remove XML style self closing tags (e.g. <br />) and replace with HTML style (e.g. <br>)
		// (Also removes any extra whitespace before ">")
		textOut = textOut.replace(/<(\w+)([^>]*)[\s\/*]>/gim, '<$1$2>');
		
		// replace nbsp
		textOut = textOut.replace(/&nbsp;/gim, ' ');

		// collapse whitesapce (including newlines) to single spaces
		textOut = textOut.replace(/\s+/g, ' ');

		// remove cruft strings
		const cruftStrings = [
			/<!--[\s\S]*?-->/,
			/<!--!\[endif\]---->/,
			/<!--\[endif\]---->/,
			/<!\[endif\]>/,
			/<![\s\S]*?>/,
			/<o:p>/,/<\/o:p>/,
			/<w:Sdt>/,/<\/w:Sdt>/,
			/<w:sdtPr>/,/<\/w:sdtPr>/,
			/<v:rect>/,/<\/v:rect>/,
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
		const emptyElementsDelete = [
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
		emptyElementsDelete.forEach(element => {
			const regex = new RegExp(`<${element}[^>]*>\\s*</${element}>`, 'gi');
			textOut = textOut.replace(regex, '');
		});

		// allow empty elements, but remove whitespace
		const emptyElementsTrim = [
			'th',
			'td',
    ];
		emptyElementsTrim.forEach(element => {
			const regex = new RegExp(`(<${element}[^>]*>)\\s+(</${element}>)`, 'gi');
			textOut = textOut.replace(regex, '$1$2');
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
			'onmouseover',
			'onmouseout',
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
			'name',
			'target',
			'src',
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

		// remove weird anchors
		textOut = textOut.replace(/href="#_Toc\d+"/gim, '');

		// remove anchors with no href, leave content
		textOut = textOut.replace(/<a(?![^>]*\shref=)[^>]*>([\s\S]*?)<\/a>/gim, '$1');

		// replace data images with placeholder
		textOut = textOut.replace(/src="data:image[^"]*"/gim, 'src="/wp-content/uploads/report/slug/en/fig1.png"');

		// remove style tags and their content
		textOut = textOut.replace(/<style[\s\S]*?<\/style>/gim, '');

		// remove inline styles
		// textOut = textOut.replace(/ style="[^"]*"/gi, '');

		// clean up extra spaces inside tags
		textOut = textOut.replace(/<\s*([^>]*?)\s*>/gim, '<$1>');

		// remove Ps inside TDs / THs
		textOut = textOut.replace(/(<td[^>]*>)\s*<p[^>]*>([\s\S]*?)<\/p>\s*(<\/td>)/gim, '$1$2$3');
		textOut = textOut.replace(/(<th[^>]*>)\s*<p[^>]*>([\s\S]*?)<\/p>\s*(<\/th>)/gim, '$1$2$3');

		// remove empty IMGs
		textOut = textOut.replace(/<img>/gim, '');
		// remove lone IMGs inside Ps
		textOut = textOut.replace(/<p[^>]*>(\s*<img[^>]*>\s*)+<\/p>/gim, '$1');
		//remove empty Ps
		textOut = textOut.replace(/<p[^>]*>\s*<\/p>/gim, '');




		// Finally, replace text
		// replaceCurrentSelectionOrDocumentText(textOut);
		// replaceCurrentSelectionOrDocumentText(formatAsNormal(textOut));
		replaceCurrentSelectionOrDocumentText(formatAsPretty(textOut));
	});
	context.subscriptions.push(stripStyles);








	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Fix lists
	const fixLists = vscode.commands.registerCommand('fao-html-scripts.fixLists', () => {
		// vscode.window.showInformationMessage('SCRIPT: fixLists');
		consoleLog('SCRIPT: fixLists');
		
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
		let textOut = textIn;
		// textOut = formatAsString(textIn);

		const rLists = /<p>[·•o§][\s\S]*?<\/p>(?!\s*<p>\s*[·•o§])/gi;
		const matchedLists = [...textOut.matchAll(rLists)];
		// let tmp = '';
		// let i = 0;
		// faodebug.appendLine(`found ${matchedLists.length} lists`);
		matchedLists.forEach(match => {
			faodebug.appendLine(match[0]);
			// move inner-inner lists to previous list item [§]
			let newList = match[0];
			newList = newList.replace(
				/<\/p>\s*(<p>\s*§[\s\S]*?<\/p>)(?!\s*<p>\s*§)/gi,
				'<ul>$1</ul></p>'
			);
			// # move inner lists into previous list item [o]
			newList = newList.replace(
				/<\/p>\s*(<p>\s*o[\s\S]*?<\/p>)(?!\s*<p>\s*o)/gi,
				'<ul>$1</ul></p>'
			);
			// # remove all bullet characters
			newList = newList.replace(/<p>\s*[·•o§]\s*/gi,'<p>');
			// # change all Ps to LIs
			newList = newList.replace(/<p>\s*/gi, '<li>');
			newList = newList.replace(/<\/p>/gi, '</li>');
			// # wrap whole list in UL
			newList = '<ul>\n' + newList + '\n</ul>';
			// # replace in filetext
			textOut = textOut.replace(match[0], newList);
		});


		// Finally, replace text
		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(fixLists);
	
	





	const getChartHtml = (
		chartType: string = 'Figure', 
		numMajor: string,
		numSeparator: string,
		numMinor: string,
		title: string,
		notes: string[],
		source: string,
	) => {
		let html = '';

		// create anchor ID
		let anchor = 'fig' + numMajor;
		if(numMinor) {
			anchor += '-' + numMinor;
		}

		// note block
		let noteBlock = '';
		notes.forEach(note => {
			let trimmedNote = note.trim();
			if(trimmedNote.length > 0) { noteBlock += `<p class="note">${note}</p>\n`; }
		});

		html = `
<div class="report-chart" id="${anchor}-image">
<p class="title"><span>${chartType} ${numMajor}${numSeparator}${numMinor}</span> ${title}</p>
<img src="/wp-content/uploads/report/slug/en/${anchor}.png" alt="">
${noteBlock}<p class="source">${source}</p>
<details class="alt-text"><summary>Accessible version</summary>

</details>
</div>\n\n
`;

		return html;
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// format charts
	const formatCharts = vscode.commands.registerCommand('fao-html-scripts.formatCharts', () => {
		consoleLog("fao-html-scripts.formatCharts");
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		// If there's no active editor, do nothing
		if (!editor) { 
			consoleLog('Error: FAO HTML Scripts needs an active document to work on. [formatCharts]');
			return; 
		}
		// get text from selection or document
		const textIn = getCurrentSelectionOrDocumentText() || '';
		if (textIn.trim() === '') {
			consoleLog('Error: No text found in the current selection or document. [formatCharts]');
			return;
		}
		// let textOut = formatAsString(textIn);
		let textOut = textIn;


		// format 5: [figure XX] and [title] and [y-axis label] in separate paragraphs
		const rCharts = /<p>\s*(?:<strong>)?Figure .*?\s<p>.*?<\/p>\s*<p>.*?<\/p>\s*<img [\s\S]*?<p>Sources?.*?<\/p>/gim;
		const matchedCharts = [...textOut.matchAll(rCharts)];
		consoleLog("found " + matchedCharts.length + " charts in format 5");

		matchedCharts.forEach(match => {
			faodebug.appendLine(match[0]);
			let numMajor       = '';
			let numSeparator   = '';
			let numMinor       = '';
			let title          = '';
			let notes:string[] = [];
			let source         = '';
			// temp variables for parsing
			let yAxisLabel     = '';
			let remainingLines = '';

			const s = [...match[0].matchAll(/<p>\s*(?:<strong>)?Figure ([A-Z0-9]+)([\.\-‑ ]*)([A-Z0-9]*)\s*(?:<strong>)?\s*<\/p>\s*<p>(.*?)<\/p>\s*<p>(.*?)<\/p>([\s\S]*)/gim)][0];
			if(s) {
				numMajor       = s[1] !== undefined ? s[1] : '';
				numSeparator   = s[2] !== undefined ? s[2] : '';
				numMinor       = s[3] !== undefined ? s[3] : '';
				title          = s[4] !== undefined ? s[4] : '';
				yAxisLabel     = s[5] !== undefined ? s[5] : ''; // not used
				remainingLines = s[6] !== undefined ? s[6] : '';

				//remove P tags from remaining lines
				remainingLines = remainingLines.replace('<p>', '');
				remainingLines = remainingLines.replace('</p>', '');
				let lines = remainingLines.split(/\n/);
				lines.forEach(line => {
					if(line.toLowerCase().startsWith('source')) {
						// this is the source line
						source = line;
					} else if(line.toLowerCase().startsWith('<img')) {
						// skip this line
					} else {
						notes.push(line);
					}
				});
				faodebug.appendLine('');
				faodebug.appendLine('Figure ' + numMajor  + numSeparator + numMinor + ': ' + title);
				faodebug.appendLine(notes.join('\n'));
				faodebug.appendLine(source);
				faodebug.appendLine('- - - - - - - - - - - - - - - - - - - - -');
				// replace the matched text with the new chart HTML
				let newChart = getChartHtml('Figure', numMajor, numSeparator, numMinor, title, notes, source);
				textOut = textOut.replace(match[0], newChart);
			}
		});



		// Finally, replace text
		// replaceCurrentSelectionOrDocumentText(textOut);
		// replaceCurrentSelectionOrDocumentText(formatAsNormal(textOut));
		replaceCurrentSelectionOrDocumentText(formatAsPretty(textOut));
	});
	context.subscriptions.push(formatCharts);
	
	




	const getTableHtml = (
		tableType: string, 
		numMajor: string,
		numSeparator: string,
		numMinor: string,
		title: string,
		notes: string[],
		source: string,
	) => {
		let html = '';

		// create anchor ID
		let anchorType = '';
		if (tableType) {
			anchorType = tableType.substring(0,3).toLowerCase();
		}
		let anchor = anchorType + numMajor;
		if(numMinor) {
			anchor += '-' + numMinor;
		}

		return html;
	};


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// format tables
	const formatTables = vscode.commands.registerCommand('fao-html-scripts.formatTables', () => {
		faodebug.appendLine('SCRIPT: formatTables');

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
		let textOut = textIn;
		// textOut = formatAsString(textIn);


		// Format 1
		// <p>Table ... <table ... <p>Source ... </p>
		const rTables1 = /<p>\s*(?:<strong>)?(?:Figure|Table|Chart).*?\n*\S*<table[\s\S]*?<p>Source.*?<\/p>/gi;
		const matchedTables1 = [...textOut.matchAll(rTables1)];
		faodebug.appendLine(matchedTables1.length + ' tables found in format 1');
		matchedTables1.forEach(match => {
			faodebug.appendLine(match[0]);
		});


		// Format 2
		// table num and title in separate paragraphs
		const rTables2 = /<p>\s*(?:<strong>)?(?:Figure|Table|Chart).*?\s*<p>.*?<\/p>\s*<table[\s\S]*?<p>Source.*?<\/p>/gim;
		const matchedTables2 = [...textOut.matchAll(rTables2)];
		faodebug.appendLine(matchedTables2.length + ' tables found in format 2');
		matchedTables2.forEach(tableMatch => {
			// faodebug.appendLine(tableMatch[0]);
			let textOld = tableMatch[0];

			let tableType = '';
			let numMajor = '';
			let numSeparator = '';
			let numMinor = '';
			let title = '';
			let notes: string[] = [];
			let source = '';
			
			let tableTitleMatch = [...textOld.matchAll(/<p>\s*(?:<strong>)?(Figure|Table|Chart) ([A-Z0-9]+)([\.\-‑ ]*)([A-Z0-9]*).*?\s*<p>(.*?)<\/p>\s*<table/gim)][0];
			if(tableTitleMatch) {
				faodebug.appendLine(`tableTitleMatch: ${tableTitleMatch}`);
				tableType    = tableTitleMatch[1] !== undefined ? tableTitleMatch[1] : '';
				numMajor     = tableTitleMatch[2] !== undefined ? tableTitleMatch[2] : '';
				numSeparator = tableTitleMatch[3] !== undefined ? tableTitleMatch[3] : '';
				numMinor     = tableTitleMatch[4] !== undefined ? tableTitleMatch[4] : '';
				title        = tableTitleMatch[5] !== undefined ? tableTitleMatch[5] : '';
				faodebug.appendLine(tableType + ' ' + numMajor  + numSeparator + numMinor + ': ' + title);
				// faodebug.appendLine(tableTitleMatch[1] + ' ' + tableTitleMatch[2]  + tableTitleMatch[3] + tableTitleMatch[4] + ': ' + tableTitleMatch[5]);
			}

			let notesSourceMatch = [...textOld.matchAll(/<\/table>[\s\S]*/gim)][0];
			let lines = [...notesSourceMatch[0].matchAll(/<p>(.*?)<\/p>/gim)];
			lines.forEach(lineMatch => {
				let lineText = lineMatch[1] !== undefined ? lineMatch[1] : '';
				if(lineText.toLowerCase().startsWith('source')) {
					source = lineText;
				}else if(lineText.toLowerCase().startsWith('note')) {
					notes.push(lineText);
				}
			});
			
			// generate table from template
			let newTableHtml = getTableHtml(tableType, numMajor, numSeparator, numMinor, title, notes, source);
			textOut = textOut.replace(textOld, newTableHtml);
		});


		// Format 3
		// alt text tables
		const rTables3 = /<\/summary>\s*<table[\s\S]*?<\/details>/gi;
		const matchedTables3 = [...textOut.matchAll(rTables3)];
		faodebug.appendLine(matchedTables3.length + ' tables found in format 3');
		matchedTables3.forEach(match => {
			faodebug.appendLine(match[0]);
		});


		// Format 4
		// table with title as attribute
		const rTables4 = /<table table=[\s\S]*?<p>Source.*?<\/p>/gi;
		const matchedTables4 = [...textOut.matchAll(rTables4)];
		faodebug.appendLine(matchedTables4.length + ' tables found in format 4');
		matchedTables4.forEach(match => {
			faodebug.appendLine(match[0]);
		});


		// clean up tables


		replaceCurrentSelectionOrDocumentText(textOut);
	});
	context.subscriptions.push(formatTables);
	
	






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// footnote ref
	const footnoteRef = vscode.commands.registerCommand('fao-html-scripts.footnoteRef', () => {
		faodebug.appendLine('SCRIPT: footnoteRef');
	});
	context.subscriptions.push(footnoteRef);
	
	






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// target blank
	const targetBlank = vscode.commands.registerCommand('fao-html-scripts.targetBlank', () => {
		faodebug.appendLine('SCRIPT: targetBlank');
	});
	context.subscriptions.push(targetBlank);
	
	






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// fix headings
	const fixHeadings = vscode.commands.registerCommand('fao-html-scripts.fixHeadings', () => {
		faodebug.appendLine('SCRIPT: fixHeadings');
	});
	context.subscriptions.push(fixHeadings);
	
	






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// en to fr
	const englishToFrench = vscode.commands.registerCommand('fao-html-scripts.englishToFrench', () => {
		faodebug.appendLine('SCRIPT: englishToFrench');
		// replace template strings with French equivalents
		// add nbsp after certain punctuation marks
		// add nbsp as thousands separator in numbers
	});
	context.subscriptions.push(englishToFrench);

	






	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Rename fig files
	// This script expects the fig files to be in either a subfolder named "en" 
	// or "fr" and will attempt to rename the image files to match the filenames 
	// present in the HTML.
	// https://www.eliostruyf.com/devhack-rename-file-vscode-extension/
	const renameFigFiles = vscode.commands.registerCommand('fao-html-scripts.renameFigFiles', () => {
		faodebug.appendLine('SCRIPT: renameFigFiles');
	});
	context.subscriptions.push(renameFigFiles);
}

export function deactivate() {}
