import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
            className="flex items-center justify-center rounded p-2"
          >
            <span className="sr-only">Menu</span>
            <div className="flex h-5 w-6 flex-col items-center justify-between">
              <span
                className={`block h-[2px] w-full bg-white transform transition duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`}
              />
              <span
                className={`block h-[2px] w-full bg-white transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`block h-[2px] w-full bg-white transform transition duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`}
              />
            </div>
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
                <Button variant="dark" className="w-full justify-center rounded-full py-2" onClick={() => { setOpen(false); router.push('/contact'); }}>
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
