// todo: clean up use of custom consoleLog, faodebug, showInformationMessage
// todo: clean up formatAsString, formatAsNormal, FormatAsPretty 
// todo: clean up inconsistent regex usage
// ongoing: add more "formats" to Format Charts / Format Tables
// 

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
    textOut = textOut.replace(/\s(\w+)\s*=\s*"([^"]*)"/gim, ' $1="$2"'); // double quotes
    textOut = textOut.replace(/\s(\w+)\s*=\s*'([^']*)'/gim, ' $1="$2"'); // single quotes
    textOut = textOut.replace(/\s(\w+)\s*=\s*([^"'][^>\s]*)/gim, ' $1="$2"'); // no quotes


  // P tags should not have space before closing tag, or after opening tag.
    textOut = textOut.replace(/<p>\s+/gim, '<p>');
    textOut = textOut.replace(/\s+<\/p>/gim, '</p>');

    // tags should not have spaces immediatley after opening tag, or before the closing tag. 
    // textOut = textOut.replace(/<([^>\/]+)>\s+/gim, '<$1>'); // open tag then space
    // textOut = textOut.replace(/\s<\/([^>\/]+)>/gim, '<$1>'); // space then close tag
    // todo: add spaces between words

    // IMG should be on own line if not inside a P tag
    textOut = textOut.replace(/<\/p>\s*(<img[^>]*>)(?![^<]*<\/)\s*/gim, '</p>\n$1\n');



    // these tags should always be on a new line
    const newlineBeforeTags = [
      'p',
      'hr',
      // 'img',
      'div','/div',
      'details','/details',
      'figure', '/figure', 
      'figcaption', '/figcaption',
      'table', '/table', 
      'caption', 
      'thead', '/thead', 
      'tbody', '/tbody', 
      'tfoot', '/tfoot',
      'tr', '/tr', 
      'td', 
      'th', 
      'ul', '/ul', 'ol', '/ol', 'dl', '/dl', 
      'li', 'dt', 'dd',
      'h1','h2','h3','h4','h5','h6',
    ];
    newlineBeforeTags.forEach(tag => {
      // new RegExp works...
			const rTag = new RegExp(`<${tag}`, 'gim');
      textOut = textOut.replace(rTag, '\n$&');
      //.. just string literal doesn't
      // textOut = textOut.replace(`<${tag}`, '\n$&');
    });

    // these tags should always end a line (no content after them on the same line)
    const newlineAfterTags = [
      '/p',
      'hr',
      // 'img',
      '/div',
      '/details',
      '/figure', 
      '/figcaption',
      '/table', 
      '/caption', 
      '/thead', 
      '/tbody', 
      '/tfoot',
      '/tr', 
      '/td', 
      '/th', 
      '/ul', '/ol', '/dl', 
      '/li', '/dt', '/dd',
      '/h1','/h2','/h3','/h4','/h5','/h6',
    ];
    newlineAfterTags.forEach(tag => {
			const rTag = new RegExp(`</${tag}>`, 'gim');
      textOut = textOut.replace(rTag, '$&\n');
    });

    // separate certain tags with newlines before and after
    // const separateTags = [
    // 	'p',
    // ];
    // separateTags.forEach(rString => {
    // 	textOut = textOut.replace(rString, '$&\n');
    // });


    // remove leading/trailing spaces from each line
    textOut = textOut.replace(/^ */gim, '');
    textOut = textOut.replace(/ *$/gim, '');

    // remove empty lines
    textOut = textOut.replace(/^\s*$/gim, '');

    // remove extra newlines
    textOut = textOut.replace(/\n{2,}/gim, '\n');



    // Finally, return changed text
    return textOut;
  };





  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // formatAsPretty 
  // This funciton adds indentation, extra newlines, and other formatting to 
  // make the HTML more readable.
  const formatAsPretty = (textIn: string) => {
    // vscode.window.showInformationMessage('FAO Format as Pretty is not yet implemented.');
    let textOut = formatAsNormal(textIn);

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
    // let indentLevel = 0;
    // textOut = textOut.replace(/\/(ul|ol)><\/li/gim, '$1\n</li');
    // const openTags = ['<ul', '<ol', '<dl', '<li', '<dt', '<dd'];
    // const closeTags = ['</ul', '</ol', '</dl', '</li', '</dt', '</dd'];
    // let textOutLines = textOut.split('\n');
    // // for each line...
    // textOutLines.forEach(line => {
    //   if ( openTags.filter(s => line.toLowerCase().startsWith(s)) ) {
    //     // if line starts with list opening tag...
    //     // indent...
    //     line = line.replace();
    //     // then increase indentLevel
    //     indentLevel++;
    //   } else if ( closeTags.filter(s => line.toLowerCase().startsWith(s)) ) {
    //     // if line starts with list closing tag...
    //     // decrease indentLevel...
    //     indentLevel--;
    //     // then indent
    //   } else {

    //   }
    // });



    // format tables


    
    // headings get extra spacing before and after
    const hSpacing: [string, number][] = [
      ['h1', 6],
      ['h2', 5],
      ['h3', 4],
      ['h4', 3],
      ['h5', 2],
      ['h6', 1],
    ];
    hSpacing.forEach(hsArray => {
      const tag = hsArray[0];
      const newlines = hsArray[1];
      // add newlines before headings
			const rBefore = new RegExp(`<${tag}`, 'gim');
      textOut = textOut.replace(rBefore, '\n'.repeat(newlines) + '$&');
      // one spacing after all headings
			const rAfter = new RegExp(`</${tag}>`, 'gim');
      textOut = textOut.replace(rAfter, '$&\n');
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
    faodebug.appendLine('SCRIPT: stripStyles');
    // consoleLog("fao-html-scripts.stripStyles");
    // // Get the active text editor
    // const editor = vscode.window.activeTextEditor;
    // // If there's no active editor, do nothing
    // if (!editor) { 
    // 	consoleLog('Error: FAO HTML Scripts needs an active document to work on. [stripStyles]');
    // 	return; 
    // }
    // // get text from selection or document
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
      / alt="P[a-zA-Z0-9]+#y[a-zA-Z0-9]+"/,
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
    // remove IMGs inside of, and at the end of, Ps
    textOut = textOut.replace(/\s*(<img[^>]*>)\s*<\/p>/gim, '</p>\n$1');
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
    faodebug.appendLine('SCRIPT: fixLists');
    // vscode.window.showInformationMessage('SCRIPT: fixLists');
    // consoleLog('SCRIPT: fixLists');
    let numFound = 0;
    
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

    const rLists = /<p>[·•o§]\s[\s\S]*?<\/p>(?!\s*<p>\s*[·•o§]\s)/gi;
    const matchedLists = [...textOut.matchAll(rLists)];
    // let tmp = '';
    // let i = 0;
    numFound += matchedLists.length;
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

    // result message for user
    consoleLog(`Fix Lists: ${numFound} lists found and fixed.`);
  });
  context.subscriptions.push(fixLists);
  






























  







  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // format charts
  const formatCharts = vscode.commands.registerCommand('fao-html-scripts.formatCharts', () => {
    faodebug.appendLine('SCRIPT: formatCharts');
    // consoleLog("fao-html-scripts.formatCharts");
    let numFound = 0;
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


    // format 5
    // [figure XX] and [title] and [y-axis label] in separate paragraphs
    const rCharts5 = /<p>\s*(?:<strong>)?Figure .*?\s<p>.*?<\/p>\s*<p>.*?<\/p>\s*<img [\s\S]*?<p>Sources?.*?<\/p>/gim;
    const matchedCharts5 = [...textOut.matchAll(rCharts5)];
    numFound += matchedCharts5.length;
    // consoleLog("found " + matchedCharts5.length + " charts in format 5");

    matchedCharts5.forEach(match => {
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
    replaceCurrentSelectionOrDocumentText(textOut);

    // result message for user
    consoleLog(`Format Charts: ${numFound} charts found.`);
  });
  context.subscriptions.push(formatCharts);
  
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
<details class="alt-text"><summary>Accessible version</summary></details>
</div>
`;

    return html;
  };
  




































  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // format tables
  const formatTables = vscode.commands.registerCommand('fao-html-scripts.formatTables', () => {
    faodebug.appendLine('SCRIPT: formatTables');
    let numFound = 0;

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [formatTables]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [formatTables]');
      return;
    }
    let textOut = textIn;
    // textOut = formatAsString(textIn);


    // Format 1
    // <p>Table ... <table ... <p>Source ... </p>
    const rTables1 = /<p>\s*(?:<strong>)?(?:Figure|Table|Chart).*?\n*\S*<table[\s\S]*?<p>Source.*?<\/p>/gim;
    const matchedTables1 = [...textOut.matchAll(rTables1)];
    numFound += matchedTables1.length;
    faodebug.appendLine(matchedTables1.length + ' tables found in format 1');
    matchedTables1.forEach(match => {
      faodebug.appendLine(match[0]);
    });


    // Format 2
    // table num and title in separate paragraphs
    // <p>Table ... </p> <p> ... </p> <table ... <p>Source ... </p>
    const rTables2 = /<p>\s*(?:<strong>)?(?:Figure|Table|Chart).*?\s*<p>.*?<\/p>\s*<table[\s\S]*?<p>Source.*?<\/p>/gim;
    const matchedTables2 = [...textOut.matchAll(rTables2)];
    faodebug.appendLine(matchedTables2.length + ' tables found in format 2');
    numFound += matchedTables2.length;
    matchedTables2.forEach(tableMatch => {
      // faodebug.appendLine(tableMatch[0]);
      let textOld = tableMatch[0];
      
      // vars to eventually pass to getTableHtml()
      let tableType: string = '';
      let numMajor: string = '';
      let numSeparator: string = '';
      let numMinor: string = '';
      let title: string = '';
      let table: string = '';
      let notes: string[] = [];
      let source: string = '';
  
      // get title
      let tableTitleMatch = [...textOld.matchAll(/<p>\s*(?:<strong>)?(Figure|Table|Chart) ([A-Z0-9]+)([\.\-‑ ]*)([A-Z0-9]*).*?\s*<p>(.*?)<\/p>\s*<table/gim)][0];
      if(tableTitleMatch) {
        // faodebug.appendLine(`tableTitleMatch: ${tableTitleMatch}`);
        tableType    = tableTitleMatch[1] !== undefined ? tableTitleMatch[1] : '';
        numMajor     = tableTitleMatch[2] !== undefined ? tableTitleMatch[2] : '';
        numSeparator = tableTitleMatch[3] !== undefined ? tableTitleMatch[3] : '';
        numMinor     = tableTitleMatch[4] !== undefined ? tableTitleMatch[4] : '';
        title        = tableTitleMatch[5] !== undefined ? tableTitleMatch[5] : '';
        // faodebug.appendLine(tableType + ' ' + numMajor  + numSeparator + numMinor + ': ' + title);
        // faodebug.appendLine(tableTitleMatch[1] + ' ' + tableTitleMatch[2]  + tableTitleMatch[3] + tableTitleMatch[4] + ': ' + tableTitleMatch[5]);
      }

      // get table
      table = [...textOld.matchAll(/<table[\s\S]*?<\/table>/gim)][0][0] || '';
      // table = getClassedTableHtml(table);

      // get notes/source
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
      let newTableHtml = getTableHtml(tableType, numMajor, numSeparator, numMinor, title, notes, source, table);
      textOut = textOut.replace(textOld, newTableHtml);
    });


    // Format 3
    // alt text tables
    const rTables3 = /<\/summary>\s*<table[\s\S]*?<\/details>/gim;
    const matchedTables3 = [...textOut.matchAll(rTables3)];
    numFound += matchedTables3.length;
    faodebug.appendLine(matchedTables3.length + ' tables found in format 3');
    matchedTables3.forEach(match => {
      faodebug.appendLine(match[0]);
    });


    // Format 4
    // table with title as attribute
    const rTables4 = /<table table=[\s\S]*?<p>Source.*?<\/p>/gim;
    const matchedTables4 = [...textOut.matchAll(rTables4)];
    numFound += matchedTables4.length;
    faodebug.appendLine(matchedTables4.length + ' tables found in format 4');
    matchedTables4.forEach(match => {
      faodebug.appendLine(match[0]);
    });


    // clean up tables


    // Finally, replace text
    replaceCurrentSelectionOrDocumentText(textOut);

    // result message for user
    consoleLog(`Format Tables: ${numFound} unformatted tables found.`);
  });
  context.subscriptions.push(formatTables);
  
  const getTableHtml = (
    tableType: string = 'Table', 
    numMajor: string,
    numSeparator: string,
    numMinor: string,
    title: string,
    notes: string[],
    source: string,
    table: string,
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
    // note block
    let noteBlock = '';
    notes.forEach(note => {
      let trimmedNote = note.trim();
      if(trimmedNote.length > 0) { noteBlock += `<caption class="note">${note}</caption>\n`; }
    });
    html = `
<div class="report-table-container">
<table class="report-table" id="${anchor}">
<caption class="title"><span>${tableType} ${numMajor}${numSeparator}${numMinor}</span> ${title}</caption>
${noteBlock}<caption class="source">${source}</caption>
${getClassedTableHtml(table)}
</div>
`;
    return html;
  };

function getClassedTableHtml(table:string = '') {
  let html:string = table;
  // add empty class attr to every TR,TH,TD if they don't already have a class attr
  html = html.replace(/<(t[rhd])(?! class=)([^>]*?)>/gim, '<$1 class=""$2>');
  // add 'header' class to first TR, and change all TDs inside to THs
  let firstRowMatch = html.match(/<tr[\s\S]*?<\/tr>/im);
  if( firstRowMatch?.length ) {
    let oldFirstRow = firstRowMatch[0];
    let firstRow = firstRowMatch[0];
    faodebug.appendLine('firstRow: ' + firstRow);
    let classMatch:string = [...firstRow.matchAll(/<tr class="([^"]*?)"/gim)][0][1] || '';
    faodebug.appendLine('classMatch (' + classMatch.length + '): ' + classMatch);
    let classList:string[] = classMatch.trim().length > 0 ? (classMatch.trim()).split(' ') : [];
    faodebug.appendLine('classList (' + classList.length + '): ' + classList);
    if (classList.length === 0) {
      // no classes, add header class
      firstRow = firstRow.replace('tr class="','tr class="header');
    } else if (classList.includes('header')) {
      // already has header class, do nothing
    } else {
      // already has other classes, add header class plus space
      firstRow = firstRow.replace('tr class="','tr class="header ');
    }
    // TD -> TH
    firstRow = firstRow.replace(/<td/gim,'<th');
    firstRow = firstRow.replace(/<\/td/gim,'</th');
    html = html.replace(oldFirstRow,firstRow);
  }
  return html;
}




























  






  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // footnote ref
  const footnoteRef = vscode.commands.registerCommand('fao-html-scripts.footnoteRef', () => {
    faodebug.appendLine('SCRIPT: footnoteRef');

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [footnoteRef]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [footnoteRef]');
      return;
    }
    let textOut = textIn;
    textOut = formatAsNormal(textIn);

    // get all ftn links
    let ftnMatches = [...textOut.matchAll(/<a href="#_ftn(\d+)".*?>/gim)];
    let numFound = ftnMatches.length;
    faodebug.appendLine(ftnMatches.length + ' footnote links found');
    ftnMatches.forEach(ftnMatch => {
      let ftnString:string = ftnMatch[0];
      // get ref num
      let num:string = ftnMatch[1];
      // remove any existing id
      ftnString = ftnString.replace(/ id\s*=\s*"(.*)"/gim,'');
      // add correct id
      ftnString = ftnString.replace(/>/gim,` id="_ftnref${num}">`);
      faodebug.appendLine(ftnMatch[0] + ' -> ' + ftnString);

      textOut = textOut.replace(ftnMatch[0],ftnString);
    });

    // get all ftnref links
    let ftnrefMatches = [...textOut.matchAll(/<a href="#_ftnref(\d+)".*?>/gim)];
    faodebug.appendLine(ftnrefMatches.length + ' footnote links found');
    ftnrefMatches.forEach(ftnrefMatch => {
      let ftnrefString:string = ftnrefMatch[0];
      // get ref num
      let num:string = ftnrefMatch[1];
      // remove any existing id
      ftnrefString = ftnrefString.replace(/ id\s*=\s*"(.*)"/gim,'');
      // add correct id
      ftnrefString = ftnrefString.replace(/>/gim,` id="_ftn${num}">`);
      faodebug.appendLine(ftnrefMatch[0] + ' -> ' + ftnrefString);

      textOut = textOut.replace(ftnrefMatch[0],ftnrefString);
    });

    // Finally, replace text
    replaceCurrentSelectionOrDocumentText(textOut);

    // result message for user
    consoleLog(`Footnote Ref: ${numFound} footnote links found and updated.`);
  });
  context.subscriptions.push(footnoteRef);
  






























  






  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // target blank
  // Set any external links (ie non fao-on.org URLs) to open in a new tab by 
  // adding taget="_blank" to link. Does not remove existing target="_blank" 
  // from any links.
  const targetBlank = vscode.commands.registerCommand('fao-html-scripts.targetBlank', () => {
    faodebug.appendLine('SCRIPT: targetBlank');

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [targetBlank]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [targetBlank]');
      return;
    }
    let textOut = textIn;
    // textOut = formatAsString(textIn);

    // array of valid FAO domains used to determine if link URL is internal
    const validHostnames = ['fao-on.org','dev.fao-on.org'];

    // find all A tags
    let linkMatches = [...textOut.matchAll(/<a href="([^">]+)".*?>/gim)];
    let numFound = linkMatches.length;
    let numChanged = 0;
    faodebug.appendLine(linkMatches.length + ' links found');
    linkMatches.forEach(linkMatch => {
      let linkString:string = linkMatch[0];
      let hrefString:string = linkMatch[1];
      let parsedUrl = URL.parse(hrefString);

      // if URL is invalid, skip this link
      if (!parsedUrl) {
        faodebug.appendLine('[x] [URL.parse error: invalid URL] ' + linkString);
        return;
      }
      // if URL domain is FAO, skip this link
      if(validHostnames.includes(parsedUrl.hostname)) { 
        faodebug.appendLine('[x] [URL is FAO domain] ' + linkString);
        return; 
      }
      // if href doesn't start with "http", skip this link
      // [relative URLs should be filtered out by URL.parse above, but this will reject other]
      if (hrefString.toLowerCase().startsWith('http') === false) { 
        faodebug.appendLine('[x] [href does not start with http] ' + linkString);
        return; 
      }
      // if link already has target="_blank", skip this link
      let targetBlankMatches = [...linkString.matchAll(/ target="_blank"/gim)];
      if (targetBlankMatches.length > 0) { 
        faodebug.appendLine('[x] [already has target="_blank"] ' + linkString);
        return; 
      }

      // add target="_blank" to link
      linkString = linkString.replace(/>/gim,' target="_blank">');
      faodebug.appendLine('[+] [target="_blank" added] ' + linkString);
      numChanged++;

      textOut = textOut.replace(linkMatch[0],linkString);
    });


    // Finally, replace text
    replaceCurrentSelectionOrDocumentText(textOut);

    // result message for user
    consoleLog(`Target Blank: ${numFound} links found, ${numChanged} links changed.`);
  });
  context.subscriptions.push(targetBlank);
  






























  






  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // fix headings
  const fixHeadings = vscode.commands.registerCommand('fao-html-scripts.fixHeadings', () => {
    faodebug.appendLine('SCRIPT: fixHeadings');
    let numFound = 0;
    let numChanged = 0;
    const minLevel = 2;
    const maxLevel = 6;

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [fixHeadings]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [fixHeadings]');
      return;
    }
    let textOut = textIn;
    // textOut = formatAsString(textIn);


    // find all headings
    let hObjects:any = [];
    let headingMatches = [...textOut.matchAll(/<h(\d).*?<\/h\d>/gim)];
    numFound = headingMatches.length;
    headingMatches.forEach( (match, i:number) => {
      let heading:string = match[0];
      let parentIndex:number = Number(getParentIndex(headingMatches,i));
      let oldLevel:number = Number(match[1]);
      let newLevel:number = Number(oldLevel);
      hObjects.push([heading, parentIndex, oldLevel, newLevel]);
    });

    // figure out correct heading levels
    hObjects.forEach( (hObject:any, i:number) => {
      let heading:string = hObject[0];
      let parentIndex:number = hObject[1];
      let oldLevel:number = hObject[2];
      let newLevel:number = hObject[3];
      // if parentIndex is -1, set newLevel to minLevel
      if (parentIndex < 0) { 
        newLevel = minLevel; 
      } else {
        // otherwise, get the parent's level ...
        let parentLevel = hObjects[parentIndex][3];
        //... and set newLevel to parentLevel + 1 (or maxLevel, whichever is lower)
        newLevel = Math.min(parentLevel + 1, maxLevel);
      }
      //update hObjects with newLevel
      hObjects[i][3] = newLevel;
    });

    // make changes
    hObjects.forEach( (hObject:any, i:number) => {
      // replace oldLevel with NewLevel
      if (hObject[2] !== hObject[3]){
        numChanged++;
        let newHeadingString = hObject[0].replace(/<h\d(.*?)<\/h\d>/gim,`<h${hObject[3]}$1</h${hObject[3]}>`);
        textOut = textOut.replace(hObject[0],newHeadingString);
      }
      let pad:string = '-'.repeat(hObject[3] - 1);
      faodebug.appendLine(`[${i}] ${pad}h${hObject[3]}, ${hObject[0]}, ${hObject[1]}, ${hObject[2]}`);
    });



    // Finally, replace text
    replaceCurrentSelectionOrDocumentText(textOut);

    // result message for user
    consoleLog(`Fix Headings: ${numFound} headings found, ${numChanged} headings changed.`);
  });
  context.subscriptions.push(fixHeadings);
  
  function getParentIndex(headingMatches:any, thisIndex:number) {
    let thisLevel:number = headingMatches[thisIndex][1];
    let parentIndex = thisIndex;
    while(parentIndex >= 0){
      let parentLevel:number = headingMatches[parentIndex][1];
      if(parentLevel < thisLevel){ return parentIndex; }
      parentIndex--;
    }
    return -1;
  }






























  






  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // en to fr
  const englishToFrench = vscode.commands.registerCommand('fao-html-scripts.englishToFrench', () => {
    faodebug.appendLine('SCRIPT: englishToFrench');
    // replace template strings with French equivalents
    // add nbsp after certain punctuation marks
    // add nbsp as thousands separator in numbers

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [englishToFrench]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [englishToFrench]');
      return;
    }
    let textOut = textIn;
    // textOut = formatAsString(textIn);
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

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    // If there's no active editor, do nothing
    if (!editor) { 
      vscode.window.showInformationMessage('Error: FAO HTML Scripts needs an active document to work on. [renameFigFiles]');
      return; 
    }
    // get text from selection or document
    const textIn = getCurrentSelectionOrDocumentText() || '';
    if (textIn.trim() === '') {
      vscode.window.showInformationMessage('Error: No text found in the current selection or document. [renameFigFiles]');
      return;
    }
    let textOut = textIn;
    // textOut = formatAsString(textIn);
  });
  context.subscriptions.push(renameFigFiles);
}































export function deactivate() {}
