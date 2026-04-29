"use client";

/**
 * 筛选项统一只抽标签与宽度壳子。
 * 具体输入控件、默认值和筛选语义都仍由各自业务弹窗决定，
 * 这样可以复用视觉结构，同时保持业务解耦。
 */
function DialogFilterField({ label, className, children }) {
  return (
    <div className={className}>
      <div className="pb-2 text-xs leading-none text-[#7E99C7]">{label}</div>
      {children}
    </div>
  );
}

export default DialogFilterField;
