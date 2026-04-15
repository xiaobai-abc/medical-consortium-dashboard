import { cn } from "@/lib/utils";
import DeviceMonitorDialogProvider from "./components/device-monitor-dialog/provider";

import LeftL1 from "./left/l1";
import LeftL2 from "./left/l2";

import RightR1 from "./right/r1";
import RightR2 from "./right/r2";

import MainMap from "./middle/map";
import TopDashboard from "./middle/top";

/**
 * 主体负责组织三栏布局，并在页面中只挂载一次设备监控弹窗根组件。
 */
function SectionBody() {
  return (
    <DeviceMonitorDialogProvider>
      <section className={cn("flex w-full overflow-hidden gap-x-3")}>
        {/* 圣杯布局 */}
        {/* 左 中 右 */}
        <div className="h-full flex flex-col w-[22%] min-w-[420px]">
          <LeftL1 />
          <LeftL2 />
        </div>
        <div className="flex-full w-full h-full flex flex-col">
          <TopDashboard></TopDashboard>
          <MainMap></MainMap>
        </div>
        <div className="h-full flex flex-col w-[22%] min-w-[420px]">
          <RightR1></RightR1>
          <RightR2 />
        </div>
      </section>
    </DeviceMonitorDialogProvider>
  );
}

export default SectionBody;
