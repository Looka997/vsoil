import { Uri } from "vscode";

export enum OperationType {
  Delete,
  Rename,
  Move,
  Copy,
}

export type PendingOperation =
  | {
      type: OperationType.Delete;
      target: Uri;
    }
  | {
      type: OperationType.Copy;
      from: Uri;
      to: Uri;
    }
  | {
      type: OperationType.Move;
      from: Uri;
      to: Uri;
    }
  | {
      type: OperationType.Rename;
      from: Uri;
      to: Uri;
    };
