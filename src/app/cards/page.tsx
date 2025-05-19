"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface Card {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
}

interface DeleteState {
  id: string | null;
  isDeleting: boolean;
  error: string | null;
}

const getCardStyle = (value: number) => {
  if (value <= 0.25) return "bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50 hover:shadow-md transition-all duration-200";
  if (value === 0.5) return "bg-amber-50/30 border-amber-100 hover:bg-amber-50/50 hover:shadow-md transition-all duration-200";
  if (value === 0.75) return "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200";
  if (value === 1) return "bg-orange-50/30 border-orange-100 hover:bg-orange-50/50 hover:shadow-md transition-all duration-200";
  return "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50 hover:shadow-md transition-all duration-200";
};

const getBadgeStyle = (value: number) => {
  if (value <= 0.25) return "bg-emerald-100/80 text-emerald-700 font-medium shadow-sm";
  if (value === 0.5) return "bg-amber-100/80 text-amber-700 font-medium shadow-sm";
  if (value === 0.75) return "bg-blue-100/80 text-blue-700 font-medium shadow-sm";
  if (value === 1) return "bg-orange-100/80 text-orange-700 font-medium shadow-sm";
  return "bg-rose-100/80 text-rose-700 font-medium shadow-sm";
};

export default function CardList() {
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "value">("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState<Card[]>([]);
  const [valueFilter, setValueFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    id: null,
    isDeleting: false,
    error: null,
  });

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      const res = await fetch(`/api/cards?sortBy=${sortBy}&order=${order}`);
      const data = await res.json();
      setCards(data);
      setLoading(false);
    };

    fetchCards();
  }, [sortBy, order]);

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

  const deleteCard = async (id: string) => {
    setDeleteState({ id, isDeleting: true, error: null });
    
    try {
      await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });
      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    } catch (error) {
      setDeleteState((prev) => ({ ...prev, error: "Failed to delete card. Please try again later." }));
    } finally {
      setDeleteState({ id: null, isDeleting: false, error: null });
    }
  };

  const handleSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleSort = () => {
    setOrder(order === "asc" ? "desc" : "asc");
  };

  const handleNavigateNext = () => {
    if (filteredCards.length === 0) return;
    setSelectedCardIndex(prev => 
      prev === filteredCards.length - 1 ? 0 : prev + 1
    );
  };

  const handleNavigatePrev = () => {
    if (filteredCards.length === 0) return;
    setSelectedCardIndex(prev => 
      prev <= 0 ? filteredCards.length - 1 : prev - 1
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  useKeyboardShortcuts({
    onSearch: handleSearch,
    onSort: handleSort,
    onNavigateNext: handleNavigateNext,
    onNavigatePrev: handleNavigatePrev,
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
            <span>{isStatsExpanded ? 'Hide Stats' : 'Show Stats'}</span>
            <span className={`transform transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        <div 
          id="stats-section"
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 transition-all duration-300 ease-in-out ${
            isStatsExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 sm:max-h-[200px] opacity-0 sm:opacity-100 overflow-hidden sm:overflow-visible'
          }`}
        >
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-gray-800">{cards.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Low Value</div>
            <div className="text-2xl font-bold text-emerald-600">
              {cards.filter(card => card.value <= 0.25).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Mid Value</div>
            <div className="text-2xl font-bold text-amber-600">
              {cards.filter(card => card.value === 0.5).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">High Value</div>
            <div className="text-2xl font-bold text-orange-600">
              {cards.filter(card => card.value >= 0.75).length}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name... (Ctrl+F)"
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
            <option value={0.25}>Low (0.25)</option>
            <option value={0.5}>Mid (0.5)</option>
            <option value={0.75}>So So (0.75)</option>
            <option value={1}>High (1)</option>
            <option value={0}>Other</option>
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
                <div className="py-4 px-5 rounded-lg border bg-white/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border p-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">No cards found matching your criteria</p>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
            <Link
              href={`/add?name=${encodeURIComponent(searchQuery)}`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>➕</span>
              <span>Add New Card</span>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 overflow-auto h-full scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/50 pr-2">
            {filteredCards.map((card, index) => (
              <li
                key={card.id}
                className={`py-4 px-5 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border ${getCardStyle(
                  card.value
                )} ${selectedCardIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                tabIndex={0}
                onFocus={() => setSelectedCardIndex(index)}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-base font-medium text-gray-700 capitalize font-sans truncate max-w-[200px] sm:max-w-none">
                    {card.name.toLowerCase().split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
                    <div
                      className={`font-medium px-3 py-1 rounded-full ${getBadgeStyle(
                        card.value
                      )}`}
                    >
                      {card.value.toFixed(2)}
                    </div>
                    <span className="font-normal">
                      {new Date(card.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                  <div className="flex gap-3">
                    <Link
                      href={`/edit/${card.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors font-sans hover:underline"
                      aria-label={`Edit ${card.name}`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteCard(card.id)}
                      onKeyPress={(e) => handleKeyPress(e, () => deleteCard(card.id))}
                      className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors font-sans hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={deleteState.isDeleting && deleteState.id === card.id}
                      aria-label={`Delete ${card.name}`}
                    >
                      {deleteState.isDeleting && deleteState.id === card.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm hidden lg:block">
        <h3 className="font-semibold mb-2">Keyboard Shortcuts:</h3>
        <ul className="space-y-1 text-gray-600">
          <li>⌘/Ctrl + A: Add new card</li>
          <li>⌘/Ctrl + F: Focus search</li>
          <li>⌘/Ctrl + S: Toggle sort order</li>
          <li>↑/↓: Navigate cards</li>
        </ul>
      </div>

      {deleteState.error && (
        <div className="fixed bottom-4 right-4 bg-rose-100 text-rose-700 px-4 py-2 rounded-lg shadow-lg border border-rose-200 animate-fade-in">
          {deleteState.error}
        </div>
      )}
    </div>
  );
}
