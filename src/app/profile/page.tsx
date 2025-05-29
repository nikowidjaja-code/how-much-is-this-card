"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Check, X } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastVoteAt: string | null;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session?.user?.email]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
      setUsername(data.name);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username }),
      });

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      // Update the session with the new username
      await update({ name: username });
      await fetchProfile();
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update username. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    router.push("/login");
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="space-y-6">
          {/* Profile Name */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Name
              </label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your username"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(profile.name);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-900">{profile.name}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <p
              className={`text-lg ${
                profile.role === "ADMIN" ? "text-indigo-600" : "text-gray-900"
              }`}
            >
              {profile.role === "ADMIN" ? "Admin" : "User"}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-lg text-gray-900">{profile.email}</p>
          </div>

          {/* Profile Creation Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <p className="text-lg text-gray-900">
              {formatDistanceToNow(new Date(profile.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {/* Last Vote Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Vote
            </label>
            <p className="text-lg text-gray-900">
              {profile.lastVoteAt
                ? formatDistanceToNow(new Date(profile.lastVoteAt), {
                    addSuffix: true,
                  })
                : "No votes yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
