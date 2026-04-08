import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CorePoint",
  description: "認知特性ベクトルによるシンクロ率アセスメントシステム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base-50 text-base-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
