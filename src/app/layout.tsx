import type { Metadata } from "next";
import { Roboto_Serif, Space_Grotesk, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const robotoSerif = Roboto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stratum Live",
  description: "Real-time collaborative prompt engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${robotoSerif.variable} ${spaceGrotesk.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className={`${robotoSerif.variable} ${spaceGrotesk.variable} ${robotoMono.variable} min-h-full flex flex-col font-sans`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
