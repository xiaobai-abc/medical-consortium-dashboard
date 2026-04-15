"use client";

import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

import { useDeviceMonitorDialog } from "./context";
import DeviceMonitorFilterSelect from "./filter-select";

const dialogTitleMap = {
  all: "物联网设备监控",
  online: "在线设备",
  offline: "离线设备",
  total: "设备总数"
};

/**
 * 设备监控弹窗根组件在页面中只挂载一次，所有入口共享这一份实例。
 */
function DeviceMonitorDialogRoot() {
  const {
    isOpen,
    dialogType,
    dialogPayload,
    closeDeviceMonitorDialog
  } = useDeviceMonitorDialog();
  const dialogTitle =
    dialogPayload && dialogPayload.title
      ? dialogPayload.title
      : dialogTitleMap[dialogType] || dialogTitleMap.all;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={function handleOpenChange(nextOpen) {
        if (!nextOpen) {
          closeDeviceMonitorDialog();
        }
      }}>
      <DialogContent
        showCloseButton={false}
        className="w-[980px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[980px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col bg-[#1b233a]"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              {dialogTitle}
            </DialogTitle>
            <div className="ml-auto mr-0">
              <DeviceMonitorFilterSelect />
            </div>
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
          <ScrollArea className="min-h-[460px]">
            <div>
              <div className="py-4.5 px-3.5 border border-[#1D3B7A]/35 rounded-[10px]">
                <div className="flex items-center justify-between">
                  <h6 className=" leading-none text-sm text-[#E8F0FF]/95 font-bold">
                    DEV-100000
                  </h6>
                  <div className="border border-[#FF4D4F]/35  flex items-center justify-between px-2 py-1 rounded-[10px]">
                    <span className="text-[#FF4D4F] text-xs leading-none">
                      离线
                    </span>
                  </div>
                </div>
                <div className="flex mt-3">
                  <div className="space-y-2.5 flex-1">
                    <ItemLab l="设备类型" c="啊电力科技撒离开家"></ItemLab>
                    <ItemLab l="所属医院" c="医院A"></ItemLab>
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <ItemLab l="设备类型" c="啊电力科技撒离开家"></ItemLab>
                    <ItemLab l="所属医院" c="医院A"></ItemLab>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceMonitorDialogRoot;

function ItemLab({ l, c }) {
  return (
    <div className="flex items-center">
      <span className="text-sm text-[#9FB5DA]/85">{l}:</span>
      <span className="text-sm text-[#E8F0FF]/90 ml-2">{c}</span>
    </div>
  );
}
