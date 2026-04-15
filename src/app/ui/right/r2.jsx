import ScreenProgress from "@/app/components/screen-progress";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

function RightR2() {
  return (
    <div
      className="w-full h-[345px] bd1 rounded-2xl px-3.5 py-4 flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
      }}>
      <div className="w-full flex items-center mb-3">
        <h3 className="text-sm text-[#9FB5DA]">辖区各医院管理的设备数量</h3>
        <div
          className="h-px w-full flex-1 ml-3"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 231, 255, 0.35) 0%, transparent 100%)"
          }}
        />
      </div>
      <div className="flex-1 h-0 -mr-2">
        <ScrollArea className="h-full pr-2">
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
          <Item></Item>
        </ScrollArea>
      </div>
    </div>
  );
}

export default RightR2;

function Item() {
  return (
    <div className="flex items-center">
      <div className=" rounded-[5px] text-white text-sm flex items-center justify-center w-6 h-6 bg-[#2E5E59] leading-[10px] font-bold">
        1
      </div>
      <div className="flex-1 ml-3 mr-3">
        <span className="text-sm text-[#B7D7EA]">桐君街道社区卫生服务中心</span>
        <ScreenProgress
          progress={70}
          colors="#6bc8fa"
          className="h-1 mt-1"></ScreenProgress>
      </div>
      <span className="text-sm text-[#DDF7FF]">7台</span>
    </div>
  );
}
