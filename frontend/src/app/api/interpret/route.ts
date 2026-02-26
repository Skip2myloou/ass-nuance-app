import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Geen tekst ontvangen." },
        { status: 400 }
      );
    }

    const prompt = `
Analyseer dit bericht zonder een antwoord te formuleren.

Geef:
1. Wat wordt er letterlijk gezegd?
2. Wat kan het betekenen?
3. Welke toon zit erin?
4. Wat is mogelijk de intentie?

Bericht:
"${text}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("Interpret API error:", error);
    return NextResponse.json(
      { error: "Interpretatie mislukt." },
      { status: 500 }
    );
  }
}