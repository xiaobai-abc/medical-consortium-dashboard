import { cn } from "@/lib/utils";

/**
 * 大屏模块面板容器，统一卡片外观与标题结构。
 */
export default function ScreenPanel({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}) {
  return (
    <section
      className={cn(
        "screen-panel-glow rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/72">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="pt-3 text-[22px] font-semibold tracking-[0.04em] text-white">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="pt-3 text-sm leading-7 text-slate-300">{description}</p>
      ) : null}
      <div className="pt-5">{children}</div>
      {footer ? (
        <p className="border-t border-white/10 pt-5 text-xs leading-6 text-slate-400">
          {footer}
        </p>
      ) : null}
    </section>
  );
}
