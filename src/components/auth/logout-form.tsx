import { LogOut } from "lucide-react";

/**
 * Logout as a POST form so Next.js <Link> prefetching can never trigger it.
 * (A prefetched GET logout silently ended the session in production.)
 */
export function LogoutForm() {
  return (
    <form action="/api/auth/logout" method="post">
      <input type="hidden" name="next" value="/login" />
      <button
        type="submit"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-subtle text-sm font-bold text-on-surface-variant hover:bg-surface-gray"
      >
        <LogOut size={18} aria-hidden="true" />
        Keluar
      </button>
    </form>
  );
}
