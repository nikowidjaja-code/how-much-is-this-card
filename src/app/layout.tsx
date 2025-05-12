// src/app/layout.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Card Vault',
  description: 'Track the value of cards in your universe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-white shadow sticky top-0 z-10">
          <nav className="max-w-xl mx-auto flex justify-between p-4 text-sm font-semibold">
            <Link href="/cards" className="hover:text-blue-600">🃏 Cards</Link>
            <Link href="/add" className="hover:text-green-600">➕ Add Card</Link>
          </nav>
        </header>
        <main className="max-w-xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
