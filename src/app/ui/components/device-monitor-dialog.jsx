"use client";

import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "../../../shadcn/ui/scroll-area";

const dialogTitleMap = {
  all: "物联网设备监控",
  online: "在线设备",
  offline: "离线设备",
  total: "设备总数"
};

/**
 * 设备监控相关入口统一复用同一个弹窗壳子。
 */
function DeviceMonitorDialog({ open, onOpenChange, dialogType }) {
  const dialogTitle = dialogTitleMap[dialogType] || dialogTitleMap.all;
  console.log(dialogTitle);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {dialogTitle}
            </DialogTitle>
            <div className="pl-3">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    size="xs"
                    className="bg-[#0B1530]/35 rounded-[10px] w-12 h-8 text-xs border-[#1D3B7A]/75 leading-none hover:bg-[#00E7FF]/20 text-[#E8F0FF] font-thin"
                  />
                }>
                关闭
              </DialogClose>
            </div>
          </div>
          <hr className="text-[#1D3B7A]/35 my-3" />
          <ScrollArea className="min-h-[460px] bd"></ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceMonitorDialog;
