const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('asmformat is active!');

	let disposable = vscode.commands.registerCommand('asmformat.format', function () {
		if (updateAsm()) {
			vscode.window.showInformationMessage('The assembly code has been formated');
		} else {
			vscode.window.showErrorMessage("You can only format .asm files");
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() { }

function updateAsm() {
	const { activeTextEditor } = vscode.window;

		if (activeTextEditor) {
			var fileExt = activeTextEditor.document.fileName.split(".").pop();
			if (fileExt === "asm") {
				const { document } = activeTextEditor;

				const content = format(document.getText());

				const firstLine = document.lineAt(0);
				const lastLine = document.lineAt(document.getText().split("\n").length - 1);
				const edit = new vscode.WorkspaceEdit();
				edit.delete(document.uri, new vscode.Range(firstLine.range.start, lastLine.range.end))
				edit.insert(document.uri, firstLine.range.start, content);

				vscode.workspace.applyEdit(edit);
				return true;
			} else {
				return false;
			}
		}
}

String.prototype.replaceAt = function (index, replacement) {
	return this.substr(0, index) + replacement + this.substr(index + 1);
}

function isLabel(linea) {
	for (var j = 0; j < linea.length; ++j) {
		if (linea[j] == ';') return false;
		if (linea[j] == ':') return true;
	}
	return false;
}

function getPos(line, match) {
	var lines = line.split("")
	var others = false;
	for (var j = 0; j < lines.length; ++j) {
		if (lines[j] == match) {
			if (others) return j;
			else return -1;
		}
		else if (	lines[j] != ' '  &&
					lines[j] != '\t' &&
					lines[j] != '\r' &&
					lines[j] != '\n' &&
					lines[j] != '\v') 
		{
			others = true;
		}
	}
	return -1;
}

function format(text) {
	var code = text.trim();
	var lines = code.split("\n");

	//Align left lines
	for (var i = 0; i < lines.length; ++i) {
		lines[i] = lines[i].trim();
		lines[i] = lines[i].replace(/(\s*),(\s*)/g, ", ");
		lines[i] = lines[i].replace(/(\s*)\t(\s*)/g, ' ');
		lines[i] = lines[i].replace(/(\s*)\+(\s*)/g, ' + ');
		lines[i] = lines[i].replace(/(\s*)\-(\s*)/g, ' - ');
		lines[i] = lines[i].replace(/(\s*)\*(\s*)/g, ' * ');
		lines[i] = lines[i].replace(/(\s*)\/(\s*)/g, ' / ');
		lines[i] = lines[i].replace(/ +(?= )/g, '');
		if (!isLabel(lines[i])) {
			lines[i] = "\t" + lines[i];
		}
		var posComment = getPos(lines[i], ';');
		if (posComment != -1) {
			var spaces = ""
			for (var k = posComment; k < 30; ++k) {
				spaces += " "
			}
			lines[i] = lines[i].replaceAt(posComment, spaces + ';');
		}
	}

	//Reset Code
	code = "";
	for (i = 0; i < lines.length; ++i) {
		code += lines[i] + "\n";
	}

	return code;
}

module.exports = {
	activate,
	deactivate
}
