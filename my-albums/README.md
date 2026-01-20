# discvault

🌐 [discvault.vercel.app](https://discvault.vercel.app/)

## description

log albums you've listened to from start to finish, rate them, and keep your own listening history. with a minimalist interface that puts each artwork front and center, **discvault** turns your curiosity for discovering music into a unique visual archive.

**✨ now with multi-user authentication** - each user has their own private collection.

## features

- **🔐 multi-user authentication** with google oauth
- **📱 minimalist interface** inspired by premium brands
- **⭐ personal ratings** for each album (1-5 stars)
- **🎵 smart search** powered by itunes and musicbrainz apis
- **📱 responsive design** works perfectly on mobile and desktop
- **🔒 private collections** - each user sees only their own albums
- **⚡ real-time sync** across all your devices

## tech stack

- **[Next.js 15](https://nextjs.org/)** - react framework with app router
- **[TypeScript](https://www.typescriptlang.org/)** - static typing
- **[Tailwind CSS](https://tailwindcss.com/)** - utility-first styling
- **[Supabase](https://supabase.com/)** - database and authentication
- **[Radix UI](https://radix-ui.com/)** - primitive components
- **[Lucide React](https://lucide.dev/)** - icons
- **[Vercel](https://vercel.com/)** - hosting

## getting started

1. **sign in** with your google account
2. **add albums** by searching for artist or album name
3. **rate them** from 1 to 5 stars
4. **build your collection** - it's automatically saved and synced

## project structure

```
src/
├── app/                 # next.js app router
│   ├── globals.css     # global styles
│   ├── layout.tsx      # main layout
│   └── page.tsx        # main page
├── components/         # react components
│   ├── ui/            # reusable ui components
│   ├── add-album-modal.tsx
│   ├── album-card.tsx
│   ├── album-grid.tsx
│   ├── auth-button.tsx
│   ├── login-modal.tsx
│   └── ...
├── contexts/          # react contexts
│   └── auth-context.tsx
├── lib/               # utilities and configurations
│   ├── supabase.ts    # supabase client
│   └── utils.ts       # utility functions
├── services/          # api services
│   ├── albumService.ts
│   └── musicApi.ts
├── types/             # typescript definitions
│   └── album.ts
└── data/              # sample data
    └── sample-albums.ts
```

## authentication

- **google oauth** - secure login with your google account
- **row level security** - your albums are completely private
- **session management** - stay logged in across browser sessions
- **multi-device sync** - access your collection from anywhere

## api integration

- **itunes search api** - primary source for album data and artwork
- **musicbrainz api** - fallback for additional metadata
- **cover art archive** - high-quality album artwork

## contributions

if you want to contribute to the project:

1. fork the repository
2. create a branch for your feature (`git checkout -b feature/new-feature`)
3. commit your changes (`git commit -m 'add new feature'`)
4. push the branch (`git push origin feature/new-feature`)
5. open a pull request

## license

this project is under the MIT license.
