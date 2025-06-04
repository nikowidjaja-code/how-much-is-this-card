"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      router.replace(`/profile/${session.user.id}`);
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session?.user?.id, router]);

  // Return null or a loading state while redirecting
  return null;
}
