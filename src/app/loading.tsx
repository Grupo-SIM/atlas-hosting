export default function Loading() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-atlas-dark-1">
      {/* Background Gradient */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-landing-gradient opacity-40" />

      {/* Header Skeleton */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="flex h-20 animate-pulse items-center justify-between">
          <div className="h-10 w-40 rounded-md bg-white/10" />
          <div className="hidden items-center gap-5 md:flex">
            {[...Array(5)].map((_, i) => (
              <div className="h-4 w-16 rounded bg-white/5" key={i} />
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-9 w-24 rounded-full bg-white/5" />
            <div className="h-9 w-28 rounded-full bg-white/10" />
          </div>
          <div className="h-9 w-9 rounded-full bg-white/5 md:hidden" />
        </div>
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[1280px] animate-pulse px-6 pb-12 md:px-8">
        <div className="mb-4 h-12 w-full rounded-lg bg-white/5" />
        {/* Main Section Card Skeleton */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
          <div className="mb-4 h-10 w-3/5 rounded bg-white/10" />
          <div className="mb-2 h-4 w-2/3 rounded bg-white/5" />
          <div className="mb-8 h-4 w-1/2 rounded bg-white/5" />
          <div className="h-10 w-40 rounded-md bg-white/10" />
          <div className="mt-10 h-[260px] w-full rounded-xl border border-white/5 bg-white/[0.02] md:h-[380px]" />
        </div>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-[1280px] space-y-10 px-6 pb-16 md:px-8">
        {/* Grid Section 1 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-56 rounded bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-sm"
                key={i}
              >
                <div className="h-5 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-4/5 rounded bg-white/5" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Section 2 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-40 rounded bg-white/10" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur-sm"
                key={i}
              >
                <div className="mb-3 h-8 w-16 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
            ))}
          </div>
        </section>

        {/* Grid Section 3 */}
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-44 rounded bg-white/10" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm"
                key={i}
              >
                <div className="h-6 w-2/3 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-5/6 rounded bg-white/5" />
                <div className="h-9 w-28 rounded-md bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-white/10 border-t bg-black/20">
        <div className="mx-auto w-full max-w-[1280px] animate-pulse px-6 py-10 md:px-8">
          <div className="mb-4 h-5 w-40 rounded bg-white/10" />
          <div className="h-3 w-64 rounded bg-white/5" />
        </div>
      </footer>
    </div>
  );
}
