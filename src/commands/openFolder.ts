import * as vscode from "vscode";
import { SCHEME } from "../extension";

export async function openFolder() {
  const activeEditor = vscode.window.activeTextEditor;

  let dirPath: string | undefined;

  if (activeEditor?.document.uri.scheme === "file") {
    // If an editor is open, use its file's directory
    dirPath = vscode.Uri.joinPath(activeEditor.document.uri, "..").fsPath;
  } else if (vscode.window.activeTextEditor?.document.uri.scheme === SCHEME) {
    // Already in an oil:// buffer? Reopen same path
    dirPath = vscode.window.activeTextEditor.document.uri.path;
  } else {
    // Fallback: use workspace folder root
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      dirPath = folders[0].uri.fsPath;
    }
  }

  if (!dirPath) {
    vscode.window.showErrorMessage("No suitable folder found to open.");
    return;
  }

  const oilUri = vscode.Uri.parse(dirPath).with({ scheme: SCHEME });
  const doc = await vscode.workspace.openTextDocument(oilUri);
  vscode.window.showTextDocument(doc, { preview: false });
}
