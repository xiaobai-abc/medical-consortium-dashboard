import ScreenProgress from "@/app/components/screen-progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

const measurementItems = [
  {
    title: "血压",
    value: 12426,
    colors: ["#59c2dd", "#55b8d8", "#476fb4"]
  },
  {
    title: "血糖",
    value: 8273,
    colors: ["#776cdb", "#55b8d8", "#476fb4"]
  },
  {
    title: "心率",
    value: 6958,
    colors: ["#59c2dd", "#55b8d8", "#476fb4"]
  },
  {
    title: "总胆固醇",
    value: 5261,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "尿酸",
    value: 4213,
    colors: ["#59c2dd", "#55b8d8", "#4470b1"]
  },
  {
    title: "甘油三酯",
    value: 2931,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "低密度脂蛋白",
    value: 2603,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "高密度脂蛋白",
    value: 2064,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "血红蛋白",
    value: 1948,
    colors: ["#59c2dd", "#55b8d8", "#4470b1"]
  },
  {
    title: "肌酐",
    value: 1837,
    colors: ["#776cdb", "#55b8d8", "#4470b1"]
  },
  {
    title: "血酮",
    value: 1258,
    colors: ["#59c2dd", "#5dc18c", "#3e8a9f"]
  },
  {
    title: "乳酸",
    value: 3125,
    colors: ["#776cdb", "#55b8d8", "#4470b1"],
  },
];

const maxMeasurementValue = measurementItems.reduce(function getMaxValue(
  currentMaxValue,
  currentItem
) {
  return Math.max(currentMaxValue, currentItem.value);
}, 0);

function LeftL1() {
  return (
    <div className="w-full flex-1 h-0 mb-3 bd1 rounded-2xl py-4 px-3.5 flex flex-col" style={{
      background : "linear-gradient(rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
    }}>
      <div className="w-full flex items-center mb-3 ">
        <h3 className="text-sm text-[#9FB5DA]">检测项目数据统计</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}></div>
      </div>
      <div className="flex-1 h-0 mb-4">
        <ScrollArea className={cn("h-full")}>
          <div className="pr-2">
            {measurementItems.map(function renderMeasurementItem(item, index) {
              return (
                <ProgressBlock
                  key={`${item.title}-${item.value}`}
                  title={item.title}
                  value={item.value}
                  progress={Math.round(
                    (item.value / maxMeasurementValue) * 100
                  )}
                  colors={item.colors}
                  className={index === 0 ? "" : "pt-4"}
                />
              );
            })}
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center">
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 px-5 py-2 flex-1">
          <h5 className="text-[#9FB5DA] text-xs mb-1">总测量次数</h5>
          <span className="text-[22px] text-[#00E7FF] leading-none">
            49,772
          </span>
        </div>
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 flex-1 ml-4 px-5 py-2">
          <h5 className="text-[#9FB5DA] text-xs mb-1">异常数据占比</h5>
          <span className="text-[22px] text-[#986df7] leading-none">13.7%</span>
        </div>
      </div>
    </div>
  );
}

function ProgressBlock({ title, value, progress, colors, className }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h5 className="text-[13px] text-[#E8F0FF] leading-none tracking-[0.04em]">
          {title}
        </h5>
        <span className="text-[12px] text-[#A9B8D8] leading-none tracking-[0.08em]">
          {value.toLocaleString("zh-CN")}
        </span>
      </div>
      <div className="pt-2">
        <ScreenProgress
          progress={progress}
          colors={colors}
          trackClassName="border border-[#1E4B87]/70 bg-transparent"
          barClassName="shadow-[0_0_14px_rgba(89,194,221,0.28)]"
        />
      </div>
    </div>
  );
}

export default LeftL1;
