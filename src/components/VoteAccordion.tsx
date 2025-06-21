"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface VoteAccordionProps {
  cardId: string;
  currentValue: number;
  onVoteSuccess?: () => void;
}

export default function VoteAccordion({
  cardId,
  currentValue,
  onVoteSuccess,
}: VoteAccordionProps) {
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
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white rounded-lg border border-gray-100 shadow-sm"
    >
      <AccordionItem value="vote" className="border-none">
        <AccordionTrigger className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 font-medium hover:no-underline">
          Vote Value
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleVote(0.25)}
                disabled={isVoting}
                variant="outline"
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              >
                Low (0.25)
              </Button>
              <Button
                onClick={() => handleVote(0.5)}
                disabled={isVoting}
                variant="outline"
                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
              >
                Mid (0.5)
              </Button>
              <Button
                onClick={() => handleVote(0.75)}
                disabled={isVoting}
                variant="outline"
                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
              >
                High (0.75)
              </Button>
              <Button
                onClick={() => handleVote(1.0)}
                disabled={isVoting}
                variant="outline"
                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              >
                1mm+ (1.0)
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
