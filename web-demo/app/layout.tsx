import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "STAR 面试教练｜AI 产品经理故事挖掘";
  const description = "通过动态追问，把真实项目经历整理为具体、有数据、有个人贡献的 STAR 面试故事。";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: image, width: 1734, height: 907, alt: "STAR 面试教练" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
