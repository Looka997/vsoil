import * as vscode from "vscode";

export function isOrLinksToDir(fileType: vscode.FileType) {
  return (fileType & vscode.FileType.Directory) !== 0;
}

export function isOrLinksToFile(fileType: vscode.FileType) {
  return (fileType & vscode.FileType.File) !== 0;
}

export async function getFileType(
  pathOrUri: string | vscode.Uri
): Promise<vscode.FileType> {
  const uri =
    typeof pathOrUri === "string" ? vscode.Uri.file(pathOrUri) : pathOrUri;
  return (await vscode.workspace.fs.stat(uri)).type;
}

export function getSelectedEntry(editor: vscode.TextEditor) {
  const lineNum = editor.selection.active.line;
  return editor.document.lineAt(lineNum).text.trim();
}
