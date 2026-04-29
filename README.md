# 医共体管理平台

## 项目定位

当前项目基于 `Next.js App Router`，用于承载医共体管理平台大屏应用。

## 启动方式

```bash
bun install
bun run dev
```

## 环境变量

当前项目直接使用根目录 `.env` 或 `.env.local`。

当前初始化的核心变量包括：

- `NEXT_PUBLIC_APP_NAME`：应用名称
- `NEXT_PUBLIC_APP_SHORT_NAME`：大屏简称
- `NEXT_PUBLIC_APP_ENV`：当前环境标识
- `NEXT_PUBLIC_API_BASE_URL`：前端请求接口地址
- `SERVER_API_BASE_URL`：服务端接口地址
- `NEXT_PUBLIC_AMAP_KEY`：高德地图 Key
- `NEXT_PUBLIC_WEATHER_TEXT`：顶部天气文案
- `NEXT_PUBLIC_WEATHER_TEMPERATURE`：顶部温度文案
- `NEXT_PUBLIC_SCREEN_BASE_WIDTH`：大屏设计基线宽度
- `NEXT_PUBLIC_SCREEN_BASE_HEIGHT`：大屏设计基线高度
- `NEXT_PUBLIC_USE_MOCK`：是否启用 mock

页面和服务端组件读取环境变量时，直接使用 `process.env`，不额外封装环境读取层。

## 接口请求前置层

项目现在补了一套独立的请求基础层，位置在 `src/api/`：

- `config.js`：接口地址、超时、成功码、mock 开关
- `token.js`：本地 token 读写
- `errors.js`：统一请求错误对象
- `interceptors.js`：请求/响应/错误拦截器
- `http-client.js`：基于 `fetch` 的请求客户端
- `index.js`：统一导出入口

默认导出的请求客户端：

```js
import { httpClient } from "@/api";
```

基础用法：

```js
const userInfo = await httpClient.get("/api/user/profile");

const saveResult = await httpClient.post("/api/user/profile", {
  name: "张三",
});
```

如果后端返回格式是这类结构：

```js
{ code: 200, message: "ok", data: {...} }
```

或：

```js
{ success: true, data: {...} }
```

请求层会默认自动解包 `data`。

如果你后面需要介入特定业务接口，建议在 `src/api/` 下继续按模块新增 service 文件，例如：

```js
src/api/screen.js
src/api/device.js
src/api/follow-up.js
```

## 目录说明

```text
src/
  app/
    layout.js
    page.js
    not-found.js
    ui/
  shadcn/ui/
  lib/
  styles/
```

## 当前初始化内容

- 补齐了大屏项目首页基础壳子
- 已配置静态导出打包
- 补齐了基础 `next.config.mjs`
- 修正了 `shadcn/ui` 相关别名

## 打包输出

执行 `bun run build` 后，静态产物会输出到根目录 `out/`。
