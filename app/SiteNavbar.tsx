"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowRight, Atom, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Lessons", href: "/lessons/measurements-vectors" },
  { label: "About", href: "/about" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      setIsCheckingSession(true);

      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to check session");
        }

        const session = await response.json();

        if (active) {
          setUserName(
            typeof session?.user?.name === "string" && session.user.name.trim()
              ? session.user.name.trim()
              : session?.user
                ? "Account"
                : null
          );
        }
      } catch {
        if (active) {
          setUserName(null);
        }
      } finally {
        if (active) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();
    window.addEventListener("calph-profile-updated", checkSession);

    return () => {
      active = false;
      window.removeEventListener("calph-profile-updated", checkSession);
    };
  }, []);

  function isCurrentPage(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  function navLinkClass(href: string) {
    return `rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
      isCurrentPage(href)
        ? "bg-sky-400/10 text-sky-200"
        : "text-slate-300 hover:bg-white/5 hover:text-sky-300"
    }`;
  }

  const isLearningRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/home" ||
    pathname === "/ai-practice" ||
    pathname.startsWith("/ai-practice/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/lessons") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/about" ||
    pathname.startsWith("/about/");
  const isPublicHome = pathname === "/";
  const homeHref = userName ? "/home" : "/";

  return isLearningRoute ? null : (
    <nav
      aria-label="Main navigation"
      className="relative z-50 shrink-0 border-b border-white/10 bg-[#080D1B]/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href={isPublicHome ? "/" : homeHref}
          aria-label="Calph++ home"
          className="flex shrink-0 items-center gap-2 rounded-lg text-2xl font-black tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
        >
          <Atom size={24} className="text-sky-400" aria-hidden="true" />
          <span>
            Calph<span className="text-sky-400">++</span>
          </span>
        </Link>

        {isPublicHome ? (
          <p className="max-w-[13rem] text-right text-xs leading-5 text-slate-400 sm:max-w-none sm:text-sm">
            Learn physics by exploring. © 2026 Calph++.
          </p>
        ) : (
          <>
            <div className="hidden items-center gap-2 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href === "/" ? homeHref : link.href}
                  aria-current={
                    link.href === "/" ? (isCurrentPage(homeHref) ? "page" : undefined) :
                    isCurrentPage(link.href) ? "page" : undefined
                  }
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
              {userName && (
                <Link
                  href="/profile"
                  aria-current={isCurrentPage("/profile") ? "page" : undefined}
                  className={navLinkClass("/profile")}
                >
                  Profile
                </Link>
              )}
              {isCheckingSession ? (
                <span
                  className="ml-2 h-10 w-24 animate-pulse rounded-xl bg-white/5"
                  aria-label="Checking login status"
                />
              ) : userName ? (
                <div className="ml-2 flex items-center gap-3">
                  <span className="max-w-36 truncate text-sm text-slate-300">
                    {userName}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ redirectTo: "/" })}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2">
                  <Link
                    href="/login"
                    aria-current={pathname === "/login" ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={navLinkClass("/login")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    aria-current={pathname === "/register" ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    Register <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-site-navigation"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 md:hidden"
            >
              {isMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </>
        )}
      </div>

      {!isPublicHome && isMenuOpen && (
        <div
          id="mobile-site-navigation"
          className="border-t border-white/10 px-5 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href === "/" ? homeHref : link.href}
                aria-current={
                  link.href === "/" ? (isCurrentPage(homeHref) ? "page" : undefined) :
                  isCurrentPage(link.href) ? "page" : undefined
                }
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            {userName && (
              <Link
                href="/profile"
                aria-current={isCurrentPage("/profile") ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass("/profile")}
              >
                Profile
              </Link>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              {isCheckingSession ? (
                <span
                  className="h-10 w-24 animate-pulse rounded-xl bg-white/5"
                  aria-label="Checking login status"
                />
              ) : userName ? (
                <>
                  <span className="mr-auto max-w-40 truncate px-3 text-sm text-slate-300">
                    {userName}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ redirectTo: "/" })}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    aria-current={pathname === "/login" ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={navLinkClass("/login")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    aria-current={pathname === "/register" ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                  >
                    Register <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
