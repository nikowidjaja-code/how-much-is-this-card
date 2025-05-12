import 'styles/globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Card Vault',
  description: 'Track card values in the Cards universe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <header className="bg-white shadow sticky top-0 z-10">
          <nav className="max-w-3xl mx-auto flex justify-between p-4 text-lg font-semibold">
            <Link href="/cards" className="hover:text-blue-600">🃏 Cards</Link>
            <Link href="/add" className="hover:text-green-600">➕ Add</Link>
          </nav>
        </header>
        <main className="max-w-3xl mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  )
}
