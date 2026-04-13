/**
 * 全局加载态，提供大屏风格的骨架屏占位。
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#031525] px-8 py-8 text-white">
      <section className="mx-auto max-w-[1920px] animate-pulse rounded-[32px] border border-white/8 bg-slate-950/72 p-8">
        <div className="h-8 w-56 rounded-full bg-white/10" />
        <div className="h-14 w-[520px] rounded-full bg-white/10 pt-0" />
        <div className="flex flex-col pt-6 xl:flex-row">
          <div className="w-full rounded-[28px] border border-white/8 bg-white/6 p-6 xl:w-1/4 xl:pr-4">
            <div className="h-4 w-20 rounded-full bg-white/10" />
            <div className="h-10 w-28 rounded-full bg-white/10 pt-0" />
          </div>
          <div className="w-full pt-4 xl:w-1/4 xl:pr-4 xl:pt-0">
            <div className="rounded-[28px] border border-white/8 bg-white/6 p-6">
              <div className="h-4 w-20 rounded-full bg-white/10" />
              <div className="h-10 w-28 rounded-full bg-white/10 pt-0" />
            </div>
          </div>
          <div className="w-full pt-4 xl:w-1/4 xl:pr-4 xl:pt-0">
            <div className="rounded-[28px] border border-white/8 bg-white/6 p-6">
              <div className="h-4 w-20 rounded-full bg-white/10" />
              <div className="h-10 w-28 rounded-full bg-white/10 pt-0" />
            </div>
          </div>
          <div className="w-full pt-4 xl:w-1/4 xl:pt-0">
            <div className="rounded-[28px] border border-white/8 bg-white/6 p-6">
              <div className="h-4 w-20 rounded-full bg-white/10" />
              <div className="h-10 w-28 rounded-full bg-white/10 pt-0" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
