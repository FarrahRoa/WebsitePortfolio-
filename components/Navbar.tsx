"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black uppercase tracking-[0.2em] text-white transition hover:text-white/80">
          Ley
        </Link>

        {/* Desktop navigation: unchanged, visible at lg and above */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative inline-flex items-center py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA: keep exact behavior at lg and above */}
        <div className="hidden lg:block">
          <Button href="/contact" variant="dark" className="border-white/30">Book a Project</Button>
        </div>

        {/* Mobile hamburger button: visible below lg */}
        <div className="lg:hidden">
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="relative h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-2"
          >
            <span className="sr-only">Menu</span>

            {/*
              Three absolutely-centered lines. When closed: top and bottom are offset using calc() so there are three stacked lines.
              When open: top and bottom are both centered and rotated to form a perfectly symmetrical X using origin-center.
            */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 h-[2px] w-7 bg-white transition-all duration-300 origin-center ${open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[calc(50%-8px)]'}`}
            />

            <span
              className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[2px] w-7 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`}
            />

            <span
              className={`absolute left-1/2 -translate-x-1/2 h-[2px] w-7 bg-white transition-all duration-300 origin-center ${open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[calc(50%+8px)]'}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu: absolute, opens below header, does not move page content */}
      <div
        className={`absolute left-0 top-full w-full origin-top transition-transform duration-200 lg:hidden ${open ? "scale-y-100" : "scale-y-0"}`}
        style={{ transformOrigin: 'top' }}
        aria-hidden={!open}
      >
        <div className="bg-black border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <nav className="flex flex-col gap-4 text-white">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center py-3 text-sm font-semibold uppercase tracking-[0.2em] transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-2">
                <Button href="/contact" variant="dark" className="w-full justify-center rounded-full py-2" onClick={() => { setOpen(false); }}>
                  Book a Project
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
