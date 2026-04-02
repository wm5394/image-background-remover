"use client";

import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ToolClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("result.png");
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileSummary = useMemo(() => {
    if (!selectedFile) return null;
    return `${selectedFile.name} · ${formatBytes(selectedFile.size)}`;
  }, [selectedFile]);

  const resetResult = () => {
    setResultPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setDownloadFileName("result.png");
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
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setError("");
    setIsDragging(false);
    setOriginalPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    resetResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
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
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
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
              className={`mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center transition ${
                isDragging
                  ? "border-slate-900 bg-slate-100"
                  : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              <p className="text-base font-medium text-slate-700">Drop your image here</p>
              <p className="mt-2 text-sm text-slate-500">
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
                <p className="mt-1 text-sm text-slate-600">{fileSummary}</p>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={processImage}
                disabled={!selectedFile || isProcessing}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
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
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Result preview</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Preview the original upload or the processed transparent PNG before downloading.
            </p>

            <div className="mt-6 rounded-3xl bg-[linear-gradient(45deg,#f8fafc_25%,#e2e8f0_25%,#e2e8f0_50%,#f8fafc_50%,#f8fafc_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:24px_24px] p-5">
              <div className="flex min-h-80 items-center justify-center rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                {resultPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resultPreviewUrl}
                    alt="Processed image preview"
                    className="max-h-[26rem] w-auto rounded-xl object-contain"
                  />
                ) : originalPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={originalPreviewUrl}
                    alt="Original image preview"
                    className="max-h-[26rem] w-auto rounded-xl object-contain"
                  />
                ) : (
                  <div className="px-6 text-center">
                    <p className="text-base font-medium text-slate-700">No image uploaded yet</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Upload an image to preview it here. After processing, this panel will show the transparent PNG result.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {resultPreviewUrl ? (
                <a
                  href={resultPreviewUrl}
                  download={downloadFileName}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
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
