"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddCard() {
  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);
  const [customValue, setCustomValue] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nameParam = searchParams.get('name');
    if (nameParam) {
      setName(nameParam);
    }
  }, [searchParams]);

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
    if (!name.trim()) {
      setError("Card name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalValue = customValue !== null ? customValue : value;
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: finalValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to add card");
      }

      // Show success message and redirect after a short delay
      setTimeout(() => {
        router.push("/cards");
      }, 2000);
    } catch (err) {
      setError("Failed to add card. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Add New Card</h1>
      
      {error && (
        <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Card Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-base"
          placeholder="Card name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Value</label>
        <select
          value={customValue !== null ? 0 : value}
          onChange={handleValueChange}
          className="w-full border rounded px-3 py-2 text-base"
          disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>
      )}

      <button
        onClick={addCard}
        disabled={isSubmitting}
        className={`w-full py-2 rounded text-lg font-semibold transition-colors ${
          isSubmitting 
            ? 'bg-green-600 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Adding Card...' : 'Add Card'}
      </button>

      {isSubmitting && (
        <div className="text-center text-green-600 font-medium">
          Card added successfully! Redirecting...
        </div>
      )}
    </div>
  );
}
