"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddCard() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading" && session?.user?.role !== "ADMIN") {
      router.push("/cards");
    }
  }, [status, session, router]);

  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) {
      setName(nameParam);
    }
  }, [searchParams]);

  // If not admin, don't render the form
  if (status === "loading" || session?.user?.role !== "ADMIN") {
    return null;
  }

  const addCard = async () => {
    if (!name.trim()) {
      setError("Card name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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

      <button
        onClick={addCard}
        disabled={isSubmitting}
        className={`w-full py-2 rounded text-lg font-semibold transition-colors ${
          isSubmitting
            ? "bg-green-600 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Adding Card..." : "Add Card"}
      </button>

      {isSubmitting && (
        <div className="text-center text-green-600 font-medium">
          Card added successfully! Redirecting...
        </div>
      )}
    </div>
  );
}
