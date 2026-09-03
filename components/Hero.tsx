"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/Button";

const heroWords = ["Direct", "Response", "Video", "Ads", "Editor"];

type HeroProps = {
  title: string;
  subtitle: string;
  description: string;
  profilePhotoUrl?: string | null;
};

import { getCloudinaryBackgroundRemovedUrl } from "@/lib/cloudinary";
import HeroCampaignVisual from "./HeroCampaignVisual";

export function Hero({ title, subtitle, description, profilePhotoUrl }: HeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section data-scroll-section className="relative isolate overflow-hidden bg-black">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          animate={reduceMotion ? {} : { x: [0, 60, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"
          animate={reduceMotion ? {} : { x: [0, -50, 0], y: [0, 40, 0], scale: [1.05, 1, 1.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-white/60"
          >
            {subtitle}
          </motion.p>

          <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white md:text-7xl lg:text-[6.4rem]">
            {heroWords.map((word, index) => (
              <motion.span
                key={word + index}
                className="mr-4 inline-block text-glow"
                initial={reduceMotion ? undefined : { opacity: 0, y: 24, filter: "blur(10px)" }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg leading-8 text-white/70"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button href="/portfolio" variant="dark" className="border-white/30 bg-black">View My Work</Button>
            <Button href="/contact" variant="dark" className="border-white/30 bg-black">Contact Me</Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Use the extracted HeroCampaignVisual component */}
          <HeroCampaignVisual profilePhotoUrl={profilePhotoUrl} className="w-full max-w-[340px] md:max-w-[370px] lg:max-w-[420px]" />
        </motion.div>
      </div>
    </section>
  );
}
