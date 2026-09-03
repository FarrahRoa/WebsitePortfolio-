"use client";

import { motion } from "framer-motion";
import { ProjectCard, type DisplayProject } from "@/components/ProjectCard";

type PortfolioGridProps = {
  projects: DisplayProject[];
  categories: Array<{ name: string; description: string }>;
};

export function PortfolioGrid({ projects, categories }: PortfolioGridProps) {
  return (
    <section data-scroll-section className="mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Portfolio</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-white">A selection of direct-response ads and creative projects</h2>
        </div>
      </motion.div>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
          >
            <h3 className="text-xl font-black uppercase tracking-[-0.04em] text-white">{category.name}</h3>
            <p className="mt-2 text-sm leading-6 text-white/65">{category.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
