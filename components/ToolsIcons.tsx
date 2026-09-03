"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/Button";

type Tool = {
  id: string;
  name: string;
  icon_url?: string | null;
};

type ToolsIconsProps = {
  tools: Tool[];
  ctaText: string;
};

const monochromeIconClassName = "h-8 w-8 object-contain grayscale brightness-0 invert shrink-0";

const brandIconMap: Record<string, { icon: React.ReactNode; label: string }> = {
  Photoshop: { icon: <Image src="/icons/adobephotoshop.svg" alt="Photoshop" width={42} height={42} className={monochromeIconClassName} />, label: "Photoshop" },
  "Adobe Photoshop": { icon: <Image src="/icons/adobephotoshop.svg" alt="Photoshop" width={42} height={42} className={monochromeIconClassName} />, label: "Photoshop" },
  "Adobe Premiere Pro": { icon: <Image src="/icons/adobepremierepro.svg" alt="Premiere Pro" width={42} height={42} className={monochromeIconClassName} />, label: "Premiere Pro" },
  "Premiere Pro": { icon: <Image src="/icons/adobepremierepro.svg" alt="Premiere Pro" width={42} height={42} className={monochromeIconClassName} />, label: "Premiere Pro" },
  Canva: { icon: <Image src="/icons/canva.svg" alt="Canva" width={42} height={42} className={monochromeIconClassName} />, label: "Canva" },
  CapCut: { icon: <Image src="/icons/capcut.svg" alt="CapCut" width={42} height={42} className={monochromeIconClassName} />, label: "CapCut" },
  ElevenLabs: { icon: <Image src="/icons/elevenlabs.svg" alt="ElevenLabs" width={42} height={42} className={monochromeIconClassName} />, label: "ElevenLabs" },
  Higgsfield: { icon: <Image src="/icons/higgsfield.svg" alt="Higgsfield" width={42} height={42} className={monochromeIconClassName} />, label: "Higgsfield" },
};

export function ToolsIcons({ tools, ctaText }: ToolsIconsProps) {
  return (
    <section data-scroll-section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Tools</p>
        <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-white">Built for performance creative</h2>
      </motion.div>
      <div className="mb-10 flex flex-wrap gap-5 justify-center items-stretch">
        {tools.map((tool, index) => {
          const localIconUrl = tool.icon_url && /^\/?(?:.*\/)?[^\s]+\.(svg|png|jpg|jpeg|webp)$/i.test(tool.icon_url) ? tool.icon_url : null;
          const icon = brandIconMap[tool.name] ?? {
            icon: localIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={localIconUrl}
                alt={tool.name}
                className="h-8 w-8 shrink-0 object-contain grayscale brightness-0 invert"
                loading="lazy"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-black text-white">{tool.name.slice(0, 1).toUpperCase()}</span>
            ),
            label: tool.name,
          };

          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 flex h-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_20px_rgba(255,255,255,0.04)] min-w-0"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center">{icon.icon}</div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">{icon.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10 text-center shadow-glow"
      >
        <p className="mx-auto max-w-2xl text-lg leading-8 text-white/75">{ctaText}</p>
        <div className="mt-6">
          <Button href="/contact" variant="dark" className="border-white/30 bg-black">Let&apos;s Work Together</Button>
        </div>
      </motion.div>
    </section>
  );
}
