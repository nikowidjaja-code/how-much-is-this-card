import "@/styles/globals.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import LandscapeWarning from "@/components/LandscapeWarning";

export const metadata = {
  title: "How Much is This Card?",
  description:
    "Vote card values in the Cards, the Universe, and Everything Game!",
  keywords: "cards, value tracker, CUE, card game, universe, vote",
  author: "Niko",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="h-full bg-gray-100 text-gray-900 font-sans">
        <Providers>
          <LandscapeWarning />
          <div className="h-full flex flex-col">
            <header className="bg-white shadow sticky top-0 z-10">
              <Navigation />
            </header>
            <main className="flex-1 overflow-hidden max-w-3xl mx-auto w-full px-4 sm:px-6">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
