import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import "antd/dist/reset.css";
import { App } from "antd";

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <App style={{height: '100%'}}>{children}</App>
        </body>
      </html>
    </ClerkProvider>
  );  
}
