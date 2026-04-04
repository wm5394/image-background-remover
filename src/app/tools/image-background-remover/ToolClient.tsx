"use client";

import { ChangeEvent, DragEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const supportedFormats = ["PNG", "JPG", "JPEG", "WEBP"];
const supportedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const maxFileSizeMb = 10;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

type PreviewMode = "before" | "after" | "compare";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFriendlyErrorMessage(message: string) {
  if (message.includes("REMOVE_BG_API_KEY is not configured")) {
    return "The background removal service is not configured yet. Add your REMOVE_BG_API_KEY and try again.";
  }

  if (message.includes("payment_required") || message.includes("insufficient credits")) {
    return "The background removal service has run out of credits. Please top up the API account and retry.";
  }

  if (message.includes("Unsupported file type")) {
    return "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.";
  }

  if (message.includes("File is too large")) {
    return `File is too large. Maximum size is ${maxFileSizeMb}MB.`;
  }

  return message;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

export default function ToolClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const compareFrameRef = useRef<HTMLDivElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("result.png");
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("before");
  const [comparePosition, setComparePosition] = useState(50);
  const [isAdjustingCompare, setIsAdjustingCompare] = useState(false);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return null;
    return `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (originalPreviewUrl) {
        URL.revokeObjectURL(originalPreviewUrl);
      }
      if (resultPreviewUrl) {
        URL.revokeObjectURL(resultPreviewUrl);
      }
    };
  }, [originalPreviewUrl, resultPreviewUrl]);

  const resetResult = () => {
    setResultPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setDownloadFileName("result.png");
    setPreviewMode("before");
    setComparePosition(50);
  };

  const validateFile = (file: File) => {
    if (!supportedMimeTypes.has(file.type)) {
      return "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP.";
    }

    if (file.size > maxFileSizeBytes) {
      return `File is too large. Maximum size is ${maxFileSizeMb}MB.`;
    }

    return "";
  };

  const setNextFile = (file: File | null) => {
    setError("");
    resetResult();

    setOriginalPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationMessage = validateFile(file);
    if (validationMessage) {
      setSelectedFile(null);
      setError(validationMessage);
      return;
    }

    setSelectedFile(file);
    setOriginalPreviewUrl(URL.createObjectURL(file));
    setDownloadFileName(`${file.name.replace(/\.[^.]+$/, "") || "result"}.png`);
    setPreviewMode("before");
    setComparePosition(50);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setNextFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    setNextFile(file);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const processImage = async () => {
    if (!selectedFile || isProcessing) return;

    setError("");
    setIsProcessing(true);
    resetResult();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to process image");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setResultPreviewUrl(objectUrl);
      setPreviewMode("compare");
      setComparePosition(50);
    } catch (processError) {
      const message =
        processError instanceof Error
          ? getFriendlyErrorMessage(processError.message)
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setError("");
    setIsDragging(false);
    setPreviewMode("before");
    setComparePosition(50);
    setIsAdjustingCompare(false);
    setOriginalPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    resetResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateComparePosition = (clientX: number) => {
    const frame = compareFrameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    const nextPosition = Math.min(100, Math.max(0, ratio));
    setComparePosition(nextPosition);
  };

  const handleComparePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!resultPreviewUrl || !originalPreviewUrl) return;
    setIsAdjustingCompare(true);
    updateComparePosition(event.clientX);
  };

  const handleComparePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isAdjustingCompare) return;
    updateComparePosition(event.clientX);
  };

  const handleComparePointerUp = () => {
    setIsAdjustingCompare(false);
  };

  const hasSelection = Boolean(selectedFile);
  const hasResult = Boolean(resultPreviewUrl);
  const canShowBefore = Boolean(originalPreviewUrl);
  const canShowAfter = Boolean(resultPreviewUrl);
  const canShowCompare = Boolean(originalPreviewUrl && resultPreviewUrl);
  const activePreviewUrl = previewMode === "after" ? resultPreviewUrl : originalPreviewUrl;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              ← Back to home
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Image Background Remover Tool
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Upload an image, remove the background, preview the transparent PNG,
              and download the result in seconds.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Supported
            </p>
            <p className="mt-2 text-sm text-slate-700">{supportedFormats.join(" / ")}</p>
            <p className="mt-1 text-sm text-slate-700">Max size: {maxFileSizeMb} MB</p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-xl font-semibold">Upload your image</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Choose a PNG, JPG, JPEG, or WEBP file. We validate the file before
              sending it to the background removal API.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition sm:min-h-72 sm:p-8 ${
                isDragging
                  ? "border-slate-900 bg-slate-100"
                  : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              <p className="text-base font-medium text-slate-700">Drop your image here</p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Drag and drop a file, or click to browse from your device.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Choose File
              </button>
              <p className="mt-4 text-xs text-slate-400">PNG / JPG / JPEG / WEBP · Up to 10 MB</p>
            </div>

            {fileSummary ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-800">Selected file</p>
                <p className="mt-1 break-all text-sm text-slate-600">{fileSummary}</p>
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Your image is processed only for background removal during the request lifecycle.
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {isProcessing ? (
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-800">
                <div className="flex items-center gap-3 font-medium">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700" />
                  Removing background...
                </div>
                <p className="mt-2 leading-7 text-sky-700">
                  Processing time depends on image size and background complexity. Please keep this page open.
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={processImage}
                disabled={!selectedFile || isProcessing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {isProcessing ? <Spinner /> : null}
                {isProcessing ? "Removing background..." : "Remove Background"}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">How it works</h3>
              <ol className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <li>1. Upload a supported image file.</li>
                <li>2. Click remove background to process it.</li>
                <li>3. Preview before, after, or compare mode and download the PNG.</li>
              </ol>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Result preview</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Compare the original upload with the processed transparent PNG before downloading.
                </p>
              </div>
              <div className="flex w-fit flex-wrap gap-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewMode("before")}
                  disabled={!canShowBefore}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    previewMode === "before"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  } disabled:cursor-not-allowed disabled:text-slate-400`}
                >
                  Before
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("after")}
                  disabled={!canShowAfter}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    previewMode === "after"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  } disabled:cursor-not-allowed disabled:text-slate-400`}
                >
                  After
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("compare")}
                  disabled={!canShowCompare}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    previewMode === "compare"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  } disabled:cursor-not-allowed disabled:text-slate-400`}
                >
                  Compare
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                {hasResult
                  ? previewMode === "compare"
                    ? "Interactive compare mode"
                    : previewMode === "after"
                      ? "Showing processed result"
                      : "Showing original upload"
                  : hasSelection
                    ? "Original preview ready"
                    : "Waiting for upload"}
              </span>
              {hasResult ? (
                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  Transparent PNG ready to download
                </span>
              ) : null}
            </div>

            <div className="mt-6 rounded-3xl bg-[linear-gradient(45deg,#f8fafc_25%,#e2e8f0_25%,#e2e8f0_50%,#f8fafc_50%,#f8fafc_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:24px_24px] p-4 sm:p-5">
              <div className="flex min-h-[18rem] items-center justify-center rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:min-h-80">
                {isProcessing ? (
                  <div className="flex max-w-md flex-col items-center text-center">
                    <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">Processing your image</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      We are removing the background now. The final PNG will appear here automatically.
                    </p>
                  </div>
                ) : previewMode === "compare" && canShowCompare ? (
                  <div className="w-full">
                    <div
                      ref={compareFrameRef}
                      className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-hidden rounded-2xl bg-white select-none ring-1 ring-slate-200"
                      onPointerDown={handleComparePointerDown}
                      onPointerMove={handleComparePointerMove}
                      onPointerUp={handleComparePointerUp}
                      onPointerLeave={handleComparePointerUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalPreviewUrl ?? undefined}
                        alt="Original image preview"
                        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                        draggable={false}
                      />
                      <div
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${comparePosition}%` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resultPreviewUrl ?? undefined}
                          alt="Processed image comparison preview"
                          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                          draggable={false}
                        />
                      </div>

                      <div
                        className="absolute inset-y-0 z-10 -ml-px w-0.5 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.15)]"
                        style={{ left: `${comparePosition}%` }}
                      />
                      <div
                        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-lg"
                        style={{ left: `${comparePosition}%` }}
                      >
                        ↔
                      </div>

                      <div className="absolute left-3 top-3 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        After
                      </div>
                      <div className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-slate-900 backdrop-blur">
                        Before
                      </div>
                    </div>

                    <div className="mt-4 px-1">
                      <label htmlFor="compare-range" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        Compare slider
                      </label>
                      <input
                        id="compare-range"
                        type="range"
                        min="0"
                        max="100"
                        value={comparePosition}
                        onChange={(event) => setComparePosition(Number(event.target.value))}
                        className="mt-3 w-full accent-slate-900"
                      />
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Drag the handle or use the slider to compare the original image with the processed PNG.
                      </p>
                    </div>
                  </div>
                ) : activePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePreviewUrl}
                    alt={previewMode === "after" ? "Processed image preview" : "Original image preview"}
                    className="max-h-[26rem] w-auto rounded-xl object-contain"
                  />
                ) : (
                  <div className="flex max-w-md flex-col items-center text-center">
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                      Preview area
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900">Upload an image to begin</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Your original file and processed transparent PNG will be shown here so you can compare the result before downloading.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Current view
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {previewMode === "compare" && hasResult
                    ? "Interactive before / after comparison"
                    : previewMode === "after" && hasResult
                      ? "After background removal"
                      : "Original upload"}
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-600">
                  Switch between the original file, processed output, or compare mode to verify edge quality.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Download format
                </p>
                <p className="mt-2 text-sm font-medium text-slate-800">Transparent PNG</p>
                <p className="mt-1 text-sm leading-7 text-slate-600">
                  Best for ecommerce product images, profile graphics, logos, stickers, and creative assets.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {resultPreviewUrl ? (
                <a
                  href={resultPreviewUrl}
                  download={downloadFileName}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-emerald-500"
                >
                  Download PNG
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-medium text-white"
                >
                  Download PNG
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Upload another image
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
