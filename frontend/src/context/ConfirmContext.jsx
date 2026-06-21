/* ==========================================================================
   ConfirmContext.jsx

   Place at: src/context/ConfirmContext.jsx

   Wrap your app once, in main.jsx (alongside ThemeProvider):

      import { ConfirmProvider } from "./context/ConfirmContext";

      <ThemeProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </ThemeProvider>

   Then from ANY component, no local state needed:

      import { useConfirm } from "../context/ConfirmContext";

      function DeleteButton({ repoId }) {
        const confirm = useConfirm();

        async function handleDelete() {
          const ok = await confirm({
            title: "Delete repository",
            message: "This action cannot be undone.",
            confirmLabel: "Delete",
            variant: "danger",
          });
          if (!ok) return;
          await api.deleteRepo(repoId);
        }

        return <button className="btn btn-danger" onClick={handleDelete}>Delete</button>;
      }

   confirm() returns a Promise<boolean> — true if confirmed, false if
   cancelled (including clicking the overlay or pressing Escape).
   You can also pass onConfirm as an async function via the optional
   `handler` field if you want the dialog itself to show a loading
   state while it awaits — see handleDelete2 example below.
   ========================================================================== */

/* ==========================================================================
   ConfirmContext.jsx
   Place at: src/context/ConfirmContext.jsx
   ========================================================================== */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState(null); // null | { options, resolve }
  const [loading, setLoading] = useState(false);
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogState({ options });
    });
  }, []);

  const close = useCallback((result) => {
    setLoading(false);
    setDialogState(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => close(false), [close]);

  const handleConfirm = useCallback(async () => {
    const handler = dialogState?.options?.handler;
    const onError = dialogState?.options?.onError;

    if (handler) {
      try {
        setLoading(true);
        await handler();
        close(true);
      } catch (err) {
        // Stop the spinner and leave the dialog open so the user can
        // retry or cancel. If the caller passed onError, hand them the
        // error (e.g. to show a toast) instead of just logging it.
        setLoading(false);
        if (onError) {
          onError(err);
        } else {
          console.error(err);
        }
      }
    } else {
      close(true);
    }
  }, [dialogState, close]);

  // Escape key closes (cancels) the dialog.
  useEffect(() => {
    if (!dialogState) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") handleCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogState, handleCancel]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!dialogState}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...dialogState?.options}
      />
    </ConfirmContext.Provider>
  );
}

/** Returns a confirm(options) function. See usage examples above. */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used inside a <ConfirmProvider>");
  }
  return context;
}