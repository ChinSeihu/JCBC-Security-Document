import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import { App, ConfigProvider } from "antd";
import jaJP from 'antd/locale/ja_JP';
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Management Dashboard",
  description: "Next.js Management System",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('RootLayout>>>>>')
  return (
    <ConfigProvider locale={jaJP}>
      <Providers>
        <html lang="en">
          <body className={inter.className}>
              <App style={{height: '100%' }}>{children}</App>
          </body>
        </html>
      </Providers>
    </ConfigProvider >
  );
}
