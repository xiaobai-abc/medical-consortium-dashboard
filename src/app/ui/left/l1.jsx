import ScreenProgress from "@/app/components/screen-progress";

function LeftL1() {
  return (
    <div className="w-full flex-1 mb-3 bd1 rounded-2xl py-4 px-3.5 flex flex-col">
      <div className="w-full flex items-center mb-3 ">
        <h3 className="text-sm text-[#9FB5DA]">检测项目数据统计</h3>
        <div
          className="h-[1px] w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}></div>
      </div>
      <div className="flex-1 bd mb-4">
        <ProgressBlock title="测量完成进度" value="12,456" progress={67} />
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

function ProgressBlock({ title, value, progress }) {
  return (
    <div className="">
      <div className="flex items-center justify-between ">
        <h5 className="text-xs text-[#E8F0FF] leading-none">{title}</h5>
        <span className="text-sm text-[#9FB5DA] leading-none">{value}</span>
      </div>
      <div className="pt-2">
        <ScreenProgress progress={progress} />
      </div>
    </div>
  );
}

export default LeftL1;
