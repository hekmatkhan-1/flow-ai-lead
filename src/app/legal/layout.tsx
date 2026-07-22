/**
 * Shared layout for all legal pages.
 * Centered max-w-3xl container with prose-like typography and dark mode support.
 */
import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* Minimal nav bar */}
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-sm shadow-blue-500/25">
              LF
            </div>
            LeadFlow AI
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/legal/privacy"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Terms
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-4 py-12 sm:px-6 lg:py-16">
        <div className="prose prose-gray mx-auto max-w-3xl dark:prose-invert">
          {children}
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} LeadFlow AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
