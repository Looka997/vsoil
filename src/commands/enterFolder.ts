import * as vscode from "vscode";
import { SCHEME } from "../extension";
import {
  getCurrentVSoil,
  getFileType,
  getSelectedEntry,
  isOrLinksToDir,
} from "../helpers";

export async function enterFolder() {
  const editor = getCurrentVSoil();
  if (!editor) {
    return;
  }

  const selectedFolder = getSelectedEntry(editor);
  const currentFolder = editor.document.uri.path;
  const newPath = `${currentFolder}/${selectedFolder}`;

  const fileUri = vscode.Uri.file(newPath);
  const fileType = await getFileType(fileUri);
  if (!isOrLinksToDir(fileType)) {
    vscode.window.showInformationMessage("Not a folder.");
    return;
  }

  const oilUri = fileUri.with({ scheme: SCHEME });
  await navigateTo(oilUri);
}

async function navigateTo(oilUri: vscode.Uri) {
  const doc = await vscode.workspace.openTextDocument(oilUri);
  vscode.window.showTextDocument(doc, { preview: true });
  await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
}
