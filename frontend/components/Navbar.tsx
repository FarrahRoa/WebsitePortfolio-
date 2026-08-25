import Link from "next/link";
import { Button } from "@/components/Button";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black uppercase tracking-[0.2em] text-white transition hover:text-white/80">
          Ley
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
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
        {/* Book a Project CTA */}
        <Button href="/contact" variant="dark" className="border-white/30">Book a Project</Button>
      </div>
    </header>
  );
}
