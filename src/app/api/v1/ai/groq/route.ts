import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, contextData } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in the server environment." },
        { status: 500 }
      );
    }

    // Build the system prompt with context data (if provided)
    const systemPrompt = `You are InsightHMS, an advanced AI Hospital Management assistant.
You provide intelligent, actionable insights based on hospital data.
Current context data provided by the user:
${JSON.stringify(contextData || {})}
Please answer the user's prompt based strictly on this context. DO NOT hallucinate or invent numbers. If the data does not contain the answer, state that clearly. Keep it concise, professional, and actionable.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // High capability free Groq model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1024,
      })
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.text();
      console.error("[Groq API Error]", errData);
      return NextResponse.json({ error: "Failed to generate AI insights from Groq" }, { status: groqResponse.status });
    }

    const data = await groqResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      insight: data.choices[0].message.content 
    });
  } catch (err) {
    console.error("[AI Groq Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
