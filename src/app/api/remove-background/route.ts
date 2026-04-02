export const runtime = "nodejs";

const SUPPORTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const DEFAULT_MAX_FILE_SIZE_MB = 10;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("No file uploaded", 400);
  }

  const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB ?? DEFAULT_MAX_FILE_SIZE_MB);
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

  if (!SUPPORTED_TYPES.has(file.type)) {
    return jsonError("Unsupported file type", 400);
  }

  if (file.size > maxFileSizeBytes) {
    return jsonError(`File is too large. Maximum size is ${maxFileSizeMb}MB.`, 400);
  }

  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    return jsonError("REMOVE_BG_API_KEY is not configured", 500);
  }

  try {
    const upstreamFormData = new FormData();
    upstreamFormData.append("image_file", file, file.name);
    upstreamFormData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonError(errorText || "Failed to process image", response.status);
    }

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^.]+$/, "") || "result"}.png"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
