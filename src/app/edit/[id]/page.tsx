"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCard() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        const card = data.find((c: any) => c.id === id);
        setName(card?.name || "");
        setValue(card?.value || 0.5);
      });
  }, [id]);

  const updateCard = async () => {
    await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value }),
    });
    router.push("/cards");
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Edit Card</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <select
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="border p-2 w-full mb-4"
      >
        <option value={0.25}>Low (0.25)</option>
        <option value={0.5}>Mid (0.5)</option>
        <option value="0.5">So So (0.75)</option>
        <option value={1}>High (1)</option>
        <option value={2}>Other</option>
      </select>
      <button
        onClick={updateCard}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Update
      </button>
    </main>
  );
}
