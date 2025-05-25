import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface VotePanelProps {
  cardId: string;
  onVoteSuccess?: () => void;
}

interface VoteDistribution {
  [key: number]: number;
}

interface Vote {
  user: {
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  value: number;
  updatedAt: string;
  weightedValue: number;
  roleWeight: number;
  timeWeight: number;
  daysSinceVote: number;
}

interface VoteData {
  voteDistribution: VoteDistribution;
  rawVoteCounts: VoteDistribution;
  voteDetails: Vote[];
  finalValue: number;
  mostVotedValues: number[];
  maxWeightedSum: number;
  voteCount: number;
  weightedVoteCount: number;
}

export function VotePanel({ cardId, onVoteSuccess }: VotePanelProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch(`/api/cards/${cardId}/vote`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch votes");
        }

        const data = await response.json();
        setVoteData(data);
      } catch (err) {
        console.error("Error fetching votes:", err);
      }
    };

    fetchVotes();
  }, [cardId]);

  const handleVote = async (value: number) => {
    if (!session) {
      setError("Please sign in to vote");
      return;
    }

    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/${cardId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to vote");
      }

      const data = await response.json();
      setVoteData(data);
      toast({
        title: "Vote recorded",
        description: `Your vote of ${value} has been recorded.`,
      });
      onVoteSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

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

  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const totalVotes = voteData
    ? Object.values(voteData.voteDistribution).reduce(
        (sum, count) => sum + count,
        0
      )
    : 0;

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getVotePercentage = (value: number, totalVotes: number) => {
    const count = Object.entries(voteData.voteDistribution)
      .filter(([v]) => Number(v) === value)
      .reduce((sum, [_, count]) => sum + count, 0);
    return Math.round((count / totalVotes) * 100);
  };

  const getTimeWeightExplanation = (daysSinceVote: number) => {
    if (daysSinceVote <= 7) {
      return "First week: 1.0 → 0.5";
    } else if (daysSinceVote <= 14) {
      return "Second week: 0.5 → 0.25";
    } else if (daysSinceVote <= 30) {
      return "2-4 weeks: 0.25 → 0.1";
    } else {
      return "After 1 month: 0.1";
    }
  };

  return (
    <div className="px-8 py-2 space-y-3">
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-md font-['Trebuchet_MS']">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => handleVote(0.25)}
          disabled={isVoting}
          variant="outline"
          size="sm"
          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-['Trebuchet_MS']"
        >
          Low (0.25)
        </Button>
        <Button
          onClick={() => handleVote(0.5)}
          disabled={isVoting}
          variant="outline"
          size="sm"
          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 font-['Trebuchet_MS']"
        >
          Mid (0.5)
        </Button>
        <Button
          onClick={() => handleVote(1.0)}
          disabled={isVoting}
          variant="outline"
          size="sm"
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 font-['Trebuchet_MS']"
        >
          High (1.0)
        </Button>
      </div>

      {voteData && totalVotes > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4 text-sm text-gray-600 font-['Trebuchet_MS']">
            <p className="mb-2">Vote weights:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Admin votes: 5x weight</li>
              <li>Time decay: {getTimeWeightExplanation(0)}</li>
            </ul>
          </div>

          <div className="space-y-3">
            {Object.entries(voteData.voteDistribution).map(([value, count]) => {
              const percentage = calculatePercentage(count, totalVotes);
              const rawCount = voteData.rawVoteCounts[Number(value)] || 0;
              const votesForValue = voteData.voteDetails.filter(
                (v) => v.value === Number(value)
              );
              const avgTimeWeight =
                votesForValue.reduce((sum, v) => sum + v.timeWeight, 0) /
                votesForValue.length;
              const avgRoleWeight =
                votesForValue.reduce((sum, v) => sum + v.roleWeight, 0) /
                votesForValue.length;
              const avgWeight = avgTimeWeight * avgRoleWeight;

              return (
                <div key={value} className="space-y-1">
                  <div className="flex justify-between text-sm font-['Trebuchet_MS']">
                    <span className="text-gray-700">
                      {getVoteLabel(Number(value))}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{percentage}%</span>
                      <span className="text-xs text-gray-400">
                        ({rawCount} votes)
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-gray-400 cursor-help">
                              (Avg: {avgWeight.toFixed(2)}x)
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="text-xs p-2">
                            <p>Average weights:</p>
                            <ul className="list-disc list-inside mt-1">
                              <li>Time: {avgTimeWeight.toFixed(2)}x</li>
                              <li>Role: {avgRoleWeight.toFixed(1)}x</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getVoteColor(
                        Number(value)
                      )} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {voteData.voteDetails.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-700 font-['Trebuchet_MS']">
                Votes:
              </div>
              <div className="flex flex-wrap gap-2">
                {voteData.voteDetails.map((vote, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="relative group focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-full overflow-hidden border-2 ${
                              vote.value === 0.25
                                ? "border-emerald-500"
                                : vote.value === 0.5
                                ? "border-amber-500"
                                : "border-blue-500"
                            }`}
                          >
                            {vote.user.image ? (
                              <Image
                                src={vote.user.image}
                                alt={vote.user.name}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                {vote.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        className="font-['Trebuchet_MS'] p-4 space-y-2"
                        side="bottom"
                        align="center"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                              vote.value === 0.25
                                ? "border-emerald-500"
                                : vote.value === 0.5
                                ? "border-amber-500"
                                : "border-blue-500"
                            }`}
                          >
                            {vote.user.image ? (
                              <Image
                                src={vote.user.image}
                                alt={vote.user.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                {vote.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{vote.user.name}</p>
                            <p className="text-xs text-gray-500">
                              {vote.user.email}
                            </p>
                            {vote.user.role === "ADMIN" && (
                              <span className="text-xs text-indigo-600">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              vote.value === 0.25
                                ? "bg-emerald-500"
                                : vote.value === 0.5
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              vote.value === 0.25
                                ? "text-emerald-600"
                                : vote.value === 0.5
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}
                          >
                            {getVoteLabel(vote.value)}
                          </span>
                          <span className="text-gray-500">
                            (Weight: {vote.weightedValue.toFixed(2)})
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatTimeAgo(vote.updatedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vote.roleWeight}x role,{" "}
                            {vote.timeWeight.toFixed(2)}x time
                            <div className="mt-1 text-gray-400">
                              {getTimeWeightExplanation(vote.daysSinceVote)}
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
