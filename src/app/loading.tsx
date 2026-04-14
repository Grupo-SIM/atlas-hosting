export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#0a0e27] overflow-hidden">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="h-20 flex items-center justify-between animate-pulse">
          <div className="h-10 w-40 rounded-md bg-white/15" />
          <div className="hidden md:flex items-center gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-16 rounded bg-white/15" />
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-24 rounded-full bg-white/15" />
            <div className="h-9 w-28 rounded-full bg-white/25" />
          </div>
          <div className="h-9 w-9 rounded-full bg-white/15 md:hidden" />
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-6 md:px-8 pb-12 animate-pulse">
        <div className="mb-4 h-12 w-full rounded-lg bg-white/15" />
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1433] p-6 md:p-10">
          <div className="h-10 w-3/5 rounded bg-white/20 mb-4" />
          <div className="h-4 w-2/3 rounded bg-white/15 mb-2" />
          <div className="h-4 w-1/2 rounded bg-white/15 mb-8" />
          <div className="h-10 w-40 rounded-md bg-white/25" />
          <div className="mt-10 h-[260px] w-full rounded-xl bg-white/10 md:h-[380px]" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1280px] space-y-10 px-6 pb-16 md:px-8">
        <section className="animate-pulse">
          <div className="mb-5 h-8 w-56 rounded bg-white/20" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3"
              >
                <div className="h-5 w-2/3 rounded bg-white/20" />
                <div className="h-3 w-full rounded bg-white/15" />
                <div className="h-3 w-4/5 rounded bg-white/15" />
              </div>
            ))}
          </div>
        </section>

        <section className="animate-pulse">
          <div className="mb-5 h-8 w-40 rounded bg-white/20" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="h-8 w-16 rounded bg-white/20 mb-3" />
                <div className="h-3 w-full rounded bg-white/15" />
              </div>
            ))}
          </div>
        </section>

        <section className="animate-pulse">
          <div className="mb-5 h-8 w-44 rounded bg-white/20" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
              >
                <div className="h-6 w-2/3 rounded bg-white/20" />
                <div className="h-3 w-full rounded bg-white/15" />
                <div className="h-3 w-5/6 rounded bg-white/15" />
                <div className="h-9 w-28 rounded-md bg-white/20" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8 py-10 animate-pulse">
          <div className="h-5 w-40 rounded bg-white/15 mb-4" />
          <div className="h-3 w-64 rounded bg-white/10" />
        </div>
      </footer>
    </div>
  );
}
