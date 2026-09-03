export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 rounded bg-neutral-100 animate-pulse" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-20 rounded bg-neutral-100 animate-pulse" />
          <div className="h-20 rounded bg-neutral-100 animate-pulse" />
          <div className="h-20 rounded bg-neutral-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
