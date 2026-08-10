// Confirmation dialog (SCR-WEB-005) — reusable modal for destructive actions
// (FR-UI-003). Native <dialog> + showModal(): the browser provides the scrim
// (::backdrop), the focus trap, Esc→cancel, and role="dialog"/aria-modal for
// free (technical-design §3.2 / §7 D2). First caller: Reset statistics (UC-07).

import { el } from "../dom.ts";

export interface ConfirmDialogOptions {
  title: string;
  body: string;
  confirmLabel: string; // danger action
  cancelLabel?: string; // ghost, default "Cancel"
  onConfirm: () => void; // called once, on confirm, before the dialog closes
}

/** Open a modal confirmation. Cancel (button / Esc / backdrop) closes without
 *  calling onConfirm; confirm calls onConfirm then closes. */
export function openConfirmDialog(opts: ConfirmDialogOptions): void {
  const dialog = el("dialog", "confirm-dialog");

  const title = el("h2", "confirm-title", opts.title);
  const body = el("p", "confirm-body", opts.body);

  const actions = el("div", "confirm-actions");
  const cancel = el("button", "btn ghost", opts.cancelLabel ?? "Cancel");
  cancel.type = "button";
  const confirm = el("button", "btn danger", opts.confirmLabel);
  confirm.type = "button";
  actions.append(cancel, confirm);

  dialog.append(title, body, actions);

  const close = (): void => {
    if (dialog.open) dialog.close();
  };
  cancel.addEventListener("click", close);
  confirm.addEventListener("click", () => {
    opts.onConfirm();
    close();
  });
  // Backdrop click cancels (U3): a click on the scrim reports coordinates
  // outside the dialog's content box. Native Esc already closes without confirm.
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    const outside =
      e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) close();
  });
  dialog.addEventListener("close", () => dialog.remove());

  document.body.append(dialog);
  dialog.showModal();
  cancel.focus(); // initial focus on the non-destructive action (U2)
}
