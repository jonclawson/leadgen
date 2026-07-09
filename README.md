# Leadgen

Create landing pages and collect leads — fast.

Leadgen is a fullstack application built with [Analog](https://analogjs.org), the Angular meta-framework. It provides everything you need to spin up lead-capture landing pages, build custom forms with a drag-and-drop editor, and manage submissions in one place.

## Features

- **Landing Pages** — Write and publish Markdown-based landing pages with rich content (headings, code blocks, tables, images, blockquotes, and more).
- **Drag-and-Drop Form Builder** — Visually design custom lead capture forms using a multi-step builder. Add, edit, reorder, and delete fields including text, password, textarea, select, checkbox, radio, and submit button. Supports validators (required, email, min/max length, pattern).
- **Attach Forms to Pages** — Associate any form with a landing page to embed it directly below your content for seamless lead collection.
- **Lead Management Dashboard** — View, search, filter by date range, sort, and paginate through all collected leads. Quickly inspect submission data and delete unwanted entries.
- **Authentication** — Sign up and sign in with email/password (powered by Better Auth). Users manage their own pages, forms, and leads.
- **Stripe subscriptions** - Users must subscribe to make their landing pages visible. 

## Tech Stack

- **Frontend:** Angular 21, Analog.js, Angular Material, Tailwind CSS
- **Backend:** Analog.js server routes, Prisma ORM
- **Database:** SQLite (via Better SQLite3 adapter)
- **Auth:** Better Auth
- **Markdown:** `marked` with syntax highlighting via `prismjs`

## Setup

Run `npm install` to install the application dependencies.

```bash
npm install
```

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Generate the Prisma client and run database migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Optionally seed the database with sample data:

```bash
npm run seed
```

## Development

Run `npm start` for a dev server. Navigate to `http://localhost:5173/`. The application automatically reloads if you change any of the source files.

```bash
npm start
```

## Build

Run `npm run build` to build the client and server. The client build artifacts are located in `dist/analog/public`. The server/API build artifacts are located in `dist/analog/server`.

```bash
npm run build
```

## Test

Run `npm run test` to execute unit tests with [Vitest](https://vitest.dev).

```bash
npm run test
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── articles/          # Article view, edit, and list components
│   │   ├── form-builder/      # Drag-and-drop form builder with field editor dialog
│   │   ├── forms/             # Dynamic form renderer and field components
│   │   └── auth.component.ts  # Authentication components
│   ├── pages/
│   │   ├── (layout)/          # Authenticated routes (dashboard, forms, submissions)
│   │   └── [slug].page.ts     # Public landing page route (slug-based)
│   ├── services/              # API services for articles, forms, submissions
│   └── models/                # TypeScript interfaces and types
├── server/
│   ├── routes/
│   │   └── api/
│   │       ├── articles/      # Article CRUD API endpoints
│   │       ├── forms/         # Form CRUD API endpoints
│   │       ├── form-submissions/ # Submission CRUD API endpoints
│   │       └── auth/          # Authentication API endpoints
│   └── utils/                 # Auth helpers and middleware
├── lib/                       # Prisma client and auth client
└── prisma/                    # Database schema and migrations