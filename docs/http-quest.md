使用 Cloudflare Pages Function 做同源反向代理，这个方向是对的，而且对当前项目来说也是最合适的方案。

原因很简单：当前站点通过 HTTPS 对外访问，但源接口仍是 HTTP。如果浏览器直接从 HTTPS 页面请求 HTTP 接口，会被 Mixed Content 拦截。把请求改成先到 Cloudflare Pages 的同源 `/api/*`，再由 Cloudflare 边缘节点去请求国内 HTTP 接口，就能绕过浏览器这层限制。

## 当前项目为什么适合这样做

这个仓库不是传统 Node 常驻服务，而是 Next 静态导出项目：

- `next.config.mjs` 里配置了 `output: "export"`
- 前端请求层已经抽出了统一配置
- 默认大屏接口路径本来就是 `/api/dashboard`

相关代码：

- [next.config.mjs](/Users/main/work/private-work/medical-consortium-dashboard/next.config.mjs)
- [src/api/config.js](/Users/main/work/private-work/medical-consortium-dashboard/src/api/config.js)
- [src/api/http-client.js](/Users/main/work/private-work/medical-consortium-dashboard/src/api/http-client.js)

这意味着我们不需要在项目里额外起一个 Node 中间层，只要把静态产物部署到 Cloudflare Pages，再补一个 Pages Function 处理 `/api/dashboard` 即可。

## 架构示意

```text
修改前：
浏览器 (HTTPS) ----X----> 国内接口 (HTTP)

修改后：
浏览器 (HTTPS) ---> Cloudflare Pages /api/dashboard (HTTPS)
                  ---> 国内接口 /api/dashboard (HTTP)
```

## 推荐落地方式

推荐只先代理当前真实需要的接口，也就是 `/api/dashboard`，不要一开始就写一个过于宽泛的全量透传代理。

好处：

- 路由更清晰
- 更容易控制鉴权头
- 更容易排查 Cloudflare 到源站之间的问题
- 后面如果要补弹窗明细接口，再按需增加对应文件即可

## 目录结构

在当前仓库根目录新增：

```text
functions/
└── api/
    └── dashboard.js
```

注意，这里说的是当前仓库根目录，不是“放 `index.html` 的目录”。本项目是 Next 工程，不是原生静态 HTML 项目。

## Function 示例

下面这份代码更贴合当前项目：

```js
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const targetBaseUrl =
    env.SERVER_API_ORIGIN || "http://121.40.242.155";
  const targetUrl = `${targetBaseUrl}/api/dashboard${url.search}`;

  const headers = new Headers();
  headers.set("Accept", "application/json");

  if (env.SERVER_API_ACCESS_TOKEN) {
    headers.set(
      "Authorization",
      `Bearer ${env.SERVER_API_ACCESS_TOKEN}`
    );
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      redirect: "manual"
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Proxy request failed",
        detail: String(error?.message || error)
      }),
      {
        status: 502,
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    );
  }
}
```

## 为什么这样写

这版实现有几个点比“泛化代理模板”更适合当前项目：

1. 只处理 `GET /api/dashboard`
当前首页聚合接口就是 `GET`，先把这条链路打通最稳。

2. 不依赖手动设置 `Host`
`Host` 属于受控头，很多运行时不建议手动改。除非已经确认源站必须按 `Host` 做特殊匹配，否则不要把它当成必需步骤。

3. Token 由 Cloudflare Function 注入
当前接口需要令牌，见 [docs/dashboard-api.md](/Users/main/work/private-work/medical-consortium-dashboard/docs/dashboard-api.md)。更安全的做法是把令牌放在 Cloudflare 环境变量里，由服务端补到请求头，不要直接暴露给浏览器。

4. 前端继续请求相对路径
这样浏览器看到的始终是同源 HTTPS 请求，不会触发 Mixed Content。

## Cloudflare 环境变量

建议在 Cloudflare Pages 项目里配置：

- `SERVER_API_ORIGIN=http://121.40.242.155`
- `SERVER_API_ACCESS_TOKEN=你的真实 token`

如果后端不是 `Authorization: Bearer xxx`，而是 `X-Api-Token`，那就把示例代码里的头部改成：

```js
headers.set("X-Api-Token", env.SERVER_API_ACCESS_TOKEN);
```

这一点要和 [docs/dashboard-api.md](/Users/main/work/private-work/medical-consortium-dashboard/docs/dashboard-api.md) 里实际使用的鉴权方式保持一致。

## 前端是否需要改

这个项目大概率不需要大改前端，因为当前默认接口路径本来就是：

```js
export const DEFAULT_DASHBOARD_API_PATH = "/api/dashboard";
```

只要你不要再把 `NEXT_PUBLIC_API_BASE_URL` 配成一个浏览器可见的 `http://...` 绝对地址，前端就会继续走同源 `/api/dashboard`。

建议检查部署配置：

- `NEXT_PUBLIC_API_BASE_URL` 留空，或者不配置
- `NEXT_PUBLIC_DASHBOARD_API_PATH` 使用默认值 `/api/dashboard`

如果前端配置成了绝对地址，比如：

```env
NEXT_PUBLIC_API_BASE_URL=http://121.40.242.155
```

那即使有 Function，浏览器仍然会直连 HTTP 源站，Mixed Content 还是会报。

## 部署后的请求链路

部署完成后，首页请求会变成：

1. 浏览器请求 `https://medical-5qv.pages.dev/api/dashboard`
2. Cloudflare Pages Function 收到请求
3. Function 在边缘侧请求 `http://121.40.242.155/api/dashboard`
4. Cloudflare 把响应回传给浏览器

浏览器视角里，全程都是 HTTPS 同源请求。

## 可能遇到的实际问题

这个方案能解决 Mixed Content，但不保证一定解决“请求失败”的全部问题。还要注意下面几类情况：

1. 源站不允许海外访问
Cloudflare 节点多数在海外。如果源站安全组、WAF 或运营商策略限制了海外访问，Function 会返回超时、502 或 5xx。

2. 源站鉴权方式不一致
如果后端实际要求的是 `X-Api-Token`，但 Function 发的是 `Authorization`，会拿到 401。

3. 源站返回的不是标准 JSON
如果后端报错页是 HTML，前端可能会在 JSON 解析阶段继续报错，需要另外做错误兜底。

4. 后续接口不止一个
如果除了 `/api/dashboard`，后面弹窗明细接口也要代理，可以继续在 `functions/api/` 下新增对应文件，而不是立刻切到一个超大号通配代理。

## 结论

结论是：

- 用 Cloudflare Pages Function 做反向代理，这个大方向是对的
- 对当前仓库，推荐做“固定路由代理”而不是一上来就做全量 `[path]` 透传
- Token 应该放在 Cloudflare 环境变量里，由 Function 补头
- 前端应继续请求同源 `/api/dashboard`，不要再暴露 `http://...` 源站地址

如果下一步要真正实施，可以按这个顺序推进：

1. 在仓库根目录添加 `functions/api/dashboard.js`
2. 在 Cloudflare Pages 配置 `SERVER_API_ORIGIN` 和 `SERVER_API_ACCESS_TOKEN`
3. 确认前端没有把 `NEXT_PUBLIC_API_BASE_URL` 指向 HTTP 源站
4. 部署后先直接访问 `/api/dashboard` 验证代理是否通
5. 最后再联调首页页面请求
