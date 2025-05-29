"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Check } from "lucide-react";

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
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="flex justify-center">
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Add New Card
            </h1>

            {error && (
              <div className="mb-6 bg-rose-50 text-rose-700 px-4 py-3 rounded-lg border border-rose-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="card-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Card Name
                </label>
                <input
                  id="card-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter card name"
                  disabled={isSubmitting}
                />
              </div>

              <button
                onClick={addCard}
                disabled={isSubmitting}
                className={`w-full h-12 rounded-lg text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Adding Card...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Card</span>
                  </>
                )}
              </button>

              {isSubmitting && (
                <div className="text-center text-green-600 font-medium flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Card added successfully! Redirecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
