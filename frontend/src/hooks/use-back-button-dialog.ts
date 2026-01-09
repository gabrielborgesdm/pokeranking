import { useEffect, useRef } from "react";

// Global stack to track open dialogs
const dialogStack: Array<{ id: string; onClose: () => void }> = [];
let isListenerAttached = false;

// Global popstate handler
function handlePopState() {
  // Close the most recent dialog
  const topDialog = dialogStack[dialogStack.length - 1];
  if (topDialog) {
    // Remove from stack
    dialogStack.pop();
    // Close the dialog
    topDialog.onClose();
  }
}

/**
 * Hook to handle browser back button for closing dialogs
 * Uses a global stack to manage multiple dialogs properly
 *
 * @param isOpen - Whether the dialog is currently open
 * @param onClose - Callback to close the dialog
 */
export function useBackButtonDialog(isOpen: boolean, onClose: () => void) {
  const dialogIdRef = useRef<string>("");
  const isRegisteredRef = useRef(false);

  useEffect(() => {
    // Attach global listener if not already attached
    if (!isListenerAttached) {
      window.addEventListener("popstate", handlePopState);
      isListenerAttached = true;
    }

    if (isOpen && !isRegisteredRef.current) {
      // Generate unique ID for this dialog
      const dialogId = `dialog-${Date.now()}-${Math.random()}`;
      dialogIdRef.current = dialogId;

      // Add to stack
      dialogStack.push({ id: dialogId, onClose });
      isRegisteredRef.current = true;

      // Push a dummy state to enable back button handling
      window.history.pushState({ dialogId }, "");
    }

    if (!isOpen && isRegisteredRef.current) {
      // Dialog was closed normally (not via back button)
      isRegisteredRef.current = false;

      // Remove from stack
      const index = dialogStack.findIndex((d) => d.id === dialogIdRef.current);
      if (index !== -1) {
        dialogStack.splice(index, 1);

        // Only go back if this was the top dialog and its state is still on history
        if (
          index === dialogStack.length &&
          window.history.state?.dialogId === dialogIdRef.current
        ) {
          setTimeout(() => {
            window.history.back();
          }, 0);
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (isRegisteredRef.current) {
        const index = dialogStack.findIndex((d) => d.id === dialogIdRef.current);
        if (index !== -1) {
          dialogStack.splice(index, 1);
        }
        isRegisteredRef.current = false;
      }
    };
  }, [isOpen, onClose]);
}
