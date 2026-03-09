# Gym Dorian - Frontend

Next.js application for workout tracking and planning, built with React 19, TypeScript, and Tailwind CSS.

This project is designed as a hands-on exploration of modern AI-assisted development, serving as a sandbox to **evaluate** and **master** tools such as **GitHub Copilot**, **Claude Code**, and other emerging LLM-based workflows. The codebase and architecture are **intentionally** shaped to <ins>test the limits of AI pair-programming, automated refactoring, and agentic coding patterns</ins>.

## Getting Started

### Prerequisites

- Node.js 20+ 
- Backend API running (see [gym-dorian](../gym-dorian))
- Docker and Docker Compose (for containerized development)

### Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Docker Development (with hot-reload)

**Prerequisites:** Backend must be running first to create the shared Docker network.

1. Start the backend services:
```bash
cd ../gym-dorian
docker-compose up -d
```

2. Verify the network exists:
```bash
docker network ls | grep gym-dorian
# Should show: gym-dorian_default
```

3. Start the frontend development container:
```bash
cd ../gym-dorian-frontend
docker-compose -f docker-compose.dev.yml up
```

The application will be available at [http://localhost:3000](http://localhost:3000) with hot-reload enabled.

**Hot-reload**: Changes to [src/](src/), [public/](public/), and [messages/](messages/) are automatically reflected without rebuilding.

### Production Build (Docker)

1. Set production environment variables in `.env.docker`:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

2. Build and start production container:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.docker up --build
```

For production deployments, update the API URL to your actual production endpoint.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-types` - Generate TypeScript types from backend OpenAPI spec

## Environment Variables

### Build-time Variables

- `NEXT_PUBLIC_API_URL` - Backend API endpoint (embedded in client bundle)

### Environment Files

- `.env.local` - Local development (outside Docker)
- `.env.docker` - Docker container configuration

## Docker Architecture

The frontend connects to the backend via Docker's `gym-dorian_default` network:

```
┌─────────────────────────────────────────┐
│  gym-dorian_default (Docker network)    │
│                                          │
│  ┌──────────┐        ┌──────────────┐  │
│  │   api    │  ←───  │   frontend   │  │
│  │  :8000   │        │    :3000     │  │
│  └──────────┘        └──────────────┘  │
│       ↓                     ↓           │
│  ┌──────────┐               │          │
│  │    db    │               │          │
│  │  :5432   │               │          │
│  └──────────┘               │          │
└──────────────────────────────┼──────────┘
                               │
                        localhost:3000
                               │
                          [Browser]
```

**Container-to-container**: Frontend uses `http://api:8000/api` (Docker DNS)  
**Browser-to-frontend**: User accesses `http://localhost:3000` (exposed port)

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Internationalization**: next-intl (en-US, pt-BR)
- **Charts**: Recharts

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Backend API Documentation](../gym-dorian/README.md)
- [API Guides](../gym-dorian/docs/)

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (authenticated)/      # Protected routes
│   ├── login/               # Auth pages
│   └── register/
├── components/              # Reusable components
│   ├── layout/             # Header, Sidebar
│   └── ui/                 # UI primitives
├── lib/
│   ├── api/                # API client & services
│   └── stores/             # Zustand stores
└── types/                  # TypeScript type definitions
```
