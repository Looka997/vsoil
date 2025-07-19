import { workspace } from "vscode";
import { OperationType, PendingOperation } from "./PendingOperation";

export class OperationsManager {
  private pendingOperations: PendingOperation[] = [];

  async applyOperations() {
    for (const operation of this.pendingOperations) {
      switch (operation.type) {
        case OperationType.Rename:
        case OperationType.Move:
          await workspace.fs.rename(operation.from, operation.to, {
            overwrite: true,
          });
          break;

        case OperationType.Copy:
          await workspace.fs.copy(operation.from, operation.to);
          break;

        case OperationType.Delete:
          await workspace.fs.delete(operation.target);
          break;

        default:
          const _exhaustiveCheck: never = operation;
          return _exhaustiveCheck;
      }
    }

    this.pendingOperations = [];
  }

  push(operation: PendingOperation) {
    this.pendingOperations.push(operation);
  }

  undo() {
    this.pendingOperations.pop();
  }
}
