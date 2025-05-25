"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { VotePanel } from "@/components/VotePanel";
import { log } from "console";

interface Card {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
  mostVotedValues?: number[];
}

interface DeleteState {
  id: string | null;
  isDeleting: boolean;
  error: string | null;
}

const getCardStyle = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1)
    return "bg-purple-50/30 border-purple-100 hover:bg-purple-50/50 hover:shadow-md transition-all duration-200";
  if (value === -1)
    return "bg-gray-50/30 border-gray-200 hover:bg-gray-50/50 hover:shadow-md transition-all duration-200";
  if (value <= 0.25)
    return "bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50 hover:shadow-md transition-all duration-200";
  if (value === 0.5)
    return "bg-amber-50/30 border-amber-100 hover:bg-amber-50/50 hover:shadow-md transition-all duration-200";
  if (value === 0.75)
    return "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200";
  if (value === 1)
    return "bg-orange-50/30 border-orange-100 hover:bg-orange-50/50 hover:shadow-md transition-all duration-200";
  return "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50 hover:shadow-md transition-all duration-200";
};

const getBadgeStyle = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1)
    return "bg-purple-100/80 text-purple-700 font-medium shadow-sm";
  if (value === -1) return "bg-gray-100/80 text-gray-700 font-medium shadow-sm";
  if (value <= 0.25)
    return "bg-emerald-100/80 text-emerald-700 font-medium shadow-sm";
  if (value === 0.5)
    return "bg-amber-100/80 text-amber-700 font-medium shadow-sm";
  if (value === 0.75)
    return "bg-blue-100/80 text-blue-700 font-medium shadow-sm";
  if (value === 1)
    return "bg-orange-100/80 text-orange-700 font-medium shadow-sm";
  return "bg-rose-100/80 text-rose-700 font-medium shadow-sm";
};

const getValueDisplay = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1) {
    return `Tied: ${mostVotedValues
      .map((v) => {
        if (v === 0.25) return "Low";
        if (v === 0.5) return "Mid";
        if (v === 1) return "High";
        return v.toFixed(2);
      })
      .join(" / ")}`;
  }
  if (value === -1) return "Unvoted";
  if (value === 0.25) return "Low";
  if (value === 0.5) return "Mid";
  if (value === 1) return "High";
  return value.toFixed(2);
};

export default function CardList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "value">(
    "updatedAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState<Card[]>([]);
  const [valueFilter, setValueFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    id: null,
    isDeleting: false,
    error: null,
  });
  const [votingStates, setVotingStates] = useState<{
    [key: string]: { isVoting: boolean; error: string | null };
  }>({});

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards?sortBy=${sortBy}&order=${order}`);
      const data = await res.json();
      if (data.error) {
        console.error("Error fetching cards:", data.error);
        setCards([]);
      } else {
        setCards(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [sortBy, order]);

  const handleVote = async (cardId: string, value: number) => {
    if (!session) {
      setVotingStates((prev) => ({
        ...prev,
        [cardId]: { isVoting: false, error: "Please sign in to vote" },
      }));
      return;
    }

    setVotingStates((prev) => ({
      ...prev,
      [cardId]: { isVoting: true, error: null },
    }));

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

      fetchCards();
    } catch (err) {
      setVotingStates((prev) => ({
        ...prev,
        [cardId]: {
          isVoting: false,
          error: err instanceof Error ? err.message : "Failed to vote",
        },
      }));
    } finally {
      setVotingStates((prev) => ({
        ...prev,
        [cardId]: { ...prev[cardId], isVoting: false },
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const deleteCard = async (id: string) => {
    setDeleteState({ id, isDeleting: true, error: null });

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete card");
      }

      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    } catch (error) {
      setDeleteState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete card. Please try again later.",
      }));
    } finally {
      setDeleteState({ id: null, isDeleting: false, error: null });
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchesValue =
      valueFilter === "all" ||
      card.value === valueFilter ||
      (valueFilter === 0 && card.value > 1);
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesValue && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="py-4 flex-none">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">All Cards</h1>
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="sm:hidden inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            aria-expanded={isStatsExpanded}
            aria-controls="stats-section"
          >
            <span>{isStatsExpanded ? "Hide Stats" : "Show Stats"}</span>
            <span
              className={`transform transition-transform duration-200 ${
                isStatsExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        </div>

        <div
          id="stats-section"
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 transition-all duration-300 ease-in-out ${
            isStatsExpanded
              ? "max-h-[200px] opacity-100"
              : "max-h-0 sm:max-h-[200px] opacity-0 sm:opacity-100 overflow-hidden sm:overflow-visible"
          }`}
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-gray-800">
              {cards.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Low Value</div>
            <div className="text-2xl font-bold text-emerald-600">
              {cards.filter((card) => card.value <= 0.25).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Mid Value</div>
            <div className="text-2xl font-bold text-amber-600">
              {cards.filter((card) => card.value === 0.5).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">High Value</div>
            <div className="text-2xl font-bold text-orange-600">
              {cards.filter((card) => card.value >= 0.75).length}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border border-gray-200 px-4 rounded-lg text-base w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              aria-label="Search cards"
            />
          </div>

          <select
            value={valueFilter}
            onChange={(e) => {
              const val = e.target.value;
              setValueFilter(val === "all" ? "all" : parseFloat(val));
            }}
            className="h-11 border border-gray-200 px-4 rounded-lg text-base w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            aria-label="Filter by value"
          >
            <option value="all">All Values</option>
            <option value={0.25}>Low</option>
            <option value={0.5}>Mid</option>
            <option value={1}>High</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "updatedAt" | "name" | "value")
            }
            className="h-11 border border-gray-200 px-4 rounded-lg text-base w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            aria-label="Sort by"
          >
            <option value="updatedAt">Recently Modified</option>
            <option value="name">Alphabetical</option>
            <option value="value">Value</option>
          </select>

          <button
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            className="h-11 border border-gray-200 px-4 rounded-lg text-base w-full sm:w-11 flex justify-center items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            title={order === "asc" ? "Ascending" : "Descending"}
            aria-label={`Sort ${order === "asc" ? "ascending" : "descending"}`}
          >
            {order === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="space-y-4" role="status" aria-label="Loading cards">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="border rounded-lg bg-white/30">
                  <div className="px-5 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
                        </div>
                        <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        <div className="flex gap-4">
                          <div className="h-5 w-12 bg-gray-200 rounded-md"></div>
                          <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border p-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">
              No cards found matching your criteria
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Try adjusting your search or filters
            </p>
            {session?.user?.role === "ADMIN" && (
              <Link
                href={`/add?name=${encodeURIComponent(searchQuery)}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
              >
                <span>➕</span>
                <span>Add New Card</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 relative">
            <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-transparent via-gray-100 to-transparent pointer-events-none"></div>
            <Accordion type="single" collapsible className="space-y-4 pb-4">
              {filteredCards.map((card) => (
                <AccordionItem
                  key={card.id}
                  value={card.id}
                  className={`border rounded-lg ${getCardStyle(
                    card.value,
                    card.mostVotedValues
                  )}`}
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline [&>svg]:ml-2 font-['Trebuchet_MS']">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-base font-medium text-gray-700 capitalize font-['Trebuchet_MS'] truncate max-w-[200px] sm:max-w-none">
                          {card.name
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-['Trebuchet_MS']">
                          <div
                            className={`font-medium px-3 py-1 rounded-full ${getBadgeStyle(
                              card.value,
                              card.mostVotedValues
                            )}`}
                          >
                            {getValueDisplay(card.value, card.mostVotedValues)}
                          </div>
                          <span className="font-normal">
                            {new Date(card.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        {session?.user?.role === "ADMIN" && (
                          <div className="flex gap-4">
                            <Link
                              href={`/edit/${card.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors font-['Trebuchet_MS'] hover:underline"
                              aria-label={`Edit ${card.name}`}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCard(card.id);
                              }}
                              onKeyPress={(e) => {
                                e.stopPropagation();
                                handleKeyPress(e, () => deleteCard(card.id));
                              }}
                              className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors font-['Trebuchet_MS'] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={
                                deleteState.isDeleting &&
                                deleteState.id === card.id
                              }
                              aria-label={`Delete ${card.name}`}
                            >
                              {deleteState.isDeleting &&
                              deleteState.id === card.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-50/50 py-3">
                    <VotePanel cardId={card.id} onVoteSuccess={fetchCards} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {deleteState.error && (
        <div className="fixed bottom-4 right-4 bg-rose-100 text-rose-700 px-4 py-2 rounded-lg shadow-lg border border-rose-200 animate-fade-in">
          {deleteState.error}
        </div>
      )}
    </div>
  );
}
