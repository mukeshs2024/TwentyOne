# TwentyOne Monorepo

This repository contains the TwentyOne application, structured as a monorepo using npm workspaces.

## Structure

- `/frontend`: Next.js frontend and server actions
- `/backend`: Prisma database configuration, schemas, and exported database client

## Development

To start the development server for the entire monorepo, run:

```bash
npm install
npm run dev
```

This will concurrently start any necessary services and the Next.js development server.

## Database

To push database schema changes and generate the Prisma client, run the following in the `/backend` directory:

```bash
npm run db:push
npm run db:generate
```
