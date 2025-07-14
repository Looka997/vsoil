import { getSelectedEntry, getCurrentVSoil } from "./helpers";
import { Uri, window } from "vscode";
import { OperationsManager } from "./OperationsManager";
import { OperationType } from "./PendingOperation";

export async function rename(manager: OperationsManager) {
  const editor = getCurrentVSoil();
  if (!editor) {
    return;
  }

  const selectedEntry = getSelectedEntry(editor);
  const currentFolder = editor.document.uri.path;
  const path = `${currentFolder}/${selectedEntry}`;
  const source = Uri.file(path);
  const newName = await askForRename(selectedEntry);
  if (!newName) {
    return;
  }
  const destination = Uri.file(newName);

  manager.push({ type: OperationType.Rename, from: source, to: destination });
}

async function askForRename(source: string): Promise<string | undefined> {
  return await window.showInputBox({ value: source });
}
