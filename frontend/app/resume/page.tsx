import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/serverSupabaseClient";
import { Button } from "@/components/Button";

async function getResumeData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      description:
        "I edit direct-response video ads and creative content designed to capture attention, build trust, and move buyers toward action.",
      fileUrl: "https://example.com/ley-resume.pdf",
    };
  }

  try {
    const { data } = await supabase.from("resume").select("*").limit(1).maybeSingle();

    return {
      description:
        "I edit direct-response video ads and creative content designed to capture attention, build trust, and move buyers toward action.",
      fileUrl: data?.file_url ?? "https://example.com/ley-resume.pdf",
    };
  } catch (error) {
    console.error("Failed to load resume data:", error);
    return {
      description:
        "I edit direct-response video ads and creative content designed to capture attention, build trust, and move buyers toward action.",
      fileUrl: "https://example.com/ley-resume.pdf",
    };
  }
}

export default async function ResumePage() {
  const data = await getResumeData();

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm text-neutral-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-600">Resume</p>
        <h1 className="mt-3 text-4xl font-bold text-neutral-900">Experience and creative work</h1>
        <p className="mt-6 text-lg leading-8 text-neutral-700">{data.description}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button href={data.fileUrl} external anchorProps={{ target: "_blank", rel: "noreferrer" }} variant="light">View Resume</Button>
          <Button href={data.fileUrl} external anchorProps={{ download: true }} variant="light">Download Resume</Button>
        </div>
      </div>
    </main>
  );
}
