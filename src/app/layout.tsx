import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description:
    "Workplace social coordination - float ideas, hit the threshold, make it happen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <WorkspaceProvider>
              <TooltipProvider>
                {children}
                <Toaster richColors />
              </TooltipProvider>
            </WorkspaceProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
