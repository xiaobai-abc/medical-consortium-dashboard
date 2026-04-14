import { cn } from "@/lib/utils";

const progressColors = [
  "#59c2dd",
  "#776cdb",
  "#55b8d8",
  "#5dc18c",
  "#476fb4",
  "#3e8a9f",
  "#4470b1",
];

/**
 * 从预设色板中随机生成一组渐变色。
 */
function createRandomGradient() {
  const startIndex = Math.floor(Math.random() * progressColors.length);
  const middleIndex = Math.floor(Math.random() * progressColors.length);
  const endIndex = Math.floor(Math.random() * progressColors.length);

  return `linear-gradient(to right, ${progressColors[startIndex]} 0%, ${progressColors[middleIndex]} 50%, ${progressColors[endIndex]} 100%)`;
}

/**
 * 根据外部颜色配置生成进度条背景，未传入时使用内置随机渐变。
 */
function getBarBackground(colors) {
  if (typeof colors === "string" && colors.trim()) {
    return colors;
  }

  if (Array.isArray(colors) && colors.length > 0) {
    if (colors.length === 1) {
      return colors[0];
    }

    return `linear-gradient(to right, ${colors.join(", ")})`;
  }

  return createRandomGradient();
}

/**
 * 进度条组件，仅负责展示 8px 高度的进度条。
 */
function ScreenProgress({
  progress = 0,
  colors,
  className,
  trackClassName,
  barClassName,
}) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  const barBackground = getBarBackground(colors);

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-white/10",
        className,
        trackClassName
      )}
    >
      <div
        className={cn("h-2 rounded-full", barClassName)}
        style={{
          width: `${safeProgress}%`,
          background: barBackground,
        }}
      />
    </div>
  );
}

export default ScreenProgress;
