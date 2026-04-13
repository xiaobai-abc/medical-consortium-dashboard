import Link from "next/link";

/**
 * 统一 404 页面，保持与大屏首页一致的视觉基调。
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#031525] px-8 py-8 text-white">
      <section className="w-full max-w-[720px] rounded-[32px] border border-cyan-400/16 bg-slate-950/72 p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.36em] text-cyan-200/80">
          Not Found
        </p>
        <h1 className="pt-5 text-4xl font-semibold tracking-[0.08em]">
          页面不存在
        </h1>
        <p className="pt-5 text-base leading-8 text-slate-300">
          当前访问地址未匹配到可用页面，你可以先返回首页继续初始化大屏模块。
        </p>
        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/26 bg-cyan-400/12 px-6 text-sm font-medium text-cyan-50 transition-colors hover:bg-cyan-400/20"
          >
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}
