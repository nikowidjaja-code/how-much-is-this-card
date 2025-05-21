import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="max-w-3xl mx-auto flex justify-between p-4 text-lg font-semibold">
      <Link href="/cards" className="hover:text-blue-600">
        🃏 Cards
      </Link>
      <Link href="/add" className="hover:text-green-600">
        ➕ Add
      </Link>
    </nav>
  );
} 