"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="max-w-3xl mx-auto flex justify-between items-center p-4 text-lg font-semibold">
      <div className="flex gap-6">
        <Link href="/cards" className="hover:text-blue-600">
          🃏 Cards
        </Link>
        <Link href="/add" className="hover:text-green-600">
          ➕ Add
        </Link>
      </div>
      <div>
        {!session ? (
          <button
            onClick={() => signIn()}
            className="text-sm text-blue-500 hover:underline"
          >
            Sign In
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="text-sm text-red-500 hover:underline"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
