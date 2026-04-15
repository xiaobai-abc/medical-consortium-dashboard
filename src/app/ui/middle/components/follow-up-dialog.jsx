"use client";

import { Button } from "@/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/shadcn/ui/dialog";

/**
 * 重点随访弹窗仅提供统一壳子，内容区留空给后续业务模块填充。
 */
function FollowUpDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[760px] max-w-[calc(100%-2rem)] border-0 bg-[rgba(7,11,22,0.93)] p-0 text-white ring-0 sm:max-w-[760px]">
        <div
          className="bd1 rounded-2xl px-4 py-4 flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at left 10% top 10%, rgb(0 231 255 / 10%), transparent 55%),linear-gradient(to bottom,rgb(11 21 48 / 85%) 0%, rgb(11 21 48 / 55%) 100%)"
          }}>
          <div className="w-full flex items-center justify-between">
            <DialogTitle className="text-base text-white font-bold">
              重点随访
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
          <div className="min-h-[360px]"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FollowUpDialog;
