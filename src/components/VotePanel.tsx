import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface VotePanelProps {
  cardId: string;
  onVoteSuccess?: () => void;
}

export function VotePanel({ cardId, onVoteSuccess }: VotePanelProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to vote");
      }

      onVoteSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setIsVoting(false);
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
    </div>
  );
}
