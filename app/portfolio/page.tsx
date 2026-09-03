import { PortfolioGrid } from "@/components/PortfolioGrid";
import { createServerSupabaseClient } from "@/lib/serverSupabaseClient";

async function getPortfolioPageData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      categories: [
        { name: "AI + UGC", description: "UGC-driven ads with hooks, edits, and creative testing loops." },
        { name: "B-Roll + VO", description: "Product, lifestyle, and voiceover-led storytelling that keeps attention high." },
        { name: "AI Creatives", description: "High-impact AI-assisted concepts, motion, and rapid creative iteration." },
      ],
      projects: [
        { id: "1", title: "Project 01 - AI + UGC Ad", category: "AI + UGC", tags: ["AI Video", "UGC", "ElevenLabs", "Editing"], video_url: "https://example.com/project-1.mp4", thumbnail_url: null },
        { id: "2", title: "Project 02 - B-Roll + VO Ad", category: "B-Roll + VO", tags: ["B-Roll", "VO", "Motion", "Editing"], video_url: "https://example.com/project-2.mp4", thumbnail_url: null },
        { id: "3", title: "Project 03 - AI Creatives", category: "AI Creatives", tags: ["AI Video", "Creative", "Design", "Concept"], video_url: "https://example.com/project-3.mp4", thumbnail_url: null },
      ],
    };
  }

  try {
    const [categoriesResult, projectsResult] = await Promise.all([
      supabase.from("portfolio_categories").select("*").order("display_order"),
      supabase.from("projects").select("*").order("display_order"),
    ]);

    type CategoryRow = { name: string; description: string };
    type ProjectRow = { id: string; title: string; category: string; tags?: string[]; video_url: string; thumbnail_url?: string | null };

    return {
      categories: ((categoriesResult.data ?? []) as CategoryRow[]).map((category) => ({
        name: category.name,
        description: category.description,
      })),
      projects: ((projectsResult.data ?? []) as ProjectRow[]).map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        tags: project.tags ?? [],
        video_url: project.video_url,
        thumbnail_url: project.thumbnail_url,
      })),
    };
  } catch (error) {
    console.error("Failed to load portfolio data:", error);
    return {
      categories: [
        { name: "AI + UGC", description: "UGC-driven ads with hooks, edits, and creative testing loops." },
        { name: "B-Roll + VO", description: "Product, lifestyle, and voiceover-led storytelling that keeps attention high." },
        { name: "AI Creatives", description: "High-impact AI-assisted concepts, motion, and rapid creative iteration." },
      ],
      projects: [
        { id: "1", title: "Project 01 - AI + UGC Ad", category: "AI + UGC", tags: ["AI Video", "UGC", "ElevenLabs", "Editing"], video_url: "https://example.com/project-1.mp4", thumbnail_url: null },
        { id: "2", title: "Project 02 - B-Roll + VO Ad", category: "B-Roll + VO", tags: ["B-Roll", "VO", "Motion", "Editing"], video_url: "https://example.com/project-2.mp4", thumbnail_url: null },
        { id: "3", title: "Project 03 - AI Creatives", category: "AI Creatives", tags: ["AI Video", "Creative", "Design", "Concept"], video_url: "https://example.com/project-3.mp4", thumbnail_url: null },
      ],
    };
  }
}

export default async function PortfolioPage() {
  const data = await getPortfolioPageData();

  const categories = data.categories.length
    ? data.categories
    : [
        { name: "AI + UGC", description: "UGC-driven ads with hooks, edits, and creative testing loops." },
        { name: "B-Roll + VO", description: "Product, lifestyle, and voiceover-led storytelling that keeps attention high." },
        { name: "AI Creatives", description: "High-impact AI-assisted concepts, motion, and rapid creative iteration." },
      ];

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Portfolio</p>
          <h1 className="mt-3 text-4xl font-bold text-white">A selection of direct-response ads and creative projects I&apos;ve worked on.</h1>
        </div>
      </section>
      <PortfolioGrid projects={data.projects} categories={categories} />
    </main>
  );
}
