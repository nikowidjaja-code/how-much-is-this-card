"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCard() {
  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);
  const router = useRouter();

  const addCard = async () => {
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value }),
    });
    router.push("/cards");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Card Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Card name"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Value</label>
        <select
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          className="w-full border rounded px-3 py-2 text-base"
        >
          <option value={0.25}>Low (0.25)</option>
          <option value={0.5}>Mid (0.5)</option>
          <option value={0.75}>So So (0.75)</option>
          <option value={1}>High (1)</option>
          <option value={0}>Other</option>
        </select>
      </div>
      <button
        onClick={addCard}
        className="w-full bg-blue-600 text-white py-2 rounded text-lg font-semibold hover:bg-blue-700"
      >
        Add Card
      </button>
    </div>
  );
}
