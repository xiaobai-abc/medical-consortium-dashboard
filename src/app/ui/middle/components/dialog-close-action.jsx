"use client";

import { Button } from "@/shadcn/ui/button";
import { DialogClose } from "@/shadcn/ui/dialog";

/**
 * 大屏弹窗的关闭按钮视觉保持统一，但只复用这一小块交互按钮，
 * 不抽象整套弹窗头部，避免把不同业务弹窗耦合到同一个大组件里。
 */
function DialogCloseAction() {
  return (
    <div className="pl-3">
      <DialogClose
        render={
          <Button
            variant="outline"
            size="xs"
            className="h-8 w-12 rounded-[10px] border-[#1D3B7A]/75 bg-[#0B1530]/35 text-xs leading-none font-thin text-[#E8F0FF] hover:bg-[#00E7FF]/20"
          />
        }>
        关闭
      </DialogClose>
    </div>
  );
}

export default DialogCloseAction;
