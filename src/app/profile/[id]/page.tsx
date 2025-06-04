"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Pencil,
  Check,
  X,
  Shield,
  Calendar,
  ThumbsUp,
  Copy,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import VotingHistory from "@/components/VotingHistory";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  image: string | null;
  createdAt: string;
  lastVoteAt: string | null;
}

type Tab = "profile" | "history";

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [copied, setCopied] = useState(false);

  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
      setEditedName(data.name || "");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile((prev) => prev && { ...prev, name: data.user.name });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
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
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
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
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
            {/* Banner */}
            <div className="h-28 w-full bg-gray-200" />
            {/* Profile Image - overlaps banner */}
            <div className="flex flex-col items-center -mt-14 mb-2">
              <div className="relative w-28 h-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || "Profile picture"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-3xl font-medium text-gray-500">
                      {profile.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Profile Info */}
            <div className="flex flex-col items-center px-6 pb-6">
              {/* Name and Edit */}
              {isEditing ? (
                <div className="w-full flex justify-center mb-2">
                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center w-full"
                      placeholder="Enter your name"
                      maxLength={24}
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(profile.name || "");
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 text-center">
                    {profile.name}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                      title="Edit name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {/* ID and Copy */}
              <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-2">
                <span>ID: {profile.id}</span>
                <button
                  onClick={() => copyToClipboard(profile.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Tabs */}
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 mb-4">
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
              {/* Tab Content */}
              {activeTab === "profile" ? (
                <div className="w-full">
                  <div className="py-2">
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
                  <div className="border-t border-gray-100" />
                  <div className="py-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joined
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(profile.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100" />
                  <div className="py-2">
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
                <div className="w-full">
                  <VotingHistory hideTitle />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
