import * as vscode from "vscode";
import { OilProvider } from "./OilProvider";
import { enterFolder } from "./enterFolder";
import { openFolder } from "./openFolder";
import { getFileType, isOrLinksToDir, isOrLinksToFile } from "./helpers";
import { rename } from "./rename";
import { OperationsManager } from "./OperationsManager";

export const SCHEME = "oil";

export function activate(context: vscode.ExtensionContext) {
  const provider = new OilProvider();
  const manager = new OperationsManager();

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(SCHEME, provider)
  );

  const enterFolderCommand = vscode.commands.registerCommand(
    "vsoil.enterFolder",
    enterFolder
  );

  const openCurrentFolderCommand = vscode.commands.registerCommand(
    "vsoil.openFolder",
    openFolder
  );

  const renameCommand = vscode.commands.registerCommand("vsoil.rename", () =>
    rename(manager)
  );

  context.subscriptions.push(
    enterFolderCommand,
    openCurrentFolderCommand,
    renameCommand
  );

  const fileDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath("images/file-regular.svg"),
    gutterIconSize: "contain",
  });

  const folderDecoration = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath("images/folder-regular.svg"),
    gutterIconSize: "contain",
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor?.document.uri.scheme === SCHEME) {
      applyDecorations(editor, folderDecoration, fileDecoration);
    }
  });

  vscode.workspace.onDidOpenTextDocument((doc) => {
    const editor = vscode.window.visibleTextEditors.find(
      (e) => e.document === doc
    );
    if (editor && doc.uri.scheme === SCHEME) {
      applyDecorations(editor, folderDecoration, fileDecoration);
    }
  });
}

async function applyDecorations(
  editor: vscode.TextEditor,
  folderDecoration: vscode.TextEditorDecorationType,
  fileDecoration: vscode.TextEditorDecorationType
) {
  const doc = editor.document;
  const entries = doc.getText().split("\n");

  const folderRanges: vscode.DecorationOptions[] = [];
  const fileRanges: vscode.DecorationOptions[] = [];

  const currentFolder = vscode.Uri.file(doc.uri.path);

  for (let lineIndex = 0; lineIndex < entries.length; lineIndex++) {
    const entry = entries[lineIndex].trim();

    // . and .. are always folders
    if (entry === "." || entry === "..") {
      folderRanges.push({ range: doc.lineAt(lineIndex).range });
    } else {
      const entryUri = vscode.Uri.joinPath(currentFolder, entry);
      const type = await getFileType(entryUri);

      setTypeBasedDecoration(type, doc, lineIndex, folderRanges, fileRanges);
    }
  }

  editor.setDecorations(folderDecoration, folderRanges);
  editor.setDecorations(fileDecoration, fileRanges);
}

function setTypeBasedDecoration(
  type: vscode.FileType,
  doc: vscode.TextDocument,
  lineIndex: number,
  folderRanges: vscode.DecorationOptions[],
  fileRanges: vscode.DecorationOptions[]
) {
  if (isOrLinksToDir(type)) {
    folderRanges.push({ range: doc.lineAt(lineIndex).range });
  } else if (isOrLinksToFile(type)) {
    fileRanges.push({ range: doc.lineAt(lineIndex).range });
  }
}

export function deactivate() {}
