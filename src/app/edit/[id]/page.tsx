"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCard() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);
  const [customValue, setCustomValue] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => {
        const card = data.find((c: any) => c.id === id);
        if (card) {
          setName(card.name);
          // Check if value is one of the predefined ones
          const predefined = [0.25, 0.5, 0.75, 1];
          if (predefined.includes(card.value)) {
            setValue(card.value);
            setCustomValue(null);
          } else {
            setValue(0); // Set to "Other"
            setCustomValue(card.value);
          }
        }
      });
  }, [id]);

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = parseFloat(e.target.value);
    if (selected === 0) {
      setCustomValue(1); // Default custom value shown
    } else {
      setCustomValue(null);
      setValue(selected);
    }
  };

  const updateCard = async () => {
    const finalValue = customValue !== null ? customValue : value;
    await fetch(`/api/cards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value: finalValue }),
    });
    router.push("/cards");
  };

  return (
    <main className="bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold">Edit Card</h1>
      <div>
        <label className="block text-sm font-semibold mb-1">Card Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Value</label>
        <select
          value={customValue !== null ? 0 : value}
          onChange={handleValueChange}
          className="w-full border rounded px-3 py-2 text-base"
        >
          <option value={0.25}>Low (0.25)</option>
          <option value={0.5}>Mid (0.5)</option>
          <option value={0.75}>So So (0.75)</option>
          <option value={1}>High (1)</option>
          <option value={0}>Other</option>
        </select>
      </div>

      {customValue !== null && (
        <div>
          <label className="block text-sm font-semibold mb-1">
            Custom Value
          </label>
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(parseFloat(e.target.value))}
            className="w-full border rounded px-3 py-2 text-base"
            step="0.01"
            min="0"
          />
        </div>
      )}

      <button
        onClick={updateCard}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full font-semibold hover:bg-blue-700"
      >
        Update
      </button>
    </main>
  );
}
