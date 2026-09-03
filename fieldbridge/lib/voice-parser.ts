import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedVoicePayload } from "@/lib/types";

function heuristicParse(transcript: string): ParsedVoicePayload {
  const input = transcript.toLowerCase();

  if (input.includes("drain") || input.includes("overflow") || input.includes("garbage") || input.includes("sewage")) {
    if (input.includes("drain") || input.includes("overflow")) {
      return {
        category: "sanitation",
        subtype: "drain_overflow",
        description: transcript,
        severity: "critical",
        transcript,
      };
    }

    return {
      category: "sanitation",
      subtype: "garbage_pileup",
      description: transcript,
      severity: "high",
      transcript,
    };
  }

  if (input.includes("dirty") || input.includes("brown") || input.includes("smell")) {
    return {
      category: "water",
      subtype: "dirty_water",
      description: transcript,
      severity: "critical",
      transcript,
    };
  }

  if (input.includes("leak") || input.includes("burst")) {
    return {
      category: "water",
      subtype: "leakage",
      description: transcript,
      severity: "high",
      transcript,
    };
  }

  return {
    category: "water",
    subtype: "no_supply",
    description: transcript,
    severity: "critical",
    transcript,
  };
}

export async function parseVoiceComplaint(transcript: string): Promise<ParsedVoicePayload> {
  const mode = process.env.FIELD_BRIDGE_AI_MODE ?? "mock";
  const apiKey = process.env.GEMINI_API_KEY;

  if (mode !== "live" || !apiKey) {
    return heuristicParse(transcript);
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(`
Classify the following civic complaint into JSON with keys:
category ("water" or "sanitation"), subtype, description, severity ("low"|"medium"|"high"|"critical"), transcript.

Complaint:
${transcript}
`);

    const text = response.response.text().trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as ParsedVoicePayload;
      return {
        ...parsed,
        transcript,
      };
    }
  } catch {
    // fall back below
  }

  return heuristicParse(transcript);
}

