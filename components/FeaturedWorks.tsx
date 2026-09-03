"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ProjectCard";

type FeaturedWorksProps = {
  projects: Array<{
    id: string;
    title: string;
    category: string;
    tags: string[];
    video_url: string;
    thumbnail_url?: string | null;
  }>;
};

export function FeaturedWorks({ projects }: FeaturedWorksProps) {
  return (
    <section data-scroll-section className="bg-[#050505] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex items-end justify-between gap-4"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Featured work</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-white">Selected wins</h2>
          </div>
          <Link href="/portfolio" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white">
            View All Work
          </Link>
        </motion.div>
        <div className="grid gap-8 lg:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
