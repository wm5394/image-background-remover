# Image Background Remover

A simple MVP for removing image backgrounds online.

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Remove.bg API

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

## MVP scope

- Landing page
- Tool page scaffold
- `POST /api/remove-background`
- Basic file validation
- SEO metadata

## Next steps

- Add real upload UI and preview state
- Connect client page to API
- Add loading and error handling
- Improve mobile experience
- Deploy to Cloudflare or Vercel
