"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const NotifyContext = createContext<(message: string) => void>(() => {});

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

/** Show the global success modal. */
export function useNotify() {
  return useContext(NotifyContext);
}

/** Ask for confirmation via a styled modal. Resolves true (confirm) / false (cancel). */
export function useConfirm() {
  return useContext(ConfirmContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Success toast/modal
  const [message, setMessage] = useState<string | null>(null);
  const notify = useCallback((msg: string) => setMessage(msg), []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // Confirmation modal
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);
  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setConfirmState(null);
  }, []);

  return (
    <NotifyContext.Provider value={notify}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {message ? (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
            role="status"
            aria-live="polite"
            onClick={() => setMessage(null)}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft" onClick={(event) => event.stopPropagation()}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={36} aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-primary">Berhasil</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{message}</p>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="mt-5 min-h-11 w-full rounded-lg bg-primary-container text-sm font-bold text-white"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : null}

        {confirmState ? (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => settle(false)}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-soft" onClick={(event) => event.stopPropagation()}>
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  confirmState.danger ? "bg-error/10 text-error" : "bg-surface-container-low text-primary"
                }`}
              >
                <AlertTriangle size={34} aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-primary">{confirmState.title ?? "Konfirmasi"}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{confirmState.message}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="min-h-11 rounded-lg border border-border-subtle bg-white text-sm font-bold text-on-surface-variant hover:bg-surface-gray"
                >
                  {confirmState.cancelLabel ?? "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => settle(true)}
                  className={`min-h-11 rounded-lg text-sm font-bold text-white ${
                    confirmState.danger ? "bg-error" : "bg-primary-container"
                  }`}
                >
                  {confirmState.confirmLabel ?? "Ya"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </ConfirmContext.Provider>
    </NotifyContext.Provider>
  );
}
