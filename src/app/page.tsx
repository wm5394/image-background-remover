import Link from "next/link";

const features = [
  "Remove backgrounds in seconds",
  "Download transparent PNG files",
  "No sign-up required",
];

const useCases = [
  "Product photos for ecommerce",
  "Portraits and profile pictures",
  "Logos, stickers, and creative assets",
];

const faqs = [
  {
    question: "What image formats are supported?",
    answer: "PNG, JPG, JPEG, and WEBP files are supported in the current version.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. You can upload an image, remove the background, and download the result directly.",
  },
  {
    question: "Are my images stored?",
    answer: "The app is designed to process images during the request lifecycle without long-term storage.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Image Background Remover",
  url: "https://image-background-remover.vercel.app",
  description:
    "Remove image backgrounds online in seconds. Upload your photo and download a transparent PNG instantly.",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  applicationCategory: "MultimediaApplication",
  name: "Image Background Remover",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "A web-based image background remover for generating transparent PNG files from uploaded images.",
  url: "https://image-background-remover.vercel.app/tools/image-background-remover",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Image Background Remover
          </Link>
          <Link
            href="/tools/image-background-remover"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Try the Tool
          </Link>
        </header>

        <section className="grid gap-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1.25fr_0.75fr] lg:p-12">
          <div className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              Fast online background removal
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Remove Background from Images Online
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Upload your image and get a transparent PNG in seconds. Simple,
                fast, and built for ecommerce sellers, creators, and designers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tools/image-background-remover"
                className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Upload Image
              </Link>
              <Link
                href="#faq"
                className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Read FAQ
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6">
            <div className="flex h-full min-h-72 flex-col justify-between rounded-2xl bg-[linear-gradient(45deg,#f8fafc_25%,#e2e8f0_25%,#e2e8f0_50%,#f8fafc_50%,#f8fafc_75%,#e2e8f0_75%,#e2e8f0_100%)] bg-[length:24px_24px] p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Preview</p>
                <h2 className="mt-2 text-2xl font-semibold">Transparent PNG output</h2>
              </div>
              <div className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                <p className="text-sm leading-7 text-slate-600">
                  Upload an image, remove the background, preview the result,
                  and download a transparent PNG from a single focused workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <h2 className="text-lg font-semibold">{feature}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A focused product experience designed to solve one job well.
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 rounded-3xl bg-slate-900 px-8 py-10 text-white lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Common use cases</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              This product is designed for users who need a clean, fast online tool
              to turn ordinary images into transparent PNG assets.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-1">
            {useCases.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Why use this tool?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Image Background Remover is built for speed and clarity. Instead of a large,
              complex editor, it gives users a quick path from upload to transparent PNG.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-semibold">Fast workflow</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Go from image upload to background-free export in just a few clicks.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-semibold">Useful output</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Download a transparent PNG suitable for product listings, profile graphics,
                thumbnails, and visual assets.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-6 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
