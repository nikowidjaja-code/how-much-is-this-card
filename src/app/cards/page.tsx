"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const getCardStyle = (value: number) => {
  if (value <= 0.25) return "bg-green-50 border-green-200";
  if (value === 0.5) return "bg-yellow-50 border-yellow-200";
  if (value === 1) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
};

const getBadgeStyle = (value: number) => {
  if (value <= 0.25) return "bg-green-100 text-green-800";
  if (value === 0.5) return "bg-yellow-100 text-yellow-800";
  if (value === 1) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default function CardList() {
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState([]);
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
    const matchesValue = valueFilter === "all" || card.value === valueFilter;
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesValue && matchesSearch;
  });

  const deleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    await fetch(`/api/cards/${id}`, {
      method: "DELETE",
    });

    // Refresh local state after deletion
    setCards((prev) => prev.filter((card: any) => card.id !== id));
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">All Cards</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
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
          <option value="0.25">Low (0.25)</option>
          <option value="0.5">Mid (0.5)</option>
          <option value="1">High (1)</option>
          <option value="2">Other (2)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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

      {loading ? (
        // Shimmer Placeholder
        <div className="space-y-4">
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredCards.map((card: any) => (
            <li
              key={card.id}
              className={`p-4 rounded-xl shadow-md flex justify-between items-center border ${getCardStyle(
                card.value
              )}`}
            >
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {card.name}
                </div>
                <div
                  className={`mt-1 text-sm font-medium inline-block px-2 py-0.5 rounded ${getBadgeStyle(
                    card.value
                  )}`}
                >
                  {card.value}
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Link
                  href={`/edit/${card.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteCard(card.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
