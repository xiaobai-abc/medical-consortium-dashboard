export const DASHBOARD_METRICS = [
  {
    label: "机构覆盖",
    value: "28",
    unit: "家",
    description: "已纳入平台统一接入的基层与区域机构",
  },
  {
    label: "家庭医生团队",
    value: "164",
    unit: "组",
    description: "后续可接签约、随访、重点人群指标",
  },
  {
    label: "实时告警",
    value: "06",
    unit: "条",
    description: "当前建议接质控、转诊、床位或设备状态",
  },
  {
    label: "数据更新时间",
    value: "15:30",
    unit: "",
    description: "首页初始化阶段使用静态占位，后续接实时接口",
  },
];

export const DASHBOARD_SECTIONS = [
  {
    eyebrow: "Data Access",
    title: "接入规划",
    description: "优先定义平台基础接口、地图能力与大屏设计基线。",
    items: [
      "统一接口域名与鉴权方案",
      "明确地图底图、行政区边界与坐标系",
      "按模块拆分首页、详情页、弹层数据结构",
    ],
    footer: "建议先完成接口配置、设计稿标注和模块映射表。",
  },
  {
    eyebrow: "Screen Modules",
    title: "首屏模块建议",
    description: "首页建议优先落地最稳定、最能体现平台价值的核心区域。",
    items: [
      "顶部总览指标与系统运行态",
      "中心地图联动与区域态势",
      "左右两侧统计卡、趋势图、告警清单",
    ],
    footer: "当前结构已拆分为 page / ui / components / modules，便于后续扩展。",
  },
  {
    eyebrow: "Engineering",
    title: "工程基线",
    description: "已初始化环境变量、Next 配置、根布局和基础页面约定。",
    items: [
      "React Compiler 已启用",
      "大体量包按需优化导入已配置",
      "首页、加载态、404 页面已补齐",
    ],
    footer: "下一步可直接接 Zustand store、接口层和图表模块。",
  },
];

export const DASHBOARD_BOOTSTRAP_STEPS = [
  "确认设计稿尺寸是否固定为 1920 x 1080",
  "补齐接口域名、鉴权头、地图 Key",
  "梳理首页模块清单与字段映射",
  "确定是否需要 mock 与多环境切换",
];
