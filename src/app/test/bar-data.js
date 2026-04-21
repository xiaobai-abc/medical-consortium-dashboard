/**
 * 柱条数据单独维护在这个文件里。
 *
 * 这份数组和 GeoJSON 不耦合。
 * 你之后可以直接替换成接口返回的数据，只要结构一致即可。
 *
 * 字段：
 * - name: 展示名称
 * - value: 数值
 * - coordinate: 必填，柱条锚点坐标，格式是 [经度, 纬度]
 */
export const districtBarData = [
  { name: "建德市12313", value: 1200, coordinate: [119.5, 29.4906] },
  { name: "余杭区", value: 800, coordinate: [119.911, 30.3634] },
  { name: "西湖区", value: 1720, coordinate: [120.085, 30.2177] },
  { name: "临平区", value: 1980, coordinate: [120.2253, 30.4187] },
  { name: "滨江区", value: 500, coordinate: [120.176, 30.1894] },
  { name: "淳安县", value: 2500, coordinate: [118.8414, 29.6146] },
  { name: "桐庐县", value: 2760, coordinate: [119.5723, 29.8407] },
  { name: "富阳区", value: 3020, coordinate: [119.787, 29.9733] },
  { name: "萧山区", value: 3280, coordinate: [120.3802, 30.0721] },
  { name: "钱塘区", value: 3540, coordinate: [120.5032, 30.3127] },
  { name: "上城区", value: 3800, coordinate: [120.2117, 30.2952] },
  { name: "临安区", value: 4060, coordinate: [119.3522, 30.1908] },
  { name: "拱墅区", value: 4320, coordinate: [120.1483, 30.3324] },
];
