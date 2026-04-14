import ScreenHeader from "../components/screen-header";

/**
 * 大屏首页骨架，仅保留顶部信息栏，主体内容留空给后续模块接入。
 */
export default function DashboardShell({ title, statusText }) {
  return (
    <main className="screen-grid-bg min-h-screen overflow-hidden bg-[#031525] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col py-3.5 px-4.5">
        <ScreenHeader title={title} statusText={statusText} />
        <section className="flex-1 bd" />
      </div>
    </main>
  );
}
