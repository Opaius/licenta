import type { Metadata } from "next";
import { Roboto_Serif, Space_Grotesk, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import BoneyardProvider from "@/components/BoneyardProvider";
import { getToken } from "@/lib/auth-server";
import { Toaster } from "sonner";

const robotoSerif = Roboto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Stratum Live",
  description: "Real-time collaborative prompt engineering",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  return (
    <html
      lang="en"
      data-theme="dark"
      className="h-full antialiased"
    >
      <body className={`${robotoSerif.variable} ${spaceGrotesk.variable} ${robotoMono.variable} min-h-full flex flex-col font-sans`}>
        <ConvexClientProvider initialToken={token}>
          <BoneyardProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </BoneyardProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
