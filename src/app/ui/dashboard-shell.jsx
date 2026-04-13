import ScreenPanel from "../components/screen-panel";

/**
 * 大屏首页骨架，承载项目启动阶段的结构说明与环境态势占位。
 */
export default function DashboardShell({
  runtimeConfig,
  metrics,
  sections,
  bootstrapSteps,
}) {
  return (
    <main className="screen-grid-bg min-h-screen overflow-hidden bg-[#031525] text-white">
      <div className="mx-auto max-w-[1920px] px-8 py-8">
        <section className="rounded-[32px] border border-cyan-400/16 bg-slate-950/72 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between">
            <div className="xl:max-w-[62%]">
              <p className="text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                Medical Consortium Dashboard
              </p>
              <h1 className="pt-4 text-[40px] font-semibold tracking-[0.08em] text-white">
                {runtimeConfig.appName}
              </h1>
              <p className="pt-4 max-w-[880px] text-base leading-8 text-slate-300">
                当前项目已完成大屏初始化骨架，适合继续接地图、图表、质控告警、
                区域运行指标与机构详情联动。
              </p>
            </div>
            <div className="pt-6 xl:w-[360px] xl:pt-0">
              <div className="rounded-[24px] border border-white/10 bg-cyan-400/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                  Runtime
                </p>
                <dl className="pt-4">
                  <div className="flex items-center justify-between border-b border-white/8 pb-3">
                    <dt className="text-sm text-slate-300">环境</dt>
                    <dd className="text-sm font-medium text-white">
                      {runtimeConfig.appEnv}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/8 py-3">
                    <dt className="text-sm text-slate-300">接口地址</dt>
                    <dd className="max-w-[210px] truncate text-sm font-medium text-white">
                      {runtimeConfig.apiBaseUrl}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm text-slate-300">设计基线</dt>
                    <dd className="text-sm font-medium text-white">
                      {runtimeConfig.screenBaseWidth} x{" "}
                      {runtimeConfig.screenBaseHeight}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="flex flex-col pt-6 xl:flex-row">
            {metrics.map(function renderMetricItem(metric, index) {
              const itemClassName =
                index === metrics.length - 1 ? "w-full xl:w-1/4" : "w-full xl:w-1/4 xl:pr-4";

              return (
                <div
                  key={metric.label}
                  className={cnMetricItem(itemClassName, index)}
                >
                  <ScreenPanel
                    eyebrow="Overview"
                    title={metric.label}
                    description={metric.description}
                  >
                    <div className="flex items-end">
                      <span className="text-[42px] font-semibold leading-none text-cyan-100">
                        {metric.value}
                      </span>
                      {metric.unit ? (
                        <span className="pl-3 text-base text-slate-300">
                          {metric.unit}
                        </span>
                      ) : null}
                    </div>
                  </ScreenPanel>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col pt-6 xl:flex-row">
            {sections.map(function renderSection(section, index) {
              const wrapperClassName =
                index === sections.length - 1 ? "w-full xl:w-1/3" : "w-full xl:w-1/3 xl:pr-4";

              return (
                <div
                  key={section.title}
                  className={cnMetricItem(wrapperClassName, index)}
                >
                  <ScreenPanel
                    eyebrow={section.eyebrow}
                    title={section.title}
                    description={section.description}
                    footer={section.footer}
                    className="h-full"
                  >
                    <ul>
                      {section.items.map(function renderSectionItem(item, itemIndex) {
                        return (
                          <li
                            key={item}
                            className={
                              itemIndex === section.items.length - 1
                                ? "rounded-2xl border border-white/8 bg-black/10 px-4 py-4 text-sm leading-7 text-slate-200"
                                : "rounded-2xl border border-white/8 bg-black/10 px-4 py-4 text-sm leading-7 text-slate-200 pb-4"
                            }
                          >
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </ScreenPanel>
                </div>
              );
            })}
          </div>

          <div className="pt-6">
            <ScreenPanel
              eyebrow="Bootstrap Checklist"
              title="下一步接入建议"
              description="以下内容建议作为新项目第一轮开发任务，先把基础能力铺平，再进入模块化联调。"
            >
              <div className="flex flex-col xl:flex-row">
                <div className="xl:w-[58%] xl:pr-4">
                  <ol className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    {bootstrapSteps.map(function renderBootstrapStep(step, index) {
                      const isLastItem = index === bootstrapSteps.length - 1;

                      return (
                        <li
                          key={step}
                          className={
                            isLastItem
                              ? "flex items-start"
                              : "flex items-start border-b border-white/8 pb-4 pt-4 first:pt-0"
                          }
                        >
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/18 text-xs font-semibold text-cyan-100">
                            {index + 1}
                          </span>
                          <span className="pl-4 text-sm leading-7 text-slate-200">
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="pt-4 xl:w-[42%] xl:pt-0">
                  <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                      Current Flags
                    </p>
                    <dl className="pt-4">
                      <div className="flex items-center justify-between border-b border-white/8 pb-3">
                        <dt className="text-sm text-slate-300">简称</dt>
                        <dd className="text-sm font-medium text-white">
                          {runtimeConfig.appShortName}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/8 py-3">
                        <dt className="text-sm text-slate-300">Mock</dt>
                        <dd className="text-sm font-medium text-white">
                          {runtimeConfig.useMock ? "启用" : "关闭"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <dt className="text-sm text-slate-300">地图 Key</dt>
                        <dd className="text-sm font-medium text-white">
                          {runtimeConfig.amapKey ? "已配置" : "未配置"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </ScreenPanel>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * 控制移动端纵向堆叠时的顶部内边距，不使用 margin-top。
 */
function cnMetricItem(baseClassName, index) {
  if (index === 0) {
    return baseClassName;
  }

  return `${baseClassName} pt-4 xl:pt-0`;
}
