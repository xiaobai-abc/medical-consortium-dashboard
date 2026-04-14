/**
 * 大屏顶部标题栏组件，负责展示标题和系统状态信息。
 */
export default function ScreenHeader({ title, statusText }) {
  return (
    <header className="screen-panel-glow rounded-[20px] border border-cyan-400/16 bg-slate-950/72 h-[82px] flex flex-col justify-center mb-3">
      <h1 className="text-center text-[26px] text-[#E8F0FF] font-bold">
        {title}
      </h1>
      <div className="flex items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
        <p className="pl-3 text-center text-base text-cyan-50/88">
          {statusText}
        </p>
      </div>
    </header>
  );
}
