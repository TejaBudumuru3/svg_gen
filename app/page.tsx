"use client"

import { useState, useEffect } from "react";
import { type Concept, Concepts } from "./lib/concepts";
import { ConceptResult } from "./lib/pipeline";
import initialResults from "@/results.json"

interface ReviewItem {
  status: "approved" | "rejected" | null;
  notes: string
}

type ReviewMap = Record<number, ReviewItem>;

export default function Home() {

  const [results, setResults] = useState<ConceptResult[]>(initialResults);
  const [reviews, setReviews] = useState<ReviewMap>({})
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [zoomedItem, setZoomedItem] = useState<{ title: string; svg: string } | null>(null);
  const [errorBanner, setErrorBanner] = useState<{ conceptId: number; message: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("udhi_reviews");
    if (saved) setReviews(JSON.parse(saved))
  }, [])

  const handleReviewChange = (id: string, item: ReviewItem) => {
    const updated = {
      ...reviews,
      [id]: item
    };
    setReviews(updated);
    localStorage.setItem("udhi_reviews", JSON.stringify(updated))
  }

  const cleanSvg = (svg: string) => svg.replaceAll('<b>', "<tspan font-weight='bold'>").replaceAll('</b>', '</tspan>');
  async function handleLiveGenerate(concept: Concept) {

    setErrorBanner(null);
    setGeneratingId(concept.id);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: concept.title,
          text: concept.text,
          details: concept.details
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const errorMsg = data.error || `HTTP ${res.status}: Server returned an error`;
        setErrorBanner({
          conceptId: concept.id,
          message: errorMsg
        })
        return
      }

      setResults((prev) =>
        prev?.map((item) => item.id === concept.id ? data : item)
      );
    }
    catch (err: any) {
      setErrorBanner({
        conceptId: concept.id,
        message: err.message || "Network failure: Unable to reach /api/generate"
      })
    }
    finally {
      setGeneratingId(null)
    }
  }
  return (
    <main className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Science Diagram Reviewer</h1>
      <p className="text-zinc-500 mb-8">Udhi Technologies GCSE Animated SVG Assessment</p>

      {errorBanner && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex justify-between">
          <div>
            <strong className="font-semibold">Error: </strong>
            <span>{errorBanner.message}</span>
          </div>
          <button className="font-bold text-red-600" onClick={(() => setErrorBanner(null))}>X</button>
        </div>
      )}

      <div className="overflow-x-auto border border-zinc-200 rounded-xl shadow-sm bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
            <tr>
              <th className="p-4">Concept</th>
              <th className="p-4">Quality Checks</th>
              <th className="p-4">Cost & Retries</th>
              <th className="p-4">Animated Diagram</th>
              <th className="p-4">Reviewer Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {results.map((item) => {
              const currentReview = reviews[item.id] || { status: null, notes: "" }
              const conceptInfo = Concepts.find(c => c.id === item.id);
              return (
                <tr key={item.id} className="hover:bg-zinc-50/50">
                  <td className="p-4 align-top w-56">
                    <div className="font-bold text-zinc-900 text-base">{item.title}</div>
                    {
                      conceptInfo && (
                        <button
                          onClick={() => handleLiveGenerate(conceptInfo)}
                          disabled={generatingId !== null}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded text-xs font-medium transition"
                        >
                          {generatingId === item.id ? "Regenerating..." : "Test Live Generate"}
                        </button>
                      )}
                  </td>

                  <td className="p-4 align-top">
                    <div className="space-y-1.5">
                      {item.checks.map((check, id) => (
                        <div key={id} className="flex items-center gap-1.5 text-xs">
                          <span className={`inline-block w-4 h-4 rounded-full text-center leading-4 font-bold text-[10px] ${check.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {check.passed ? '✓' : '✕'}
                          </span>
                          <span className={check.passed ? 'text-zinc-700' : 'text-red-600 font-medium'}>
                            {check.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 align-top text-xs space-y-1">
                    <div className="text-zinc-700"><strong>Cost:</strong> ${(item.cost ?? 0).toFixed(5)}</div>
                    <div className="text-zinc-700"><strong>Model:</strong> ${item.model}</div>
                    <div className="text-zinc-700"><strong>API retries:</strong> {item.apiRetries}</div>
                    <div className="text-zinc-700"><strong>Validation retries:</strong> {item.validationRetries}</div>
                    <div className="text-zinc-900 text-[11px] mt-2">
                      Tokens: {item.inputTokens} in / {item.outputTokens} out
                    </div>
                  </td>

                  <td className="p-4 align-top">
                    <div
                      onClick={() => setZoomedItem({ title: item.title, svg: item.svg })}
                      className="-64 h-48 bg-white border border-zinc-200 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-inner cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition relative group [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: cleanSvg(item.svg) }} />
                    <span className="text-[11px] text-zinc-400 block mt-1 text-center">
                      🔍 Click diagram to expand
                    </span>
                  </td>

                  <td className="p-4 align-top w-64 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewChange(String(item.id), { ...currentReview, status: "approved" })}
                        className={`flex-1 py-1 rounded text-xs font-semibold border ${currentReview.status === 'approved' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewChange(String(item.id), { ...currentReview, status: "rejected" })}
                        className={`flex-1 py-1 rounded text-xs font-semibold border ${currentReview.status === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-300 hover:bg-red-50'}`}
                      >
                        Reject
                      </button>
                    </div>

                    <textarea
                      value={currentReview.notes}
                      onChange={(e) => handleReviewChange(String(item.id), { ...currentReview, notes: e.target.value })}
                      placeholder="Add review notes..."
                      rows={2}
                      className="w-full text-xs p-2 border border-zinc-200 rounded focus:outline-blue-500"
                    />

                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {zoomedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 shrink-0">
              <h3 className="font-bold text-zinc-800 text-lg">{zoomedItem.title}</h3>
              <button
                onClick={() => setZoomedItem(null)}
                className="text-zinc-500 hover:text-zinc-800 text-sm font-semibold px-2.5 py-1 rounded hover:bg-zinc-100 transition"
              >
                ✕ Close
              </button>
            </div>

            {/* Full-size 800x600 SVG Viewport */}
            <div
              className="flex-1 min-h-0 p-4 bg-white flex items-center justify-center overflow-hidden [&>svg]:w-auto [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:max-h-full"
              dangerouslySetInnerHTML={{ __html: cleanSvg(zoomedItem.svg) }}
            />
          </div>
        </div>
      )}
    </main>

  );
}
