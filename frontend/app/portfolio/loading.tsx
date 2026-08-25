export default function PortfolioLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="h-8 w-64 rounded bg-white/10 animate-pulse" />
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="h-40 rounded bg-white/5 animate-pulse" />
        <div className="h-40 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}
