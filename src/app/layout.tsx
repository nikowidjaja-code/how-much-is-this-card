import "styles/globals.css";
import Link from "next/link";
import Head from "next/head";

export const metadata = {
  title: "CUE Card Vault",
  description:
    "Track card values in the Cards, the Universe, and Everything Game.",
  keywords: "cards, value tracker, CUE, card game, universe",
  author: "Niko",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />

        <link rel="icon" href="/favicon.ico" sizes="any" />

        <title>{metadata.title}</title>
      </Head>
      <body className="bg-gray-100 text-gray-900">
        <header className="bg-white shadow sticky top-0 z-10">
          <nav className="max-w-3xl mx-auto flex justify-between p-4 text-lg font-semibold">
            <Link href="/cards" className="hover:text-blue-600">
              🃏 Cards
            </Link>
            <Link href="/add" className="hover:text-green-600">
              ➕ Add
            </Link>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}
