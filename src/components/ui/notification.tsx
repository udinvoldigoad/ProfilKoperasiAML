"use client";

import { CheckCircle2 } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const NotifyContext = createContext<(message: string) => void>(() => {});

/** Call this in any client component to show the global success modal. */
export function useNotify() {
  return useContext(NotifyContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const notify = useCallback((msg: string) => setMessage(msg), []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <NotifyContext.Provider value={notify}>
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
    </NotifyContext.Provider>
  );
}
