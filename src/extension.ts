import * as vscode from "vscode";
import { OilProvider } from "./OilProvider";

const SCHEME = "oil";

export function activate(context: vscode.ExtensionContext) {
  const provider = new OilProvider();

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

  context.subscriptions.push(enterFolderCommand, openCurrentFolderCommand);

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

function isOrLinksToDir(fileType: vscode.FileType) {
  return (fileType & vscode.FileType.Directory) !== 0;
}

function isOrLinksToFile(fileType: vscode.FileType) {
  return (fileType & vscode.FileType.File) !== 0;
}

async function enterFolder() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.uri.scheme !== SCHEME) {
    vscode.window.showInformationMessage(
      `This only works in a ${SCHEME}:// buffer.`
    );
    return;
  }

  const lineNum = editor.selection.active.line;
  const selectedFolder = editor.document.lineAt(lineNum).text.trim();
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

async function getFileType(
  pathOrUri: string | vscode.Uri
): Promise<vscode.FileType> {
  const uri =
    typeof pathOrUri === "string" ? vscode.Uri.file(pathOrUri) : pathOrUri;
  return (await vscode.workspace.fs.stat(uri)).type;
}

async function openFolder() {
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

export function deactivate() {}
