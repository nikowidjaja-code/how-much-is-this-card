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

export default function VotingHistory() {
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
      case 1:
        return "High";
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
      case 1:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
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
    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
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
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {getVoteLabel(vote.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
