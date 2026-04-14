import "@/styles/globals.css";

export const metadata = {
  title: {
    default: "医共体管理平台",
    template: "%s | 医共体管理平台"
  },
  description: "医共体管理平台大屏",
  applicationName: "医共体管理平台"
};

export const viewport = {
  themeColor: "#031525",
  colorScheme: "dark"
};

/**
 * 根布局负责注入全局字体、样式和元信息。
 */
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
