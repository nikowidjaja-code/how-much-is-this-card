"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp } from "lucide-react";

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
    fetchVotingHistory();
  }, []);

  const fetchVotingHistory = async () => {
    try {
      const response = await fetch("/api/user/votes");
      if (!response.ok) {
        throw new Error("Failed to fetch voting history");
      }
      const data = await response.json();
      setVotes(data);
    } catch (err) {
      setError("Failed to load voting history");
    } finally {
      setIsLoading(false);
    }
  };

  const getValueColor = (value: number) => {
    if (value <= 0.25) return "text-emerald-600";
    if (value === 0.5) return "text-amber-600";
    if (value === 0.75) return "text-blue-600";
    if (value === 1) return "text-orange-600";
    return "text-rose-600";
  };

  const getValueLabel = (value: number) => {
    if (value <= 0.25) return "Low";
    if (value === 0.5) return "Mid";
    if (value === 0.75) return "High";
    if (value === 1) return "Very High";
    return "Extreme";
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-rose-600 mb-2">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">📝</div>
        <p className="text-gray-600">No voting history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <div
          key={vote.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">{vote.cardName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(vote.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getValueColor(
              vote.value
            )} bg-white border`}
          >
            {getValueLabel(vote.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
