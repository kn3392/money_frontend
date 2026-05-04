export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] ${className}`}
    />
  );
}

export default function LoadingSkeletonLedger() {
  return (
    <div className="mx-auto mt-8 max-w-6xl space-y-4 px-4">
      <SkeletonLine className="h-12 w-full" />
      <div className="grid gap-4 sm:grid-cols-4">
        <SkeletonLine className="h-24" />
        <SkeletonLine className="h-24" />
        <SkeletonLine className="h-24" />
        <SkeletonLine className="h-24" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonLine className="h-72" />
        <SkeletonLine className="h-72" />
      </div>
    </div>
  );
}
