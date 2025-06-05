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
      <div className="min-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4">
            {/* Mobile Skeleton */}
            <div className="md:hidden">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
                {/* Banner Skeleton */}
                <div className="h-32 w-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>

                {/* Profile Content Skeleton */}
                <div className="flex flex-col items-center px-6 pb-6">
                  {/* Profile Image Skeleton */}
                  <div className="flex flex-col items-center -mt-14 mb-4">
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 animate-pulse"></div>
                  </div>

                  {/* Name Skeleton */}
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>

                  {/* ID Skeleton */}
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>

                  {/* Tabs Skeleton */}
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 mb-4">
                    <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>

                  {/* Profile Info Skeleton */}
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Skeleton */}
            <div className="hidden md:block">
              {/* Top Section - Profile Header */}
              <div className="flex items-center gap-8 mb-12 bg-gradient-to-r from-slate-50 to-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                {/* Profile Image Skeleton */}
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 animate-pulse"></div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-6">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Stats */}
                <div className="col-span-3">
                  <div className="sticky top-6">
                    <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                      <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Voting History */}
                <div className="col-span-9">
                  <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100"
                        >
                          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))}
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
    <div className="min-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden relative">
              {/* Banner */}
              <div className="h-32 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 opacity-90" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-10" />
              </div>
              {/* Profile Content */}
              <div className="flex flex-col items-center px-6 pb-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center -mt-14 mb-4">
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
                <div className="flex items-center gap-2 text-sm text-gray-500 font-mono mb-4">
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
                        <Shield className={`w-4 h-4 text-indigo-600`} />
                        <p className={`text-sm text-indigo-600`}>
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
                            ? formatDistanceToNow(
                                new Date(profile.lastVoteAt),
                                {
                                  addSuffix: true,
                                }
                              )
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

          {/* Desktop Open Layout */}
          <div className="hidden md:block">
            {/* Top Section - Profile Header */}
            <div className="flex items-center gap-8 mb-12 bg-gradient-to-r from-slate-50 to-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
              <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-[0_4px_12px_-2px_rgba(0,0,0,0.1)]">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || "Profile picture"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-medium text-gray-500">
                      {profile.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-3 py-2 text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold w-full"
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
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900">
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
                    </>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
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
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 text-indigo-600`} />
                    <p className={`text-sm text-indigo-600`}>
                      {profile.role === "ADMIN" ? "Admin" : "User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Stats */}
              <div className="col-span-3">
                <div className="sticky top-6">
                  <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Activity
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Member Since
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {formatDistanceToNow(new Date(profile.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Last Vote</p>
                        <p className="text-base font-medium text-gray-900">
                          {profile.lastVoteAt
                            ? formatDistanceToNow(
                                new Date(profile.lastVoteAt),
                                {
                                  addSuffix: true,
                                }
                              )
                            : "No votes yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Voting History */}
              <div className="col-span-9">
                <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Voting History
                  </h2>
                  <VotingHistory hideTitle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
