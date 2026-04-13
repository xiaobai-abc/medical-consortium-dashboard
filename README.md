# 医共体管理平台

## 项目定位

当前项目基于 `Next.js App Router`，用于承载医共体管理平台大屏应用。

## 启动方式

```bash
bun install
bun run dev
```

## 环境变量

项目根目录已提供 `.env.example`，建议按需补充为本地环境文件使用。

当前初始化的核心变量包括：

- `NEXT_PUBLIC_APP_NAME`：应用名称
- `NEXT_PUBLIC_APP_SHORT_NAME`：大屏简称
- `NEXT_PUBLIC_APP_ENV`：当前环境标识
- `NEXT_PUBLIC_API_BASE_URL`：前端请求接口地址
- `SERVER_API_BASE_URL`：服务端接口地址
- `NEXT_PUBLIC_AMAP_KEY`：高德地图 Key
- `NEXT_PUBLIC_SCREEN_BASE_WIDTH`：大屏设计基线宽度
- `NEXT_PUBLIC_SCREEN_BASE_HEIGHT`：大屏设计基线高度
- `NEXT_PUBLIC_USE_MOCK`：是否启用 mock

## 目录说明

```text
src/
  app/
    layout.js
    page.js
    loading.js
    not-found.js
    ui/
    components/
    modules/
  components/ui/
  lib/
  styles/
```

## 当前初始化内容

- 补齐了大屏项目首页骨架
- 补齐了公共环境变量读取入口
- 补齐了基础 `next.config.mjs`
- 修正了 `shadcn/ui` 相关别名
