import { Button } from "@/shadcn/ui/button";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

function RightR1() {
  return (
    <div
      className="w-full flex-1 mb-3 bd1 rounded-2xl px-3.5 py-4 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-sm text-[#9FB5DA] mr-3">物联网设备监控</h3>
          <ViewAllButton>查看全部</ViewAllButton>
        </div>
        <div
          className="h-[1px] w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}
        />
      </div>
      <div className="flex justify-between gap-x-3">
        <BlockTT></BlockTT>
        <BlockTT></BlockTT>
      </div>
      <ScrollArea className="flex-1 h-0 bd"></ScrollArea>
    </div>
  );
}
export default RightR1;

function ViewAllButton({ children }) {
  return (
    <Button
      className={cn(
        "bg-[#00E7FF]/13 rounded-3xl px-2 py-0.5 text-xs border-[#00E7FF]/65 leading-none h-fit hover:bg-[#00E7FF]/20 ",
        "text-xs text-[#E8F0FF] font-thin"
      )}
      variant="outline"
      size="xs">
      {children}
    </Button>
  );
}

function BlockTT() {
  return (
    <div className="bd1 rounded-2xl px-3.5 py-4 flex items-center flex-1 bg-[#0B1530]/35">
      <div
        className="w-8 h-8 rounded-full border border-[#00E7FF] mr-3"
        style={{
          background:
            "radial-gradient(100% at center, #00E7FF 0%, transparent 55%)"
        }}></div>
      <div className="">
        <h6 className="text-xs text-[#9FB5DA]/90">在线设备</h6>
        <span className="text-white text-[18px]">1824</span>
      </div>
    </div>
  );
}
