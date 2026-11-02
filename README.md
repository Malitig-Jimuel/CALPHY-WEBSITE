# Calph++

## Neon database setup

The project uses Neon PostgreSQL for application data. Existing SQLite student accounts, lesson progress, quiz attempts, and answer-review details can be imported without changing their IDs or password hashes.

### 1. Get both Neon connection strings

1. Open your project in the [Neon Console](https://console.neon.tech/).
2. Select the branch, database, and role you want the app to use, then choose **Connect**.
3. Copy the **pooled** connection string for the app. Copy the **direct** connection string separately for Prisma migrations.
4. Keep both strings private. Do not paste them into chat or commit them to source control.

### 2. Configure local environment variables

Open the existing `.env` file in the project root. Replace the SQLite `DATABASE_URL` with the pooled Neon URL and add the direct URL as `DIRECT_URL`:

```env
DATABASE_URL="postgresql://...pooled Neon connection string..."
DIRECT_URL="postgresql://...direct Neon connection string..."
```

Keep the existing `AUTH_SECRET` unchanged. `.env` is ignored by Git. `DATABASE_URL` is used by the app; Prisma's CLI uses `DIRECT_URL` so migrations do not go through Neon’s pooler.

### 3. Back up the local database and stop app writes

Stop the local development server and any other process that might update the SQLite database. Make a separate backup before importing:

```powershell
Copy-Item .\prisma\dev.db .\prisma\dev.db.before-neon.bak
```

The importer reads `prisma/dev.db` without modifying it. Keep the original and the backup until you have confirmed the Neon data and application behavior.

### 4. Create the Neon tables and import existing data

Optionally validate the local source and preview row counts without connecting to Neon:

```powershell
npm.cmd run db:import:sqlite:check
```

Run these commands from the project directory:

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate:deploy
npm.cmd run db:import:sqlite
```

The importer connects with `DIRECT_URL`, validates the SQLite database and its foreign keys, then copies users, lesson progress, quiz attempts, and quiz answers in a transaction. It retains IDs and timestamps, checks the imported row counts, and refuses to import if any of the four Neon application tables already contain rows. Do not manually clear Neon tables to bypass that check.

After a successful import, start the app and confirm that you can sign in and see existing progress and quiz history. You can then run:

```powershell
npm.cmd run lint
npm.cmd run build
```

### Notes

- The old SQLite migrations are kept under `prisma/sqlite-migrations-archive`; the active Prisma migration history is PostgreSQL-only.
- Keep the SQLite database and backup until the migration is verified. Do not run the importer repeatedly; it intentionally rejects a populated target.
- For a deployed app, set `DATABASE_URL` and `DIRECT_URL` in the hosting provider’s environment settings as well. Never put real connection strings in `.env.example`.

## Local development

Install dependencies, configure the environment variables above, and start the development server:

```powershell
npm.cmd install
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000).
