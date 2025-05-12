import Link from 'next/link'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="max-w-xl mx-auto p-4">
        <nav className="flex justify-between mb-6">
          <Link href="/cards" className="text-blue-600 font-semibold">📄 View Cards</Link>
          <Link href="/add" className="text-green-600 font-semibold">➕ Add Card</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
