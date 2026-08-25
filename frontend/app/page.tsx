import Link from "next/link";
import { FeaturedWorks } from "@/components/FeaturedWorks";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { ScrollSectionNav } from "@/components/ScrollSectionNav";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { ToolsIcons } from "@/components/ToolsIcons";
import { createServerSupabaseClient } from "@/lib/serverSupabaseClient";

async function getHomePageData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      heroTitle: "Direct-Response Video Ads Editor",
      heroSubtitle: "UGC • VSL • B-Roll • AI Creatives",
      heroDescription:
        "I build performance-first video ads and creative systems that grab attention, build trust, and drive action.",
      introText: "Hey, I'm Ley...",
      services: [
        { title: "Direct-Response Ads", description: "High-converting ad edits built to hook attention and move buyers." },
        { title: "UGC & VSL", description: "Short-form and long-form storytelling designed for trust and performance." },
        { title: "AI Creatives", description: "Fast-turnaround concepts, motion assets, and AI-assisted finishing." },
        { title: "B-Roll & Motion", description: "Clean visual polish, motion layers, and product storytelling that elevates the message." },
      ],
      tools: [
        { id: "1", name: "Photoshop" },
        { id: "2", name: "Premiere Pro" },
        { id: "3", name: "CapCut" },
        { id: "4", name: "Canva" },
      ],
      featuredProjects: [
        { id: "1", title: "Project 01 - AI + UGC Ad", category: "AI + UGC", tags: ["AI Video", "UGC", "Editing"], video_url: "https://example.com/video-1.mp4", thumbnail_url: null },
        { id: "2", title: "Project 02 - B-Roll + VO", category: "B-Roll + VO", tags: ["B-Roll", "VO", "Motion"], video_url: "https://example.com/video-2.mp4", thumbnail_url: null },
      ],
      toolsCtaText: "I turn attention into action with creative that sells.",
    };
  }

  try {
    const [contentResult, servicesResult, toolsResult, featuredProjectsResult] = await Promise.all([
      supabase.from("site_content").select("section_key, content_json"),
      supabase.from("services").select("*").order("display_order"),
      supabase.from("tools").select("*").order("display_order").limit(8),
      supabase.from("projects").select("*").eq("is_featured", true).order("display_order").limit(2),
    ]);

    type SiteContentRow = { section_key: string; content_json: Record<string, unknown> };
    type ServiceRow = { title: string; description: string };
    type ToolRow = { id: string; name: string; icon_url?: string | null };
    type ProjectRow = { id: string; title: string; category: string; tags?: string[]; video_url: string; thumbnail_url?: string | null };

    const contentMap = new Map<string, Record<string, unknown>>(
      ((contentResult.data ?? []) as SiteContentRow[]).map((entry) => [entry.section_key, entry.content_json])
    );

    const hero = (contentMap.get("hero") ?? {}) as Record<string, unknown>;
    const intro = (contentMap.get("intro") ?? {}) as Record<string, unknown>;
    const toolsCta = (contentMap.get("tools_cta") ?? {}) as Record<string, unknown>;
    const aboutIntro = (contentMap.get("about_intro") ?? {}) as Record<string, unknown>;

    const heroTitle = typeof hero.title === "string" ? hero.title : "Direct-Response Video Ads Editor";
    const heroSubtitle = typeof hero.subtitle === "string" ? hero.subtitle : "UGC • VSL • B-Roll • AI Creatives";
    const heroDescription =
      typeof hero.description === "string"
        ? hero.description
        : "I build performance-first video ads and creative systems that grab attention, build trust, and drive action.";

    return {
      heroTitle,
      heroSubtitle,
      heroDescription,
      profilePhotoUrl: typeof aboutIntro.photo_url === "string" ? aboutIntro.photo_url : null,
      introText: typeof intro.text === "string" ? intro.text : "Hey, I'm Ley...",
      services: ((servicesResult.data ?? []) as ServiceRow[]).map((service) => ({
        title: service.title,
        description: service.description,
      })),
      tools: ((toolsResult.data ?? []) as ToolRow[]).map((tool) => ({
        id: tool.id,
        name: tool.name,
        icon_url: tool.icon_url,
      })),
      featuredProjects: ((featuredProjectsResult.data ?? []) as ProjectRow[]).map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        tags: project.tags ?? [],
        video_url: project.video_url,
        thumbnail_url: project.thumbnail_url,
      })),
      toolsCtaText: typeof toolsCta.text === "string" ? toolsCta.text : "I turn attention into action with creative that sells.",
    };
  } catch (error) {
    console.error("Failed to load home page data:", error);
    return {
      heroTitle: "Direct-Response Video Ads Editor",
      heroSubtitle: "UGC • VSL • B-Roll • AI Creatives",
      heroDescription:
        "I build performance-first video ads and creative systems that grab attention, build trust, and drive action.",
      introText: "Hey, I'm Ley...",
      services: [
        { title: "Direct-Response Ads", description: "High-converting ad edits built to hook attention and move buyers." },
        { title: "UGC & VSL", description: "Short-form and long-form storytelling designed for trust and performance." },
        { title: "AI Creatives", description: "Fast-turnaround concepts, motion assets, and AI-assisted finishing." },
        { title: "B-Roll & Motion", description: "Clean visual polish, motion layers, and product storytelling that elevates the message." },
      ],
      tools: [
        { id: "1", name: "Photoshop" },
        { id: "2", name: "Premiere Pro" },
        { id: "3", name: "CapCut" },
        { id: "4", name: "Canva" },
      ],
      featuredProjects: [
        { id: "1", title: "Project 01 - AI + UGC Ad", category: "AI + UGC", tags: ["AI Video", "UGC", "Editing"], video_url: "https://example.com/video-1.mp4", thumbnail_url: null },
        { id: "2", title: "Project 02 - B-Roll + VO", category: "B-Roll + VO", tags: ["B-Roll", "VO", "Motion"], video_url: "https://example.com/video-2.mp4", thumbnail_url: null },
      ],
      toolsCtaText: "I turn attention into action with creative that sells.",
    };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="bg-black text-white">
      <Hero title={data.heroTitle} subtitle={data.heroSubtitle} description={data.heroDescription} profilePhotoUrl={data.profilePhotoUrl} />
      <Reveal>
        <section data-scroll-section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Quick intro</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-white">{data.introText}</h2>
          </div>
          <div className="flex justify-center">
            <Button href="/about" variant="dark" className="border-white/30 bg-black">Learn More About Me</Button>
          </div>
        </section>
      </Reveal>
      <section data-scroll-section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">What I do</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-white">Creative support that performs</h2>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.services.map((service, index) => (
            <ServiceCard key={service.title} title={service.title} description={service.description} index={index} />
          ))}
        </div>
      </section>
      <FeaturedWorks projects={data.featuredProjects} />
      <ToolsIcons tools={data.tools} ctaText={data.toolsCtaText} />
      <ScrollSectionNav />
    </main>
  );
}
