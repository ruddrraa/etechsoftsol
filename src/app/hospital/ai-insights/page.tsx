"use client";

import { useState } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AiInsightsPage() {
  const [prompt, setPrompt] = useState("");
  const [insights, setInsights] = useState<{ query: string; response: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    const userPrompt = prompt;
    setPrompt("");

    try {
      // In a real scenario, we'd fetch actual context data here before calling Groq
      const contextData = { 
        hospitalScope: "General Analytics",
        lastUpdate: new Date().toISOString()
      };

      const res = await fetch("/api/v1/ai/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, contextData })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInsights(prev => [{ query: userPrompt, response: data.insight }, ...prev]);
      } else {
        setInsights(prev => [{ query: userPrompt, response: "Error: " + (data.error || "Failed to fetch") }, ...prev]);
      }
    } catch {
      setInsights(prev => [{ query: userPrompt, response: "Error: Network failure." }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-sm font-semibold tracking-widest text-text-secondary uppercase">
          AI Analytics Chat
        </h1>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
          Ask hospital performance questions
        </h2>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col rounded-[var(--radius-card)] border border-border bg-surface shadow-card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* AI Welcome Message */}
            <div className="flex gap-4 p-5 rounded-2xl bg-surface-secondary border border-border w-[90%] sm:w-[80%]">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Bot className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-text-secondary uppercase mb-2">
                  Insight AI
                </p>
                <p className="text-[13px] text-text-primary leading-relaxed">
                  Ask me to perform analytics actions: summarize revenue, show patient trends, list underperforming departments, or run compliance checks.
                </p>
              </div>
            </div>

            {insights.map((insight, i) => (
              <div key={i} className="space-y-6">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%]">
                    <p className="text-[13px] leading-relaxed">{insight.query}</p>
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex gap-4 p-5 rounded-2xl bg-surface-secondary border border-border w-[90%] sm:w-[80%]">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-widest text-text-secondary uppercase mb-2">
                      Insight AI
                    </p>
                    <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap">
                      {insight.response}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 p-5 rounded-2xl bg-surface-secondary border border-border w-max">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Loader2 className="size-4 text-primary animate-spin" />
                </div>
                <div className="flex items-center">
                  <p className="text-[13px] text-text-secondary">Analyzing data...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-surface">
            <form onSubmit={handleAsk} className="relative flex items-center">
              <Input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Message Insight AI..."
                className="w-full h-14 pl-6 pr-14 rounded-full bg-surface-secondary border-transparent hover:border-border focus-visible:ring-1 focus-visible:ring-primary shadow-inner transition-colors"
                disabled={loading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={loading || !prompt.trim()} 
                className="absolute right-2 size-10 rounded-full bg-primary hover:bg-primary-hover shadow-soft"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-card">
            <h3 className="text-[11px] font-bold tracking-widest text-text-secondary uppercase mb-4">
              Try These
            </h3>
            <div className="space-y-3">
              {[
                "Summarize this month's revenue",
                "Show patient admissions trend",
                "Which department is underperforming?",
                "Generate daily operational PDF",
                "Run compliance check"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(suggestion)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-[13px] text-text-primary transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface-secondary p-5 text-center">
            <p className="text-xs text-text-secondary leading-relaxed">
              The assistant looks at your latest MIS data before answering. Ensure your reports are uploaded to get accurate insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
