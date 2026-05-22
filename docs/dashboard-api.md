# 医共体大屏接口文档

Apifox / Swagger 导入文件：

- [medical-dashboard.openapi.json](/Users/jiang/Herd/xhs/anxu/openapi/medical-dashboard.openapi.json)

## 1. 接口概览

- 接口名称：医共体大屏聚合接口
- 请求方法：`GET`
- 请求路径：`/api/dashboard`
- 返回格式：`application/json`
- 鉴权要求：需要 API 令牌
- 跨域访问：已允许 `CORS`，前端可直接从异域页面调用

适用页面：

- [https://medical-5qv.pages.dev/](https://medical-5qv.pages.dev/)

该接口是一个聚合接口，前端进入大屏后建议只发起一次请求，然后把不同模块的数据分发到各卡片、图表和列表。

弹窗明细接口见：

- [docs/dashboard-popup-api.md](/Users/jiang/Herd/xhs/anxu/docs/dashboard-popup-api.md)

## 2. 调用示例

可选查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `warning_metric` | string | 否 | 左下趋势图当前选中的指标，支持 `bloodPressure` / `bloodSugar` 等键，也支持中文名，如 `血压` |

```bash
curl -X GET "http://your-domain/api/dashboard?warning_metric=血糖" \
  -H "Authorization: Bearer your-api-token" \
  -H "Accept: application/json"
```

也支持以下头部：

```bash
X-Api-Token: your-api-token
```

成功返回 `HTTP 200`。

未携带或携带错误令牌时返回 `HTTP 401`。

## 3. 顶层返回结构

接口当前**不包裹** `code / message / data` 三层结构，直接返回业务对象：

```json
{
  "meta": {},
  "overview": {},
  "measurement_statistics": {},
  "warning_trends": {},
  "realtime_warnings": {},
  "device_monitoring": {},
  "map_distribution": {}
}
```

## 4. 完整响应示例

下面是一个精简后的示例，字段结构与实际接口保持一致：

```json
{
  "meta": {
    "generated_at": "2026-04-27T17:30:00+08:00",
    "timezone": "Asia/Shanghai",
    "source_connection": "external_mysql"
  },
  "overview": {
    "service_count": {
      "label": "今日总服务人次",
      "value": 7,
      "unit": "次",
      "comparison_label": "较昨日",
      "previous_value": 0,
      "change_rate": 0,
      "trend": "flat"
    },
    "realtime_alerts": {
      "label": "实时预警",
      "value": 5,
      "unit": "条",
      "comparison_label": "较昨日",
      "previous_value": 0,
      "change_rate": 0,
      "trend": "flat"
    },
    "follow_up": {
      "label": "重点随访",
      "value": 61,
      "unit": "人",
      "completion_rate": 86.9,
      "completed_count": 53,
      "lookback_days": 30
    },
    "devices": {
      "label": "设备总数",
      "value": 87,
      "unit": "台",
      "online": 3,
      "offline": 84,
      "active_window_days": 7,
      "comparison_label": "较昨日新增",
      "previous_value": 0,
      "change_rate": 0,
      "trend": "flat"
    }
  },
  "measurement_statistics": {
    "total_measurements": 1000,
    "abnormal_rate": 38.8,
    "items": [
      {
        "key": "bloodPressure",
        "label": "血压",
        "count": 183,
        "percentage": 18.3
      },
      {
        "key": "bloodSugar",
        "label": "血糖",
        "count": 356,
        "percentage": 35.6
      }
    ]
  },
  "warning_trends": {
    "days": 30,
    "default_metric": "bloodPressure",
    "selected_metric": "bloodSugar",
    "options": [
      {
        "key": "bloodPressure",
        "label": "血压",
        "total": 74
      }
    ],
    "selected_item": {
      "key": "bloodSugar",
      "label": "血糖",
      "total": 12,
      "points": []
    },
    "items": [
      {
        "key": "bloodPressure",
        "label": "血压",
        "total": 74,
        "points": [
          {
            "date": "2026-03-29",
            "count": 0
          },
          {
            "date": "2026-03-30",
            "count": 11
          }
        ]
      }
    ]
  },
  "realtime_warnings": {
    "total_today": 5,
    "items": [
      {
        "id": 513,
        "metric_key": "bloodPressure",
        "metric_label": "血压",
        "metric_name": "血压",
        "value": "156/101",
        "metric_value": "156/101",
        "patient_openid": "opxxxx",
        "patient_name": "张三",
        "location": "浙江省-杭州市",
        "hospital_name": "同德",
        "occurred_at": "2026-04-27T08:21:00+08:00",
        "time": "08:21",
        "warning_time": "08:21"
      }
    ]
  },
  "device_monitoring": {
    "online_devices": 3,
    "offline_devices": 84,
    "active_window_days": 7,
    "rankings": [
      {
        "name": "同德",
        "devices": 34,
        "patients": 2,
        "percentage": 100
      }
    ]
  },
  "map_distribution": {
    "source": "hospital_warning_count_30d",
    "group_by": "hospital",
    "items": [
      {
        "id": "萧山人民医院t",
        "name": "萧山人民医院t",
        "value": 6,
        "location_description": "萧山人民医院t",
        "location_text": "浙江省-杭州市",
        "province_name": "浙江省",
        "province_code": "33",
        "city_name": "杭州市",
        "longitude": 120.1528,
        "latitude": 30.2674,
        "coordinates": {
          "longitude": 120.1528,
          "latitude": 30.2674
        }
      }
    ],
    "hangzhou_districts": [
      {
        "name": "上城区",
        "value": 1,
        "height": 1
      },
      {
        "name": "拱墅区",
        "value": 1,
        "height": 1
      },
      {
        "name": "西湖区",
        "value": 1,
        "height": 1
      },
      {
        "name": "滨江区",
        "value": 1,
        "height": 1
      },
      {
        "name": "萧山区",
        "value": 6,
        "height": 6
      }
    ]
  }
}
```

## 5. 顶层字段说明

| 字段 | 类型 | 必返 | 说明 |
| --- | --- | --- | --- |
| `meta` | object | 是 | 接口生成时间、时区、数据源连接名 |
| `overview` | object | 是 | 顶部四张总览卡片 |
| `measurement_statistics` | object | 是 | 左侧“检测项目数据统计”模块 |
| `warning_trends` | object | 是 | 左下“近30日异常数据报警趋势”模块 |
| `realtime_warnings` | object | 是 | 右侧“异常数据实时预警”模块 |
| `device_monitoring` | object | 是 | 右侧“物联网设备监控”和设备排行模块 |
| `map_distribution` | object | 是 | 中间地图的数据源，同时返回医院点位数据和杭州市区县热度数组 |

## 6. 字段明细

### 6.1 `meta`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `generated_at` | string | 接口生成时间，`ISO 8601` 格式 |
| `timezone` | string | 统计时区，当前固定为 `Asia/Shanghai` |
| `source_connection` | string | Laravel 数据库连接名，当前固定为 `external_mysql` |

### 6.2 `overview`

#### 6.2.1 `overview.service_count`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 固定为 `今日总服务人次` |
| `value` | number | 今日测量事件总数 |
| `unit` | string | 固定为 `次` |
| `comparison_label` | string | 当前为 `较昨日` |
| `previous_value` | number | 昨日测量事件总数 |
| `change_rate` | number | 相比昨日的变化百分比，保留 1 位小数 |
| `trend` | string | `up` / `down` / `flat` |

#### 6.2.2 `overview.realtime_alerts`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 固定为 `实时预警` |
| `value` | number | 今日异常预警条数 |
| `unit` | string | 固定为 `条` |
| `comparison_label` | string | 当前为 `较昨日` |
| `previous_value` | number | 昨日异常预警条数 |
| `change_rate` | number | 相比昨日的变化百分比 |
| `trend` | string | `up` / `down` / `flat` |

#### 6.2.3 `overview.follow_up`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 固定为 `重点随访` |
| `value` | number | 随访患者数 |
| `unit` | string | 固定为 `人` |
| `completion_rate` | number | 最近 30 天内已完成测量的随访患者占比 |
| `completed_count` | number | 最近 30 天内至少有 1 次测量的随访患者数 |
| `lookback_days` | number | 统计窗口天数，当前固定为 `30` |

#### 6.2.4 `overview.devices`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 固定为 `设备总数` |
| `value` | number | 设备总数，按 `SN` 去重 |
| `unit` | string | 固定为 `台` |
| `online` | number | 活跃设备数 |
| `offline` | number | 离线设备数 |
| `active_window_days` | number | 活跃判断窗口，当前固定为 `7` 天 |
| `comparison_label` | string | 当前为 `较昨日新增` |
| `previous_value` | number | 昨日新增绑定设备数 |
| `change_rate` | number | 今日新增绑定设备数相对昨日的变化百分比 |
| `trend` | string | `up` / `down` / `flat` |

### 6.3 `measurement_statistics`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `total_measurements` | number | 全部检测项目的总测量次数 |
| `abnormal_rate` | number | 全部异常预警数占总测量次数的比例，百分比 |
| `items` | array | 各检测项目统计列表 |

#### `measurement_statistics.items[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | string | 指标键值，例如 `bloodPressure`、`bloodSugar` |
| `label` | string | 中文名称 |
| `count` | number | 该指标测量次数 |
| `percentage` | number | 该指标占总测量次数比例 |

当前返回的指标集合：

- `bloodPressure`
- `bloodSugar`
- `heartRate`
- `totalCholesterol`
- `uricAcid`
- `triglyceride`
- `ldl`
- `hdl`
- `hemoglobin`
- `creatinine`
- `bloodKetone`
- `lactate`

### 6.4 `warning_trends`

新增字段说明：

- `selected_metric`：当前选中的趋势指标。
- `options[]`：左下下拉框数据源。
- `selected_item`：当前选中指标对应的完整趋势数据，前端可直接渲染。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `days` | number | 趋势窗口天数，当前固定为 `30` |
| `default_metric` | string | 前端默认选中的指标，当前固定为 `bloodPressure` |
| `items` | array | 各指标 30 天异常趋势 |

#### `warning_trends.items[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | string | 指标键值 |
| `label` | string | 中文名称 |
| `total` | number | 近 30 天该指标总异常数 |
| `points` | array | 日维度趋势数据 |

#### `warning_trends.items[].points[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `date` | string | 日期，格式 `YYYY-MM-DD` |
| `count` | number | 当日异常次数 |

### 6.5 `realtime_warnings`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `total_today` | number | 今日异常预警总数 |
| `items` | array | 最新预警列表，默认最多 10 条 |

#### `realtime_warnings.items[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 预警主键，可直接用于请求弹窗详情接口 `/api/dashboard/popups/warnings/{id}` |
| `metric_key` | string | 指标键值 |
| `metric_label` | string | 指标中文名 |
| `metric_name` | string | `metric_label` 的别名，便于前端直接渲染 |
| `value` | string | 展示值，血压场景会拼成 `收缩压/舒张压` |
| `metric_value` | string | `value` 的别名，便于前端直接渲染 |
| `patient_openid` | string | 患者标识 |
| `patient_name` | string | 患者姓名，取不到时为 `未命名患者` |
| `location` | string | 位置展示字段 |
| `hospital_name` | string | 医院名称，优先取患者当前关联医生所在医院 |
| `occurred_at` | string | 发生时间，`ISO 8601` 格式 |
| `time` | string | 简化时间，格式 `HH:mm` |
| `warning_time` | string | `time` 的别名，便于前端直接渲染 |

### 6.6 `device_monitoring`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `online_devices` | number | 活跃设备数 |
| `offline_devices` | number | 非活跃设备数 |
| `active_window_days` | number | 活跃窗口天数 |
| `rankings` | array | 医院设备数量排行 |

#### `device_monitoring.rankings[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 医院名称 |
| `devices` | number | 该医院关联设备数 |
| `patients` | number | 该医院关联患者数 |
| `percentage` | number | 相对排行第一名的百分比 |

### 6.7 `map_distribution`

新增字段说明：

- `group_by`：当前固定为 `hospital`。
- `items[]` 继续保留原来的 `name` / `value`，同时新增 `location_description`、`province_name`、`province_code`、`longitude`、`latitude`、`coordinates`，便于地图点位渲染。
- `hangzhou_districts[]` 固定返回杭州市 13 个区县市，每项都包含 `name`、`value`、`height`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `source` | string | 当前固定为 `hospital_warning_count_30d` |
| `group_by` | string | 当前固定为 `hospital` |
| `items` | array | 医院维度的近 30 天异常数 |
| `hangzhou_districts` | array | 杭州市区县市维度的近 30 天异常数，按区县顺序稳定返回 |

#### `map_distribution.items[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 医院名称 |
| `value` | number | 近 30 天异常数 |

#### `map_distribution.hangzhou_districts[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 杭州市区县市名称，例如 `上城区`、`桐庐县` |
| `value` | number | 当前区县市命中的近 30 天异常数；如果未命中，兜底返回 `1` |
| `height` | number | 地图高度值，当前与 `value` 保持一致，前端可直接使用或自行缩放；如果未命中，兜底返回 `1` |

## 7. 业务计算规则

### 7.1 测量次数定义

各指标测量次数不是简单的原始行数，而是按“测量事件”统计：

- 大多数指标：按各自业务表中的记录数统计
- `bloodPressure`：把 `SystolicPressures` 和 `DiastolicPressures` 合并后，按 `patientOpenid + date` 去重，视为 1 次血压测量事件

### 7.2 预警次数定义

- 大多数指标：`PatientWarnings` 表中对应 `metrics` 的记录数
- `bloodPressure`：把同一患者、同一时间的 `systolicPressure` 和 `diastolicPressure` 视为一次血压异常事件

### 7.3 活跃设备定义

设备活跃的判断规则：

- 在最近 `7` 天内，`DeivceMetrics` 表出现过该设备 `SN`
- 命中则记为在线，否则记为离线

### 7.4 重点随访完成率

计算方式：

```text
最近 30 天内有过至少 1 次测量的随访患者数 / 全部随访患者数
```

### 7.5 实时预警位置字段回退规则

`realtime_warnings.items[].location` 的取值优先级：

1. `DeivceMetrics.location`
2. `Patients.address`
3. 固定占位值 `未标注区域`

### 7.6 医院排行过滤规则

为避免测试脏数据直接上屏，医院排行与地图分布会过滤：

- 空医院名
- 纯数字医院名，例如 `1`、`1212`、`222222`

## 8. 数据来源映射

| 页面模块 | 接口字段 | 主要数据表 |
| --- | --- | --- |
| 顶部四张卡片 | `overview.*` | `DoctorPatientRelations`、`BindDevices`、`DeivceMetrics`、各测量表、`PatientWarnings` |
| 检测项目统计 | `measurement_statistics` | `SystolicPressures`、`DiastolicPressures`、`BloodSugars`、`HeartRates`、`TotalCholesterols`、`UricAcids`、`Triglycerides`、`Ldls`、`Hdls`、`Hemoglobins`、`Creatinines`、`BloodKetones`、`Lactates` |
| 30 日异常趋势 | `warning_trends` | `PatientWarnings` |
| 实时预警 | `realtime_warnings` | `PatientWarnings`、`Patients`、`DeivceMetrics` |
| 设备监控 | `device_monitoring` | `BindDevices`、`DeivceMetrics` |
| 医院设备排行 | `device_monitoring.rankings` | `DoctorPatientRelations`、`Dockers`、`BindDevices` |
| 地图分布 | `map_distribution` | `PatientWarnings`、`DoctorPatientRelations`、`Dockers` |

## 9. 前端对接建议

### 9.1 建议的请求时机

- 页面首次加载时请求一次 `/api/dashboard`
- 如果需要滚动刷新，可每 `60` 到 `300` 秒轮询一次

### 9.2 建议的前端映射方式

- 顶部四卡：直接读取 `overview`
- 左侧项目列表：读取 `measurement_statistics.items`
- 左下趋势图：读取 `warning_trends.items`
- 右侧预警列表：读取 `realtime_warnings.items`
- 右下医院排行：读取 `device_monitoring.rankings`
- 中间地图：医院点位读取 `map_distribution.items`，区块热度读取 `map_distribution.hangzhou_districts`

## 10. 当前限制

当前版本有几个需要提前知道的点：

- `map_distribution.items` 仍然是医院维度数据；`hangzhou_districts` 是根据位置文本和医院名称做的区县级 best-effort 聚合
- `Hospitals` 表本身数据较少，因此医院排行主要通过 `Dockers.hospital` 关联得出
- 当前接口没有分页，因为它就是大屏聚合接口
- 当前接口没有筛选参数，默认返回固定统计窗口

## 11. 后续可扩展项

如果后面前端需要更细的联动，可以继续扩展：

- 增加 `?days=7|30|90` 统计窗口参数
- 增加 `?metric=bloodSugar` 单独拉趋势接口
- 增加地图专用坐标字段
- 增加医院、区域、医生维度筛选
- 增加统一响应包裹结构，例如 `code/message/data`
