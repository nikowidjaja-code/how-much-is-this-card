"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditCard() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [value, setValue] = useState(0.5);
  const [customValue, setCustomValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await fetch("/api/cards");
        const data = await res.json();
        const card = data.find((c: any) => c.id === id);
        
        if (!card) {
          setError("Card not found");
          return;
        }

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
      } catch (err) {
        setError("Failed to load card data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCard();
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
    if (!name.trim()) {
      setError("Card name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const finalValue = customValue !== null ? customValue : value;
      const response = await fetch(`/api/cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: finalValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      // Show success message and redirect after a short delay
      setTimeout(() => {
        router.push("/cards");
      }, 2000);
    } catch (err) {
      setError("Failed to update card. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white p-6 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Card</h1>

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
            step="0.01"
            min="0"
            disabled={isSubmitting}
          />
        </div>
      )}

      <button
        onClick={updateCard}
        disabled={isSubmitting}
        className={`w-full py-2 rounded text-lg font-semibold transition-colors ${
          isSubmitting 
            ? 'bg-green-600 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Updating Card...' : 'Update Card'}
      </button>

      {isSubmitting && (
        <div className="text-center text-green-600 font-medium">
          Card updated successfully! Redirecting...
        </div>
      )}
    </main>
  );
}
