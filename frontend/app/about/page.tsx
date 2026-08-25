import Link from "next/link";
import Image from "next/image";
import { SkillsList } from "@/components/SkillsList";
import { createServerSupabaseClient } from "@/lib/serverSupabaseClient";
import { Button } from "@/components/Button";

async function getAboutPageData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      introduction:
        "I help brands and founders turn rough ideas into high-performing video ads that feel native, clear, and conversion-focused.",
      differentiators: [
        "Performance-focused editing built for direct-response outcomes.",
        "Fast-turnaround creative without sacrificing clarity or emotion.",
        "Strong storytelling across UGC, VSL, and ad creative formats.",
        "Creative systems designed to test and iterate quickly.",
        "Clear communication from brief to final delivery.",
      ],
      categories: {
        video_editing: ["Hook-first cuts", "Pacing & timing", "Sound design", "Story arc editing"],
        ai_creative: ["AI-assisted concepts", "Generative motion", "Creative testing", "Performance loops"],
        software_tools: ["Premiere Pro", "After Effects", "CapCut", "Photoshop", "Canva"],
      },
    };
  }

  try {
    const [contentResult, skillsResult] = await Promise.all([
      supabase.from("site_content").select("section_key, content_json"),
      supabase.from("skills").select("*").order("display_order"),
    ]);

    type SiteContentRow = { section_key: string; content_json: Record<string, unknown> };
    type SkillRow = { category: "video_editing" | "ai_creative" | "software_tools"; skill_name: string };

    const contentMap = new Map<string, Record<string, unknown>>(
      ((contentResult.data ?? []) as SiteContentRow[]).map((entry) => [entry.section_key, entry.content_json])
    );

    const aboutIntro = (contentMap.get("about_intro") ?? {}) as Record<string, unknown>;
    const differentiators = (contentMap.get("about_differentiators") as string[] | undefined) ?? [
      "Performance-focused editing built for direct-response outcomes.",
      "Fast-turnaround creative without sacrificing clarity or emotion.",
      "Strong storytelling across UGC, VSL, and ad creative formats.",
      "Creative systems designed to test and iterate quickly.",
      "Clear communication from brief to final delivery.",
    ];

    const categories = {
      video_editing: ((skillsResult.data ?? []) as SkillRow[])
        .filter((skill) => skill.category === "video_editing")
        .map((skill) => skill.skill_name),
      ai_creative: ((skillsResult.data ?? []) as SkillRow[])
        .filter((skill) => skill.category === "ai_creative")
        .map((skill) => skill.skill_name),
      software_tools: ((skillsResult.data ?? []) as SkillRow[])
        .filter((skill) => skill.category === "software_tools")
        .map((skill) => skill.skill_name),
    };

    return {
      introduction:
        typeof aboutIntro.text === "string"
          ? aboutIntro.text
          : "I help brands and founders turn rough ideas into high-performing video ads that feel native, clear, and conversion-focused.",
      profile_photo_url: typeof aboutIntro.photo_url === "string" ? (aboutIntro.photo_url as string) : null,
      differentiators,
      categories,
    };
  } catch (error) {
    console.error("Failed to load about page data:", error);
    return {
      introduction:
        "I help brands and founders turn rough ideas into high-performing video ads that feel native, clear, and conversion-focused.",
      differentiators: [
        "Performance-focused editing built for direct-response outcomes.",
        "Fast-turnaround creative without sacrificing clarity or emotion.",
        "Strong storytelling across UGC, VSL, and ad creative formats.",
        "Creative systems designed to test and iterate quickly.",
        "Clear communication from brief to final delivery.",
      ],
      categories: {
        video_editing: ["Hook-first cuts", "Pacing & timing", "Sound design", "Story arc editing"],
        ai_creative: ["AI-assisted concepts", "Generative motion", "Creative testing", "Performance loops"],
        software_tools: ["Premiere Pro", "After Effects", "CapCut", "Photoshop", "Canva"],
      },
    };
  }
}

export default async function AboutPage() {
  const data = await getAboutPageData();

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_160px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">About me</p>
          <h1 className="mt-3 text-4xl font-bold text-white">I build direct-response creative that sells.</h1>
        </div>
        <div className="hidden items-center justify-end lg:flex">
          {data.profile_photo_url ? (
            // using next/image for optimized loading
            <Image src={data.profile_photo_url} alt="Ley - Direct-Response Video Ads Editor" width={160} height={160} className="h-40 w-40 rounded-full object-cover grayscale" />
          ) : null}
        </div>
      </div>

      <section className="flex flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-sm text-neutral-900">
          <p className="text-lg leading-8 text-neutral-900">{data.introduction}</p>
        </div>
        <div className="rounded-3xl bg-panel p-8 text-white shadow-lg">
          <h2 className="text-2xl font-semibold text-white">What makes me different</h2>
          <ul className="mt-6 space-y-3 text-white/75">
            {data.differentiators.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-white" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Skills & tools</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <SkillsList title="Video Editing" skills={data.categories.video_editing} />
          <SkillsList title="AI & Creative" skills={data.categories.ai_creative} />
          <SkillsList title="Software & Tools" skills={data.categories.software_tools} />
        </div>
      </section>

      <div className="mt-12 flex justify-center">
        <Button href="/portfolio" variant="dark" className="border-white/30 bg-black">View My Work</Button>
      </div>
    </main>
  );
}
