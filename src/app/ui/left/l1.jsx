import { cn } from "@/lib/utils";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

function LeftL1() {
  return (
    <div className="w-full flex-1 mb-3 bd1 rounded-2xl py-4 px-3.5 flex flex-col">
      <div className="flex-1 bd mb-4">

      </div>
      <div className="flex items-center">
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 px-5 py-2 flex-1">
          <h5 className="text-[#9FB5DA] text-xs mb-1">总测量次数</h5>
          <span className="text-[22px] text-[#00E7FF] leading-none">49,772</span>
        </div>
        <div className=" rounded-[50px] bd1 border-[#00E7FF]/35 flex-1 ml-4 px-5 py-2">
          <h5 className="text-[#9FB5DA] text-xs mb-1">异常数据占比</h5>
          <span className="text-[22px] text-[#986df7] leading-none">13.7%</span>
        </div>
      </div>
    </div>
  );
}
export default LeftL1;
