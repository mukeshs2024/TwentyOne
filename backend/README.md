# TwentyOne Backend

This directory contains the backend database configuration (Prisma) and server logic.

## Commands

- `npm run db:push`: Push the schema to the database
- `npm run db:generate`: Generate the Prisma client
- `npm run db:studio`: Open Prisma Studio to view data

## Structure

- `prisma/`: Prisma schema and migrations
- `src/`: Exported database client and functions
- `generated/`: Generated Prisma Client (ignored from source control)
