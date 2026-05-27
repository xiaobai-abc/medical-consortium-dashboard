const homeThreeBlockMapConfig = {
  colors: {
    topFace: "#6192ef", // 地图区块顶面的主色。
    sideFace: "#63F6F7", // 地图区块侧面的主色。
    boundaryLine: "#77bcf1", // 区块边界线颜色。
    hoverBlend: "#ffffff" // hover 高亮时混入的提亮色。
  },
  lighting: {
    topEmissiveStrength: 0.34, // 顶面的基础自发光强度。
    sideEmissiveStrength: 0.24, // 侧面的基础自发光强度。
    hoverTopEmissiveStrength: 0.46, // 顶面 hover 时的自发光强度。
    hoverSideEmissiveStrength: 0.34, // 侧面 hover 时的自发光强度。
    rendererExposure: 1.1, // 渲染器曝光度。
    fogStartMultiplier: 1.25, // 雾效开始距离，相对地图跨度的倍率。
    fogEndMultiplier: 3.4 // 雾效结束距离，相对地图跨度的倍率。
  },
  map: {
    blockHeight: 40, // 地图区块统一挤出高度。
    rotationDegrees: 30, // 地图整体逆时针旋转角度。
    labelOffsetZ: 18 // 区块名称标签相对顶面的抬高高度。
  },
  bar: {
    maxHeight: 128, // 柱子允许的最大高度。
    minHeight: 72, // 柱子允许的最小高度。
    offsetX: 0, // 柱子整体沿 X 轴的偏移量。
    markerMinScale: 0.72, // 柱子整组在缩小时的最小缩放比例。
    markerMaxScale: 1.18, // 柱子整组在放大时的最大缩放比例。
    markerScalePower: 0.72, // 柱子缩放随相机距离变化的曲线强度。
    markerScaleEpsilon: 0.01 // 缩放更新时的最小变化阈值。
  },
  tooltip: {
    offsetX: 18, // hover 浮窗相对鼠标的 X 偏移。
    offsetY: 18 // hover 浮窗相对鼠标的 Y 偏移。
  },
  camera: {
    azimuthDegrees: -113.72, // 默认相机的水平方位角。
    tiltDegrees: 68.25, // 默认相机的俯仰角。
    distanceMultiplier: 1.387, // 默认相机距离相对地图跨度的倍率。
    targetZMultiplier: 0.08, // 相机目标点的默认 Z 高度倍率。
    minPolarDegrees: 20, // 相机允许的最小俯仰角。
    maxPolarDegrees: 82, // 相机允许的最大俯仰角。
    enableRotate: true, // 是否允许鼠标拖动旋转地图视角。
    enablePan: false, // 是否允许鼠标拖动平移地图位置。
    showViewDebugPanel: true, // 是否显示视角调试面板。
    logViewConfigToConsole: true // 是否在控制台打印视角配置。
  },
  interaction: {
    featureLiftIdleZ: 0, // 板块静止时的 Z 偏移。
    featureLiftActiveZ: 8, // 板块 hover 时的目标抬起高度。
    featureLiftDamping: 16, // 板块抬起动画的阻尼系数。
    featureLiftEpsilon: 0.01, // 板块抬起动画停止时的误差阈值。
    enableMapClickLog: true // 是否启用点击地图打印调试坐标。
  }
};

export default homeThreeBlockMapConfig;
