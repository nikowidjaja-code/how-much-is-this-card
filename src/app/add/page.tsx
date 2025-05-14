"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCard() {
  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);
  const [customValue, setCustomValue] = useState<number | null>(null);
  const router = useRouter();

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = parseFloat(e.target.value);
    if (selected === 0) {
      setCustomValue(1); 
    } else {
      setCustomValue(null);
      setValue(selected);
    }
  };

  const addCard = async () => {
    const finalValue = customValue !== null ? customValue : value;
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, value: finalValue }),
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
            placeholder="Enter custom value"
            step="0.01"
            min="0"
          />
        </div>
      )}

      <button
        onClick={addCard}
        className="w-full bg-blue-600 text-white py-2 rounded text-lg font-semibold hover:bg-blue-700"
      >
        Add Card
      </button>
    </div>
  );
}
