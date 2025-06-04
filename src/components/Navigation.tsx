"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "loading";
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignIn = () => {
    router.push("/login");
  };

  const handleSignOut = () => {
    setIsTransitioning(true);
    signOut();
  };

  const handleProfileClick = () => {
    if (session?.user?.id) {
      router.push(`/profile/${session.user.id}`);
    }
    setShowDropdown(false);
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/cards");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="max-w-3xl mx-auto flex justify-between items-center px-2 sm:px-4 py-3 text-base sm:text-lg font-semibold">
      <div className="flex gap-3 sm:gap-6">
        {pathname === "/login" ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Cards</span>
          </button>
        ) : (
          <>
            <Link href="/cards" className="hover:text-blue-600">
              🃏 Cards
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link href="/add" className="hover:text-green-600">
                ➕ Add
              </Link>
            )}
          </>
        )}
      </div>
      <div>
        {isLoading && !isTransitioning ? (
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        ) : isTransitioning ? (
          <div className="text-sm text-gray-500">Redirecting...</div>
        ) : !session && pathname !== "/login" ? (
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
        ) : session ? (
          <div className="flex items-center gap-2">
            <div ref={dropdownRef} className="relative">
              {session.user?.image ? (
                <div
                  onClick={toggleDropdown}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-1 ring-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile picture"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  onClick={toggleDropdown}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center ring-1 ring-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                    <p className="text-xs mt-1">
                      <span
                        className={`${
                          session.user?.role === "ADMIN"
                            ? "text-indigo-600"
                            : "text-gray-500"
                        }`}
                      >
                        {session.user?.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
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
          </div>
        ) : null}
      </div>
    </nav>
  );
}
