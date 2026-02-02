# Pokeranking

If you find this project useful, please consider giving it a ⭐ on GitHub!

![Sign In](frontend/public/screenshots/sign-in.png)

![Leaderboard](frontend/public/screenshots/leaderboard.png)

## Introduction

Pokeranking is a project that started as a hobby five years ago to help a Brazilian streamer rank his favorite Pokemon while also interacting with his community.

At the time, I implemented the entire application on Next.js using Vercel's serverless API. Five years later, I decided to rebuild it entirely from scratch, applying solid architectural design principles.

Users can create personalized rankings to rank their favorite Pokemon, organizing them into custom zones (S-tier, A-tier, etc.). When building a ranking, users pick Pokemon from boxes—curated collections that filter the full Pokedex. Everyone starts with a default box containing all Pokemon, but can create custom boxes or browse community-shared ones (e.g., "Gen 1 Only" or "Legendaries").

The platform also features role-based permissions where admins can manage Pokemon by adding the newest ones or editing Pokemon attributes. The Pokemon attributes were originally web-scraped, but they might include errors—which is where the community comes in to help.

## Tech Stack

This is an npm workspace monorepo with three packages:

| Package | Technology | Purpose |
| --- | --- | --- |
| `backend/` | NestJS 11, MongoDB, Mongoose, Upstash Redis | API server with JWT auth, caching, rate limiting |
| `frontend/` | Next.js 16, React 19, TailwindCSS 4, NextAuth | App Router frontend with shadcn/ui components |
| `packages/api-client/` | Orval, TanStack Query | Auto-generated typed API client from OpenAPI spec |

Services:

- **Image Storage**: Cloudinary + public static image
- **Distributed Cache**: Upstash Redis
- **Database**: MongoDB Atlas
- **Email**: Multiple Nodemailer providers
- **Error Tracking**: Sentry
- **Payments**: Stripe (donations) and PIX
- **Analytics**: Google Analytics
- **Deployment**: Vercel (serverless functions)

## Design Decisions

### Image Loading Strategy

Loading images was a difficult design choice. I ultimately decided to go with a mixed approach: loading the bulk of images from Next.js's public static serving for already-registered Pokemon, while using Cloudinary storage for new ones. This allows dynamic insertion without redeploying the entire application.

The idea behind this approach is to avoid hitting Cloudinary's free tier limit. Images are also cached on the user's end once loaded for the first time. Periodically, I run a script to move new Pokemon images from Cloudinary to Next.js static serving.

### Caching

The system was designed to be scalable while leveraging free-tier services. Caching is implemented on both the frontend (TanStack Query) and backend (Upstash Redis) for faster response times, while being careful not to exceed any quotas. Cache points were strategically placed on the heaviest queries: fetching all Pokemon and paginated user listings.

### Internationalization

There is a language requirement, so we leverage i18n on both the frontend and backend. The primary user base is Portuguese-speaking, but I wanted the platform to be accessible to everyone. Supported languages: English and Portuguese (Brazil).

### Database

The application relies on MongoDB transactions, which is why the Docker Compose setup configures MongoDB with replica set support. The database is hosted on MongoDB Atlas.

### Metrics

There's nothing too fancy here—just a denormalized count of how many Pokemon each user has ranked. I opted for this approach because there are many reads and few writes, and I didn't want to overload queries with heavy aggregations. A simple counter on the user's collection felt sufficient.

## Gamification — Theme System

Rankings feature a unlock progression system that rewards users for ranking more Pokemon:


Background customization is independent from card themes, with visual lock indicators and progress bars showing unlock requirements.

## Getting Started

```bash
# Start local infrastructure (MongoDB + Redis)
cd backend && docker-compose up -d

# Install dependencies
npm install

# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev

# Generate API client from OpenAPI spec
npm run api:full
```

See `CLAUDE.md` for a full list of commands and environment variable configuration.

## Acknowledgments

- Pokemon type SVG icons from [duiker101/pokemon-type-svg-icons](https://github.com/duiker101/pokemon-type-svg-icons)
