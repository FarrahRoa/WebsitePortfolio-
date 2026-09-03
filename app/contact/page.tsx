import { createServerSupabaseClient } from "@/lib/serverSupabaseClient";

async function getContactData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      description:
        "If you need a direct-response editor to shape ads, UGC, and creative assets for performance marketing, let’s talk.",
      email: "hello@leycreative.com",
      phone: "+1 (555) 123-4567",
      linkedin: "https://www.linkedin.com/in/ley",
    };
  }

  try {
    const { data } = await supabase.from("contact_info").select("*").limit(1).maybeSingle();

    return {
      description:
        "If you need a direct-response editor to shape ads, UGC, and creative assets for performance marketing, let’s talk.",
      email: data?.email ?? "hello@leycreative.com",
      phone: data?.phone ?? "+1 (555) 123-4567",
      linkedin: data?.linkedin_url ?? "https://www.linkedin.com/in/ley",
    };
  } catch (error) {
    console.error("Failed to load contact data:", error);
    return {
      description:
        "If you need a direct-response editor to shape ads, UGC, and creative assets for performance marketing, let’s talk.",
      email: "hello@leycreative.com",
      phone: "+1 (555) 123-4567",
      linkedin: "https://www.linkedin.com/in/ley",
    };
  }
}

export default async function ContactPage() {
  const data = await getContactData();

  // ensure values exist to avoid runtime split errors
  const email = data.email ?? "";
  const [emailLocal, emailDomain] = email.includes("@") ? email.split("@") : [email, ""];

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-600">Contact</p>
        <h1 className="mt-3 text-4xl font-bold text-neutral-900">Let&apos;s Work Together</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">{data.description}</p>

        <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch">
          <div className="min-w-0 flex h-full flex-col justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600">Email</p>
            <a
              href={`mailto:${data.email}`}
              className="mt-3 block max-w-full text-[13px] font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 leading-5"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word", display: "block" }}
            >
              {emailLocal}
              <wbr />
              {emailDomain ? <span>@{emailDomain}</span> : null}
            </a>
          </div>

          <div className="min-w-0 flex h-full flex-col justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600">LinkedIn</p>
            <a
              href={data.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block max-w-full text-[13px] font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 leading-5"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word", display: "block" }}
            >
              View profile
            </a>
          </div>

          <div className="min-w-0 flex h-full flex-col justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600">Phone</p>
            <a
              href={`tel:${data.phone}`}
              className="mt-3 block max-w-full text-[13px] font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 leading-5"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word", display: "block" }}
            >
              {data.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
