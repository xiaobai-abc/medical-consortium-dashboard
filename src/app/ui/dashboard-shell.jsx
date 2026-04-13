/**
 * 大屏首页骨架，仅保留顶部信息栏，主体内容留空给后续模块接入。
 */
export default function DashboardShell({ title, statusText }) {
  return (
    <main className="screen-grid-bg min-h-screen overflow-hidden bg-[#031525] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col px-8 py-8">
        <header className="screen-panel-glow rounded-[32px] border border-cyan-400/16 bg-slate-950/72 px-10 py-7">
          <h1 className="text-center text-[42px] font-semibold tracking-[0.12em] text-white">
            {title}
          </h1>
          <div className="flex items-center justify-center pt-4">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
            <p className="pl-3 text-center text-base tracking-[0.04em] text-cyan-50/88">
              {statusText}
            </p>
          </div>
        </header>
        <section className="flex-1 pt-8" />
      </div>
    </main>
  );
}
