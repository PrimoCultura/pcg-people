"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  adminNavItem,
  shouldShowAdminLink,
} from "@/config/adminAccess";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/Container";
import { SiteLogo } from "@/components/layout/SiteLogo";

function navLinkClass(active: boolean): string {
  return [
    "rounded-pcg-sm px-1 py-1 text-sm font-medium tracking-wide transition-colors",
    active
      ? "text-pcg-primary"
      : "text-pcg-text-secondary hover:text-pcg-primary",
  ].join(" ");
}

function adminLinkClass(active: boolean): string {
  return [
    "rounded-pcg-sm px-1 py-1 text-sm font-semibold tracking-wide transition-colors",
    active
      ? "text-pcg-primary"
      : "text-pcg-text hover:text-pcg-primary",
  ].join(" ");
}

function MobileNav({
  pathname,
  showAdmin,
}: {
  pathname: string;
  showAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-pcg border border-pcg-border text-pcg-ink md:hidden"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Chiudi" : "Menu"}</span>
        <span aria-hidden className="flex w-4 flex-col gap-1">
          <span
            className={`block h-px w-full bg-current transition ${open ? "translate-y-[5px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-full bg-current transition ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-full bg-current transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
          />
        </span>
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-t border-pcg-border bg-pcg-bg md:hidden"
      >
        <Container
          as="nav"
          className="flex flex-col gap-1 py-3"
          aria-label="Menu mobile"
        >
          {siteConfig.nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${navLinkClass(active)} block px-2 py-3`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {showAdmin ? (
            <>
              <div
                className="my-1 border-t border-pcg-border"
                aria-hidden
              />
              <Link
                href={adminNavItem.href}
                className={`${adminLinkClass(
                  pathname.startsWith("/admin"),
                )} block px-2 py-3`}
                aria-current={
                  pathname.startsWith("/admin") ? "page" : undefined
                }
                onClick={() => setOpen(false)}
              >
                {adminNavItem.label}
              </Link>
            </>
          ) : null}
        </Container>
      </div>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const showAdmin = shouldShowAdminLink();
  const adminActive = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-pcg-border/80 bg-pcg-bg/95 backdrop-blur-sm">
      <div className="relative">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
          <SiteLogo />

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Navigazione principale"
          >
            {siteConfig.nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {showAdmin ? (
              <>
                <span
                  className="h-4 w-px bg-pcg-border"
                  aria-hidden
                />
                <Link
                  href={adminNavItem.href}
                  className={adminLinkClass(adminActive)}
                  aria-current={adminActive ? "page" : undefined}
                >
                  {adminNavItem.label}
                </Link>
              </>
            ) : null}
          </nav>

          <MobileNav
            key={pathname}
            pathname={pathname}
            showAdmin={showAdmin}
          />
        </Container>
      </div>
    </header>
  );
}
