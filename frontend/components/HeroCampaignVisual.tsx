"use client";

import React from "react";
import { getCloudinaryBackgroundRemovedUrl } from "@/lib/cloudinary";

type Props = {
  profilePhotoUrl?: string | null;
  className?: string;
};

export default function HeroCampaignVisual({ profilePhotoUrl, className = "" }: Props) {
  const bgRemoved = profilePhotoUrl ? getCloudinaryBackgroundRemovedUrl(profilePhotoUrl) ?? profilePhotoUrl : null;

  return (
    <div className={`w-full ${className} mx-auto`}>
      <div className="relative rounded-[2rem] border border-white/10 bg-white/5 shadow-glow overflow-hidden">
        {/* Main portrait canvas */}
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
          <div className="relative aspect-[4/5] bg-black">
            {bgRemoved ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgRemoved}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_20%] grayscale contrast-110 opacity-95"
                style={{ pointerEvents: "none" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/6 to-white/2 text-white/60"> 
                {/* Placeholder artwork */}
                <div className="text-sm font-semibold uppercase tracking-wider">Campaign Preview</div>
              </div>
            )}

            {/* Top-right ROAS badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                +3.8x ROAS
              </span>
            </div>

            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 z-0 pointer-events-none">
              <div className="h-full bg-gradient-to-t from-black via-black/65 to-transparent" />
            </div>

            {/* Campaign info (above gradient) */}
            <div className="absolute bottom-3 left-3 z-10">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-white/60">Campaign</p>
              <p className="mt-1 text-2xl font-black uppercase tracking-[-0.05em] text-white">Conversion Lift</p>
            </div>
          </div>
        </div>

        {/* Category controls */}
        <div className="mt-4 grid grid-cols-3 gap-3 px-4 pb-4">
          {['UGC','VSL','AI'].map((tag) => (
            <div key={tag} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
