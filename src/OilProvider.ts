import * as vscode from "vscode";

export class OilProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this._onDidChange.event;

  async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    try {
      const fileUri = vscode.Uri.file(uri.path);
      const entries = await vscode.workspace.fs.readDirectory(fileUri);
      const lines: string[] = [];

      addCurrentFolder(lines);
      addParentFolder(fileUri, lines);

      for (const [name, type] of entries) {
        lines.push(`${name}`);
      }

      return lines.join("\n");
    } catch (err) {
      return `Error reading directory: ${err}`;
    }

    function addCurrentFolder(lines: string[]) {
      lines.push(".");
    }

    function addParentFolder(fileUri: vscode.Uri, lines: string[]) {
      const parent = vscode.Uri.joinPath(fileUri, "..");
      if (parent.path !== fileUri.path) {
        lines.push("..");
      }
    }
  }

  refresh(uri: vscode.Uri) {
    this._onDidChange.fire(uri);
  }
}
