"use client";

import { motion } from "framer-motion";
import { VideoPlayer } from "@/components/VideoPlayer";

export type DisplayProject = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  video_url: string;
  thumbnail_url?: string | null;
};

type ProjectCardProps = {
  project: DisplayProject;
  index?: number;
};

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.01 }}
      className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.04)]"
    >
      <VideoPlayer src={project.video_url} title={project.title} thumbnail={project.thumbnail_url ?? undefined} />
      <div className="p-5">
        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/75">
          {project.category}
        </span>
        <h3 className="mt-4 text-2xl font-black uppercase tracking-[-0.04em] text-white">{project.title}</h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
