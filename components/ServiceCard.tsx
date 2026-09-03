"use client";

import { motion } from "framer-motion";

type ServiceCardProps = {
  title: string;
  description: string;
  index?: number;
};

export function ServiceCard({ title, description, index = 0 }: ServiceCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="rounded-[1.75rem] border border-white/10 bg-white/3 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-white/25 hover:bg-white/8"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg font-black text-white">
        {title.charAt(0)}
      </div>
      <h3 className="mb-3 text-xl font-bold uppercase tracking-[-0.03em] text-white">{title}</h3>
      <p className="text-sm leading-6 text-white/65">{description}</p>
    </motion.article>
  );
}
