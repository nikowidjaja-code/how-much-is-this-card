"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Card {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
}

const getCardStyle = (value: number) => {
  if (value <= 0.25) return "bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50 transition-colors";
  if (value === 0.5) return "bg-amber-50/30 border-amber-100 hover:bg-amber-50/50 transition-colors";
  if (value === 0.75) return "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50 transition-colors";
  if (value === 1) return "bg-orange-50/30 border-orange-100 hover:bg-orange-50/50 transition-colors";
  return "bg-rose-50/30 border-rose-100 hover:bg-rose-50/50 transition-colors";
};

const getBadgeStyle = (value: number) => {
  if (value <= 0.25) return "bg-emerald-100/80 text-emerald-700 font-medium";
  if (value === 0.5) return "bg-amber-100/80 text-amber-700 font-medium";
  if (value === 0.75) return "bg-blue-100/80 text-blue-700 font-medium";
  if (value === 1) return "bg-orange-100/80 text-orange-700 font-medium";
  return "bg-rose-100/80 text-rose-700 font-medium";
};

export default function CardList() {
  const [sortBy, setSortBy] = useState<"updatedAt" | "name" | "value">(
    "updatedAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState<Card[]>([]);
  const [valueFilter, setValueFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });
      setCards((prevCards) => prevCards.filter((card) => card.id !== id));
    } catch (error) {
      alert("Failed to delete card. Please try again later.");
    }
  };

  return (
    <main>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">All Cards</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded text-base w-full sm:w-64"
          />

          <select
            value={valueFilter}
            onChange={(e) => {
              const val = e.target.value;
              setValueFilter(val === "all" ? "all" : parseFloat(val));
            }}
            className="border px-3 py-2 rounded text-base w-full sm:w-64"
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
            className="border px-3 py-2 rounded text-base w-full sm:w-64"
          >
            <option value="updatedAt">Recently Modified</option>
            <option value="name">Alphabetical</option>
            <option value="value">By Value</option>
          </select>

          <button
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            className="border px-3 py-2 rounded text-base w-full sm:w-12 flex justify-center items-center"
            title={order === "asc" ? "Ascending" : "Descending"}
          >
            {order === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {loading ? (
        // Shimmer Placeholder
        <div className="space-y-4">
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
        </div>
      ) : (
        <ul className="space-y-4 overflow-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2">
          {filteredCards.map((card) => (
            <li
              key={card.id}
              className={`py-2.5 px-4 rounded-lg shadow-sm flex justify-between items-center border ${getCardStyle(
                card.value
              )}`}
            >
              <div className="flex items-center gap-2">
                <div className="text-base font-medium text-gray-700 capitalize font-sans">
                  {card.name.toLowerCase().split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-sans">
                  <div
                    className={`font-medium px-1.5 py-0.5 rounded-full ${getBadgeStyle(
                      card.value
                    )}`}
                  >
                    {card.value.toFixed(2)}
                  </div>
                  <span className="font-normal">
                    {new Date(card.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-200 mx-2"></div>
                <div className="flex gap-2">
                  <Link
                    href={`/edit/${card.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors font-sans"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors font-sans"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
