import { cn } from "@/lib/utils";

import LeftL1 from "./left/l1";
import LeftL2 from "./left/l2";

import RightR1 from "./right/r1";
import RightR2 from "./right/r2";

/**
 * 主体
 */

function SectionBody() {
  return (
    <section className={cn("flex w-full")}>
      {/* 圣杯布局 */}
      {/* 左 中 右 */}
      <div className="h-full flex flex-col w-[22%] min-w-[420px]">
        <LeftL1 />
        <LeftL2 />
      </div>
      <div className="flex-full w-full"></div>
      <div className="h-full flex flex-col w-[22%] min-w-[420px]">
        <RightR1 />
        <RightR2 />
      </div>
    </section>
  );
}

export default SectionBody;
