export default function LoadingRoot() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm text-white/70">Loading…</p>
      </div>
    </div>
  );
}
