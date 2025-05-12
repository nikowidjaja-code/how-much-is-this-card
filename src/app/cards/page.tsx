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
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then(setCards);
  }, []);

  const filteredCards = cards.filter((card: any) =>
    card.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <ul className="space-y-2">
        {filteredCards.map((card: any) => (
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
        ))}
      </ul>
    </main>
  );
}
