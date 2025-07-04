"use client";
import { useEffect, useState, useCallback } from "react";
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
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Card {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
  mostVotedValues?: number[];
  lastVoteTime?: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DeleteState {
  id: string | null;
  isDeleting: boolean;
  error: string | null;
}

interface CardStats {
  totalCards: number;
  unvaluedCards: number;
  lowValueCards: number;
  midValueCards: number;
  highValueCards: number;
  oneMMPlusCards: number;
}

const getCardStyle = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1)
    return "bg-purple-50/30 border-purple-100 hover:bg-purple-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value === -1)
    return "bg-gray-50/30 border-gray-200 hover:bg-gray-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value === 0.25)
    return "bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value === 0.5)
    return "bg-amber-50/30 border-amber-100 hover:bg-amber-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value === 0.75)
    return "bg-orange-50/30 border-orange-100 hover:bg-orange-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value === 1)
    return "bg-red-50/30 border-red-100 hover:bg-red-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  if (value > 1)
    return "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
  return "bg-gray-50/30 border-gray-200 hover:bg-gray-50/50 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-200";
};

const getBadgeStyle = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1)
    return "bg-purple-100/80 text-purple-700 font-medium shadow-sm";
  if (value === -1) return "bg-gray-100/80 text-gray-700 font-medium shadow-sm";
  if (value === 0.25)
    return "bg-emerald-100/80 text-emerald-700 font-medium shadow-sm";
  if (value === 0.5)
    return "bg-amber-100/80 text-amber-700 font-medium shadow-sm";
  if (value === 0.75)
    return "bg-orange-100/80 text-orange-700 font-medium shadow-sm";
  if (value === 1) return "bg-red-100/80 text-red-700 font-medium shadow-sm";
  if (value > 1) return "bg-rose-100/80 text-rose-700 font-medium shadow-sm";
  return "bg-gray-100/80 text-gray-700 font-medium shadow-sm";
};

const getValueDisplay = (value: number, mostVotedValues?: number[]) => {
  if (value === -1 && mostVotedValues && mostVotedValues.length > 1) {
    return mostVotedValues
      .map((v) => {
        if (v === 0.25) return "Low";
        if (v === 0.5) return "Mid";
        if (v === 0.75) return "High";
        if (v === 1) return "1mm+";
        return v.toFixed(2);
      })
      .join(" / ");
  }
  if (value === -1) return "Unvoted";
  if (value === 0.25) return "Low";
  if (value === 0.5) return "Mid";
  if (value === 0.75) return "High";
  if (value === 1) return "1mm+";
  return value.toFixed(2);
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};

export default function CardList() {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "value">(
    "updatedAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState<Card[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [valueFilter, setValueFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [cardStats, setCardStats] = useState<CardStats>({
    totalCards: 0,
    unvaluedCards: 0,
    lowValueCards: 0,
    midValueCards: 0,
    highValueCards: 0,
    oneMMPlusCards: 0,
  });
  const [deleteState, setDeleteState] = useState<DeleteState>({
    id: null,
    isDeleting: false,
    error: null,
  });
  const [votingStates, setVotingStates] = useState<{
    [key: string]: { isVoting: boolean; error: string | null };
  }>({});

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchCardStats = useCallback(async () => {
    try {
      const res = await fetch("/api/cards/stats");
      const data = await res.json();

      if (data.error) {
        console.error("Error fetching card stats:", data.error);
      } else {
        setCardStats(data);
      }
    } catch (error) {
      console.error("Error fetching card stats:", error);
    }
  }, []);

  const fetchCards = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          sortBy,
          order,
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (debouncedSearchQuery.trim()) {
          params.append("search", debouncedSearchQuery.trim());
        }

        if (valueFilter !== "all") {
          params.append("valueFilter", valueFilter.toString());
        }

        const res = await fetch(`/api/cards?${params}`);
        const data = await res.json();

        if (data.error) {
          console.error("Error fetching cards:", data.error);
          setCards([]);
          setPagination({
            page: 1,
            limit: pagination.limit,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else {
          setCards(data.cards || []);
          setPagination(
            data.pagination || {
              page: 1,
              limit: pagination.limit,
              totalCount: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        setCards([]);
        setPagination({
          page: 1,
          limit: pagination.limit,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [sortBy, order, debouncedSearchQuery, valueFilter, pagination.limit]
  );

  useEffect(() => {
    fetchCards(1);
    fetchCardStats();
  }, [fetchCards, fetchCardStats]);

  // Reset to page 1 when valueFilter changes
  useEffect(() => {
    fetchCards(1);
  }, [valueFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCards(newPage);
    }
  };

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

      fetchCards(pagination.page);
      fetchCardStats();
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

      // Refresh the current page after deletion
      fetchCards(pagination.page);
      fetchCardStats();
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
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-4 mb-6 ${
            isStatsExpanded
              ? "max-h-[200px] opacity-100"
              : "max-h-0 sm:max-h-[200px] opacity-0 sm:opacity-100 overflow-hidden sm:overflow-visible"
          }`}
        >
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-base sm:text-xl font-bold text-gray-800">
              {cardStats.totalCards}
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">Unvalued</div>
            <div className="text-base sm:text-xl font-bold text-gray-600">
              {cardStats.unvaluedCards}
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">Low</div>
            <div className="text-base sm:text-xl font-bold text-emerald-600">
              {cardStats.lowValueCards}
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">Mid</div>
            <div className="text-base sm:text-xl font-bold text-amber-600">
              {cardStats.midValueCards}
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">High</div>
            <div className="text-base sm:text-xl font-bold text-orange-600">
              {cardStats.highValueCards}
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-100 text-center">
            <div className="text-xs text-gray-500">1mm+</div>
            <div className="text-base sm:text-xl font-bold text-red-600">
              {cardStats.oneMMPlusCards}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
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
            <option value={0.75}>High</option>
            <option value={1}>1mm+</option>
          </select>

          <div className="flex gap-2 sm:gap-0">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "updatedAt" | "name" | "value")
              }
              className="h-11 border border-gray-200 px-4 rounded-lg text-base flex-1 sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              aria-label="Sort by"
            >
              <option value="updatedAt">Recently Voted</option>
              <option value="name">Alphabetical</option>
              <option value="value">Value</option>
            </select>

            <button
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
              className="h-11 border border-gray-200 px-3 sm:px-4 rounded-lg text-base w-12 sm:w-11 flex justify-center items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              title={order === "asc" ? "Ascending" : "Descending"}
              aria-label={`Sort ${
                order === "asc" ? "ascending" : "descending"
              }`}
            >
              {order === "asc" ? "▲" : "▼"}
            </button>
          </div>
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
        ) : cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border p-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">
              No cards found matching your criteria
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Try adjusting your search or filters
            </p>
            <Link
              href={`/add?name=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>➕</span>
              <span>Add New Card</span>
            </Link>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 relative">
            <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-transparent via-gray-100 to-transparent pointer-events-none"></div>
            <Accordion type="single" collapsible className="space-y-4 pb-4">
              {cards.map((card) => (
                <AccordionItem
                  key={card.id}
                  value={card.id}
                  className={`border rounded-lg relative ${getCardStyle(
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

                      <div className="flex items-center w-full sm:w-auto">
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-['Trebuchet_MS'] w-full justify-end sm:justify-end sm:w-auto">
                          <div
                            className={`font-medium px-3 py-1 rounded-full flex items-center ${getBadgeStyle(
                              card.value,
                              card.mostVotedValues
                            )}`}
                          >
                            {getValueDisplay(card.value, card.mostVotedValues)}
                          </div>
                          <span className="font-normal flex items-center justify-end min-w-[140px] ml-auto sm:ml-0">
                            {card.lastVoteTime
                              ? `Last vote: ${getRelativeTime(
                                  card.lastVoteTime
                                )}`
                              : "No votes yet"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-50/50 py-3">
                    <VotePanel
                      cardId={card.id}
                      onVoteSuccess={() => fetchCards(pagination.page)}
                    />
                    {session?.user?.role === "ADMIN" && (
                      <div className="flex items-center justify-end gap-4 px-5 mt-3 pt-3 border-t border-gray-200">
                        <Link
                          href={`/edit/${card.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
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
                          className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                          disabled={
                            deleteState.isDeleting && deleteState.id === card.id
                          }
                          aria-label={`Delete ${card.name}`}
                        >
                          {deleteState.isDeleting &&
                          deleteState.id === card.id ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                              Deleting...
                            </span>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="py-4 flex-none border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount
              )}{" "}
              of {pagination.totalCount} cards
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Mobile: Simple page indicator */}
              <div className="sm:hidden flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {pagination.page} / {pagination.totalPages}
                </span>
              </div>

              {/* Desktop: Full pagination */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNum === pagination.page
                            ? "bg-indigo-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteState.error && (
        <div className="fixed bottom-4 right-4 bg-rose-100 text-rose-700 px-4 py-2 rounded-lg shadow-lg border border-rose-200 animate-fade-in">
          {deleteState.error}
        </div>
      )}
    </div>
  );
}
