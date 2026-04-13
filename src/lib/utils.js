import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 className，兼容条件类名与 Tailwind 冲突消解。
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
