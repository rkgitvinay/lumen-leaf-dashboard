export default function DemoBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span className="text-[10px] font-semibold tracking-wider text-amber-500 uppercase">Demo Mode</span>
    </div>
  );
}
