import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Image Background Remover Tool | Remove Background Online",
  description:
    "Use our online image background remover to delete backgrounds from photos and download transparent PNG files instantly.",
  alternates: {
    canonical: "/tools/image-background-remover",
  },
};

const supportedFormats = ["PNG", "JPG", "JPEG", "WEBP"];

export default function ToolPage() {
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
              This is the MVP tool page scaffold. Next, connect the upload form to
              the remove background API and render the processed transparent PNG.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Supported
            </p>
            <p className="mt-2 text-sm text-slate-700">{supportedFormats.join(" / ")}</p>
            <p className="mt-1 text-sm text-slate-700">Max size: 10 MB</p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Upload area</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Replace this placeholder with a file input, drag-and-drop zone,
              client-side validation, loading state, and error handling.
            </p>

            <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-base font-medium text-slate-700">Upload Image</p>
              <p className="mt-2 text-sm text-slate-500">
                Drag and drop an image here, or click to browse.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Choose File
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Result preview</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Show the processed image here after the API request succeeds.
            </p>

            <div className="mt-6 min-h-72 rounded-3xl bg-[linear-gradient(45deg,#f8fafc_25%,#e2e8f0_25%,#e2e8f0_50%,#f8fafc_50%,#f8fafc_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:24px_24px] p-5">
              <div className="flex h-full min-h-62 items-center justify-center rounded-2xl bg-white/80 px-6 text-center shadow-sm ring-1 ring-slate-200 backdrop-blur">
                <div>
                  <p className="text-base font-medium text-slate-700">Preview placeholder</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Once processing is wired up, users will preview the transparent PNG here.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Download PNG
              </button>
              <button
                type="button"
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
