"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const getColor = (value: number) => {
  if (value <= 0.25) return "text-green-600";
  if (value === 0.5) return "text-yellow-600";
  if (value === 1) return "text-orange-600";
  return "text-red-600";
};

export default function CardList() {
  const [cards, setCards] = useState([]);
  const [valueFilter, setValueFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      const res = await fetch("/api/cards");
      const data = await res.json();
      setCards(data);
      setLoading(false);
    };

    fetchCards();
  }, []);

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
      </div>

      {loading ? (
        // Shimmer Placeholder
        <div className="space-y-4">
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
          <div className="shimmer h-20 rounded-md w-full"></div>
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredCards.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No cards found.
            </div>
          ) : (
            filteredCards.map((card: any) => (
              <li
                key={card.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <div className="text-lg font-medium">{card.name}</div>
                  <div className={`text-sm font-semibold ${getColor(card.value)}`}>
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
            ))
          )}
        </ul>
      )}
    </main>
  );
}
