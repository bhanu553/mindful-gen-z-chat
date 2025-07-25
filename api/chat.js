import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY is missing");
      return Response.json({ error: "OpenAI API key is not set." }, { status: 500 });
    }
    if (!message) {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
    });
    return Response.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error in /api/chat:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}