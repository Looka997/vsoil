import { getCurrentVSoil } from "./helpers";
import { OilProvider } from "./OilProvider";
import { OperationsManager } from "./OperationsManager";

export function applyOperations(
  manager: OperationsManager,
  provider: OilProvider
) {
  const editor = getCurrentVSoil();
  if (!editor) {
    return;
  }

  manager.applyOperations();
  provider.refresh(editor.document.uri);
}
