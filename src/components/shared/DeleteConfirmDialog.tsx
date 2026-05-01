"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** The label of the item being deleted (e.g. book title, user name) */
  itemLabel: string;
  /** The noun describing what's being deleted (e.g. "book", "user") */
  itemType?: string;
  /** Whether the delete operation is in progress */
  isDeleting?: boolean;
  /** Called when the user confirms deletion */
  onConfirm: () => void;
  /** Optional extra description text appended before "This cannot be undone." */
  extraDescription?: string;
}

/**
 * A reusable delete confirmation dialog.
 *
 * The parent controls open state so it can set the correct item ID before opening.
 *
 * Example:
 *   <DeleteConfirmDialog
 *     open={deletingId !== null}
 *     onOpenChange={(open) => { if (!open) setDeletingId(null); }}
 *     itemLabel={selectedBook?.title ?? ""}
 *     itemType="book"
 *     isDeleting={isDeleting}
 *     onConfirm={handleDelete}
 *   />
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemLabel,
  itemType = "item",
  isDeleting = false,
  onConfirm,
  extraDescription,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete{" "}
            <strong>{itemLabel}</strong>?
            {extraDescription && <> {extraDescription}</>}
            {" "}This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Deleting...
              </span>
            ) : (
              `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
