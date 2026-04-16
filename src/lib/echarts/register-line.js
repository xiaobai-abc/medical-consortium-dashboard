import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

/**
 * 折线图相关能力统一在这里完成注册，避免各组件重复声明。
 */
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

export { echarts };
