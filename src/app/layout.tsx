import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Scholr",
  description: "Your academic resources, organised.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of unstyled content on dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('scholr-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
