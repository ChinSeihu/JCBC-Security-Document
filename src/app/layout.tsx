import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import "antd/dist/reset.css";
import { App, ConfigProvider } from "antd";
import jaJP from 'antd/locale/ja_JP';

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
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <html lang="en">
          <body className={inter.className}>
              <App style={{height: '100%' }}>{children}</App>
          </body>
        </html>
      </ClerkProvider>
    </ConfigProvider >
  );
}
