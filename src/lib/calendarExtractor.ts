import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Define the schema using Zod
export const CalendarEventSchema = z.object({
  event_name: z.string(),
  date_iso: z.string().nullable().describe("YYYY-MM-DD only if explicit enough, else null"),
  date_text: z.string().nullable().describe("raw label seen (e.g., '12 Jan', 'Fri 3')"),
  start_time: z.string().nullable().describe("'HH:MM' 24h preferred"),
  end_time: z.string().nullable().describe("'HH:MM' 24h preferred"),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  source_text: z.string().nullable().describe("short supporting snippet from the calendar cell/line")
});

export const CalendarExtractionSchema = z.object({
  meta: z.object({
    source_filename: z.string(),
    source_mime: z.string(),
    calendar_type: z.enum(["monthly_grid", "weekly_grid", "agenda_list", "unknown"])
  }),
  events: z.array(CalendarEventSchema)
});

export type CalendarExtraction = z.infer<typeof CalendarExtractionSchema>;

export interface ExtractionInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // pptx
];

/**
 * Extracts calendar events from a file buffer using Gemini API.
 */
export async function extractCalendarEvents(input: ExtractionInput): Promise<CalendarExtraction> {
  const { buffer, filename, mimeType: originalMimeType } = input;
  let currentMimeType = originalMimeType.toLowerCase();
  
  // Normalize mime types
  if (currentMimeType === "image/jpg") currentMimeType = "image/jpeg";

  if (!SUPPORTED_MIME_TYPES.includes(currentMimeType)) {
    throw new Error("file type not supported");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "calendar-extract-"));
  const tempInputPath = path.join(tempDir, filename);
  await fs.writeFile(tempInputPath, buffer);

  try {
    // Upload to Gemini Files API
    // Gemini 1.5 supports PPTX natively via the Files API
    const uploadResult = await fileManager.uploadFile(tempInputPath, {
      mimeType: currentMimeType,
      displayName: filename,
    });

    let file = uploadResult.file;
    
    // Poll for processing state (especially for PDFs and PPTX)
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error("Gemini file processing failed");
    }

    // Call Gemini with structured output
    const jsonSchema: any = zodToJsonSchema(CalendarExtractionSchema);
    const cleanSchema = { ...jsonSchema };
    delete cleanSchema.$schema;
    delete cleanSchema.definitions;
    delete cleanSchema.$ref;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: cleanSchema as any,
        temperature: 0.2,
      },
    });

    const prompt = `You are extracting events from a calendar export (image, PDF, or PowerPoint). Return ONLY events that are explicitly visible; do not guess.
Rules:
- If a field (date/time/location) is not clearly shown, set it to null.
- date_iso must be YYYY-MM-DD ONLY when the date is explicit enough. If the year is missing or ambiguous, set date_iso=null and put the visible label in date_text.
- start_time/end_time must be "HH:MM" when possible; if only "10am" is shown, convert to "10:00". If unclear, null.
- location must be null unless explicitly present.
- notes can include extra visible context like "Bring laptop", "TBC", etc.
- source_text should be a short snippet copied/paraphrased from the calendar cell/line that supports the event.
- Identify calendar_type as monthly_grid / weekly_grid / agenda_list / unknown.
Output must be valid JSON strictly matching the provided schema. No markdown.`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    
    // Defensive parsing for extra fencing
    const cleanJson = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Sort events by date_iso/start_time
    if (parsed.events && Array.isArray(parsed.events)) {
      parsed.events.sort((a: any, b: any) => {
        if (a.date_iso && b.date_iso) {
          if (a.date_iso !== b.date_iso) return a.date_iso.localeCompare(b.date_iso);
          return (a.start_time || "").localeCompare(b.start_time || "");
        }
        if (a.date_iso) return -1;
        if (b.date_iso) return 1;
        return 0;
      });
    }

    // Ensure meta matches actual input
    parsed.meta = {
      ...parsed.meta,
      source_filename: filename,
      source_mime: originalMimeType,
    };

    return parsed;
  } finally {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }
}


    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    
    // Defensive parsing for extra fencing
    const cleanJson = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Sort events by date_iso/start_time
    if (parsed.events && Array.isArray(parsed.events)) {
      parsed.events.sort((a: any, b: any) => {
        if (a.date_iso && b.date_iso) {
          if (a.date_iso !== b.date_iso) return a.date_iso.localeCompare(b.date_iso);
          return (a.start_time || "").localeCompare(b.start_time || "");
        }
        if (a.date_iso) return -1;
        if (b.date_iso) return 1;
        return 0;
      });
    }

    // Ensure meta matches actual input
    parsed.meta = {
      ...parsed.meta,
      source_filename: filename,
      source_mime: originalMimeType,
    };

    return parsed;
  } finally {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }
}
