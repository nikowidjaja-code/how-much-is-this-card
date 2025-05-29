"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Check, X, Shield, Clock, ThumbsUp } from "lucide-react";
import Image from "next/image";
import VotingHistory from "@/components/VotingHistory";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastVoteAt: string | null;
}

type Tab = "profile" | "history";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchProfile();
    }
  }, [status, session?.user?.email]);

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

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50">
        <div className="py-6">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Tabs Skeleton */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                    <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>

                {/* Profile Content Skeleton */}
                <div className="space-y-6">
                  {/* Profile Image and Username */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Role Field */}
                  <div>
                    <div className="h-4 w-12 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Member Since Field */}
                  <div>
                    <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Last Vote Field */}
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50">
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "profile"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === "history"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Voting History
                  </button>
                </div>
              </div>

              {activeTab === "profile" ? (
                <div className="space-y-6">
                  {/* Profile Image and Username */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-100 shadow-sm">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={profile.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-2xl font-medium text-gray-500">
                              {profile.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-full">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white bg-opacity-90 rounded-full shadow-sm">
                          <Pencil className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your name"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSubmit}
                              disabled={isLoading}
                              className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setUsername(profile.name);
                              }}
                              className="flex-1 h-9 flex items-center justify-center gap-1.5 px-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-semibold text-gray-900">
                            {profile.name}
                          </h1>
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

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield
                        className={`w-4 h-4 ${
                          profile.role === "ADMIN"
                            ? "text-indigo-600"
                            : "text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          profile.role === "ADMIN"
                            ? "text-indigo-600"
                            : "text-gray-900"
                        }`}
                      >
                        {profile.role === "ADMIN" ? "Admin" : "User"}
                      </p>
                    </div>
                  </div>

                  {/* Member Since Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joined
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(profile.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Last Vote Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Vote
                    </label>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-900">
                        {profile.lastVoteAt
                          ? formatDistanceToNow(new Date(profile.lastVoteAt), {
                              addSuffix: true,
                            })
                          : "No votes yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <VotingHistory />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
