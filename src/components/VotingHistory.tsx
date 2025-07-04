"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";
import { format } from "date-fns";

interface Vote {
  id: string;
  cardId: string;
  cardName: string;
  value: number;
  createdAt: string;
}

interface VotingHistoryProps {
  hideTitle?: boolean;
}

export default function VotingHistory({ hideTitle }: VotingHistoryProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch("/api/user/votes");
        if (!response.ok) {
          throw new Error("Failed to fetch votes");
        }
        const data = await response.json();
        setVotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch votes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, []);

  const getVoteLabel = (value: number) => {
    switch (value) {
      case 0.25:
        return "Low";
      case 0.5:
        return "Mid";
      case 0.75:
        return "High";
      case 1:
        return "1mm+";
      default:
        return value.toString();
    }
  };

  const getVoteColor = (value: number) => {
    switch (value) {
      case 0.25:
        return "bg-emerald-500";
      case 0.5:
        return "bg-amber-500";
      case 0.75:
        return "bg-orange-500";
      case 1:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-48"></div>
                <div className="h-3 bg-gray-100 rounded w-32"></div>
              </div>
              <div className="h-5 bg-gray-100 rounded-full w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-md">
        {error}
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-8">
        <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No votes yet</p>
      </div>
    );
  }

  return (
    <div>
      {!hideTitle && (
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-700 border-b border-gray-200 pb-2 text-center">
            Voting Activity
          </h3>
        </div>
      )}
      <div className="max-h-[25vh] overflow-y-auto pr-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        {votes.map((vote) => (
          <div
            key={vote.id}
            className="py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{vote.cardName}</h3>
                <p className="text-xs text-gray-400">
                  {format(new Date(vote.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vote.value === 0.25
                    ? "bg-emerald-50 text-emerald-700"
                    : vote.value === 0.5
                    ? "bg-amber-50 text-amber-700"
                    : vote.value === 0.75
                    ? "bg-orange-50 text-orange-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {getVoteLabel(vote.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
