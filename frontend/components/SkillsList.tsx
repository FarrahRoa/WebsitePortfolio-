"use client";

import { motion } from "framer-motion";

type SkillGroupProps = {
  title: string;
  skills: string[];
};

export function SkillsList({ title, skills }: SkillGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_20px_rgba(255,255,255,0.04)]"
    >
      <h3 className="mb-4 text-xl font-black uppercase tracking-[-0.04em] text-white">{title}</h3>
      <ul className="space-y-3 text-white/70">
        {skills.map((skill, index) => (
          <motion.li
            key={skill}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="text-white/85">{skill}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
