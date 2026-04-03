# Image Background Remover

A focused Next.js app for removing image backgrounds online and downloading transparent PNG files.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Remove.bg API

## Features

- Landing page with SEO-focused copy
- Dedicated tool page at `/tools/image-background-remover`
- Drag-and-drop image upload
- Client-side file validation
- Original image preview
- Processed PNG preview
- Transparent PNG download
- Server API route for Remove.bg integration
- Improved user-facing error messages
- FAQ structured data for SEO

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` file:

```bash
REMOVE_BG_API_KEY=
MAX_FILE_SIZE_MB=10
```

Then open:

```bash
http://localhost:3000
```

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## How it works

1. Upload a PNG, JPG, JPEG, or WEBP image.
2. The client validates file type and size.
3. The app sends the file to `POST /api/remove-background`.
4. The API forwards the image to Remove.bg.
5. The processed PNG is returned and shown in the preview panel.
6. The user downloads the transparent PNG.

## Environment variables

- `REMOVE_BG_API_KEY`: your Remove.bg API key
- `MAX_FILE_SIZE_MB`: optional max upload size, defaults to `10`

## Deployment notes

This app is ready to deploy on Vercel.

Before deploying, make sure you:

- add `REMOVE_BG_API_KEY` in project environment variables
- optionally set `MAX_FILE_SIZE_MB`
- update `metadataBase` in `src/app/layout.tsx` if you use a different domain

### Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Output setting: leave default for Next.js.
6. Add environment variables:
   - `REMOVE_BG_API_KEY`
   - `MAX_FILE_SIZE_MB=10` (optional)
7. Deploy.

### Recommended post-deploy checks

- Open `/` and `/tools/image-background-remover`
- Upload a small test image
- Confirm background removal succeeds
- Confirm PNG download works
- If you use a custom domain, update `metadataBase` in `src/app/layout.tsx`

## Current status

The MVP workflow is implemented and production build passes successfully.
