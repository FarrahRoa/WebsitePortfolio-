"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, useRef } from "react";

type VideoPlayerProps = {
  src: string;
  title: string;
  thumbnail?: string;
};

function getVideoEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

    if (hostname === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = url.searchParams.get("v");
      if (url.pathname === "/watch" && videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
      if (url.pathname.startsWith("/embed/") && url.pathname.split("/")[2]) {
        return `https://www.youtube-nocookie.com/embed/${url.pathname.split("/")[2]}`;
      }
      return null;
    }

    if (hostname === "vimeo.com") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const id = pathParts[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (hostname.endsWith("res.cloudinary.com") || hostname.endsWith("cloudinary.com")) {
      return rawUrl;
    }

    return null;
  } catch {
    return null;
  }
}

export function VideoPlayer({ src, title, thumbnail }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = useMemo(() => getVideoEmbedUrl(src), [src]);
  const isExternalEmbed = Boolean(embedUrl && (embedUrl.includes("youtube-nocookie.com") || embedUrl.includes("player.vimeo.com")));

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  function handleLoadedMetadata(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget as HTMLVideoElement;
    const w = v.videoWidth || 0;
    const h = v.videoHeight || 0;
    const ratio = w && h ? `${w} / ${h}` : null;
    // Development logging to verify dimensions
    // eslint-disable-next-line no-console
    console.log('Video loadedmetadata:', { src, width: w, height: h, ratio });

    if (ratio) {
      setAspectRatio(ratio);
      // eslint-disable-next-line no-console
      console.log('Video aspectRatio state set:', ratio);
    }
  }

  function handleMediaError(e?: any) {
    // eslint-disable-next-line no-console
    console.warn('Video metadata/load error for', src, e);
  }

  // Apply aspect-ratio style only when measured; no fallback 16/9 to avoid forcing landscape
  const wrapperStyle: React.CSSProperties | undefined = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div className="group relative w-full overflow-hidden bg-black rounded-t-md" style={wrapperStyle}>
      {/* Native video is mounted immediately (preload metadata) so we can read intrinsic dimensions early */}
      {!isExternalEmbed ? (
        <video
          ref={videoRef}
          src={src}
          title={title}
          controls
          preload="metadata"
          className="block w-full h-auto object-contain bg-black"
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleMediaError}
        />
      ) : null}

      <AnimatePresence mode="wait">
        {!isPlaying || isExternalEmbed ? (
          <motion.div
            key="thumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {isExternalEmbed ? (
              <iframe
                title={title || "Video preview"}
                src={embedUrl ?? ""}
                className="h-full w-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <>
                {thumbnail ? (
                  <Image src={thumbnail} alt={title} fill className="object-contain transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black" />
                )}
                <div className="absolute inset-0 bg-black/20" />

                <motion.button
                  type="button"
                  aria-label={`Play ${title}`}
                  onClick={() => {
                    try {
                      const v = videoRef.current;
                      if (v) {
                        const p = v.play();
                        Promise.resolve(p).catch(() => {});
                      }
                    } catch (err) {
                      // ignore
                    }
                    setIsPlaying(true);
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-xl text-white backdrop-blur-md"
                >
                  ▶
                </motion.button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
