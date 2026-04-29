"use client";

/**
 * 表头输入框只负责最小交互壳子。
 * 它不关心具体筛选语义，业务弹窗只需要传入当前值和变更处理函数即可。
 */
function DialogHeaderInput({
  value,
  placeholder,
  onChange,
  minWidthClassName
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`h-8 w-fit rounded-[10px] border border-[#1D3B7A]/80 bg-[rgba(13,27,56,0.92)] px-3 text-xs text-[#D6E0F5] outline-none placeholder:text-[#6983B3] focus:border-[#2A62A7] ${minWidthClassName}`}
    />
  );
}

export default DialogHeaderInput;
