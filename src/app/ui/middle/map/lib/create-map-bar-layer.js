/**
 * 创建区县中心点柱状条图层。
 * 这层逻辑单独抽离出来，原因有两个：
 * 1. `PointLayer.shape("cylinder")` 的参数和普通文字点图层完全不是一套，
 *    放在主地图组件里会让地图初始化逻辑和图层细节混在一起，后续很难排查。
 * 2. 当前问题本质上是“图层已挂载但视觉不明显”，单独抽出来以后，
 *    可以只围绕柱状条做宽度、高度、颜色、透明渐变等参数调试。
 */
export function createMapBarLayer(PointLayer, barGeoJson) {
  return new PointLayer({
    zIndex: 7,
    autoFit: false,
    pickable: false
  })
    .source(barGeoJson, {
      parser: {
        type: "geojson"
      }
    })
    .shape("cylinder")
    .size("barTopSize", function mapBarSize(barTopSize) {
      /**
       * `PointLayer` 的 3D 柱状体 size 是一个三元数组：
       * [底部半径X, 底部半径Y, 柱体总高度]
       *
       * 这里把半径调大到 10.5，是为了优先保证“可见”。
       * 先让柱子明确出现，再回过头收视觉，不然现在这种状态下很难判断
       * 是 API 不生效、数据没进来，还是只是柱子太细太矮。
       */
      return [10.5, 10.5, barTopSize];
    })
    .color("barColor", function mapBarColor(barColor) {
      return barColor;
    })
    .style({
      /**
       * 3D 点柱在当前版本里没有像 PolygonLayer 那样的 `raisingHeight` 用法，
       * 所以只能通过“总高度超过板块高度”的方式，让柱子从板块上方露出来。
       */
      heightfixed: true,
      /**
       * 打开从下往上的透明渐变，柱子底部更融进板块，顶部更明显。
       */
      opacityLinear: {
        enable: true,
        dir: "up"
      },
      /**
       * 关闭光照计算，避免在当前深色底图上因为光照方向导致柱体发暗。
       * 先保证颜色稳定可见，后面如果需要更立体再重新打开。
       */
      lightEnable: false
    });
}
