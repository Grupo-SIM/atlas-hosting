export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-slate-50 overflow-hidden">
      {/* Header Skeleton */}
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="h-20 flex items-center justify-between animate-pulse">
          <div className="h-10 w-40 rounded-md bg-slate-200" />
          <div className="hidden md:flex items-center gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-16 rounded bg-slate-200" />
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-24 rounded-full bg-slate-200" />
            <div className="h-9 w-28 rounded-full bg-slate-300" />
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-200 md:hidden" />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-6 md:px-8 pb-12 animate-pulse">
        <div className="mb-4 h-12 w-full rounded-lg bg-slate-200/50" />
        {/* Main Section Card Skeleton */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm">
          <div className="h-10 w-3/5 rounded bg-slate-200 mb-4" />
          <div className="h-4 w-2/3 rounded bg-slate-100 mb-2" />
          <div className="h-4 w-1/2 rounded bg-slate-100 mb-8" />
          <div className="h-10 w-40 rounded-md bg-slate-200" />
          <div className="mt-10 h-[260px] w-full rounded-xl bg-slate-50 md:h-[380px] border border-slate-100" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1280px] space-y-10 px-6 pb-16 md:px-8">
        {/* Grid Section 1 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-56 rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm"
              >
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Section 2 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-40 rounded bg-slate-200" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-8 w-16 rounded bg-slate-200 mb-3" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Section 3 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-44 rounded bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm"
              >
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
                <div className="h-9 w-28 rounded-md bg-slate-200" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/50">
        <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8 py-10 animate-pulse">
          <div className="h-5 w-40 rounded bg-slate-200 mb-4" />
          <div className="h-3 w-64 rounded bg-slate-100" />
        </div>
      </footer>
    </div>
  );
}
