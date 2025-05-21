"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isLoading = status === "loading";

  const handleSignIn = () => {
    setIsTransitioning(true);
    signIn();
  };

  const handleSignOut = () => {
    setIsTransitioning(true);
    signOut();
  };

  return (
    <nav className="max-w-3xl mx-auto flex justify-between items-center px-2 sm:px-4 py-3 text-base sm:text-lg font-semibold">
      <div className="flex gap-3 sm:gap-6">
        <Link href="/cards" className="hover:text-blue-600">
          🃏 Cards
        </Link>
        <Link href="/add" className="hover:text-green-600">
          ➕ Add
        </Link>
      </div>
      <div>
        {isLoading && !isTransitioning ? (
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        ) : isTransitioning ? (
          <div className="text-sm text-gray-500">Redirecting...</div>
        ) : !session ? (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {session.user?.image ? (
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-1 ring-gray-200">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile picture"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center ring-1 ring-gray-200">
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              {showTooltip && session.user?.name && (
                <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
                  {session.user.name}
                </div>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
