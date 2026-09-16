import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { siteConfig } from "@/config/site";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.appName,
    template: `%s · ${siteConfig.appName}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-pcg-ink bg-pcg-canvas">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
