"use client";

import { motion } from "framer-motion";

const sectionSelector = '[data-scroll-section]';

export function ScrollSectionNav() {
  const scrollToSection = (direction: 1 | -1) => {
    const sections = Array.from(document.querySelectorAll(sectionSelector)) as HTMLElement[];
    const currentIndex = sections.findIndex((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top >= -80 && rect.top <= window.innerHeight * 0.5;
    });

    const targetIndex = currentIndex >= 0 ? currentIndex + direction : direction === 1 ? 0 : sections.length - 1;
    const nextTarget = sections[Math.min(Math.max(targetIndex, 0), sections.length - 1)];

    if (nextTarget) {
      nextTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => scrollToSection(-1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg text-white shadow-glow backdrop-blur-sm transition-colors duration-300 hover:border-white/60 hover:bg-white hover:text-black"
        aria-label="Previous section"
      >
        ↑
      </motion.button>
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => scrollToSection(1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg text-white shadow-glow backdrop-blur-sm transition-colors duration-300 hover:border-white/60 hover:bg-white hover:text-black"
        aria-label="Next section"
      >
        ↓
      </motion.button>
    </div>
  );
}
