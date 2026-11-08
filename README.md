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

## AI Physics Practice

The `/ai-practice` page uses an OpenAI-compatible chat-completions API from a
server-side route for conceptual and multiple-choice exercises. Numerical
problem-solving and formula-application exercises use a local TypeScript
generator with independent arithmetic validation, so they do not require a
provider request. To enable the AI tutor, set these variables in the private
`.env` file and in the hosting provider's server environment:

```env
OPENAI_API_KEY="your-Groq-api-key"
AI_MODEL="qwen/qwen3.8-27b"
AI_BASE_URL="https://api.groq.com/openai/v1"
```

`OPENAI_API_KEY` is the supported key variable; the existing `AI_API_KEY` name
is also accepted as an alias. No additional key variable is required. The
provider must support the OpenAI-compatible `/chat/completions` endpoint and
JSON response format.
`AUTH_SECRET` is also required and must be a strong random value of at least 32
characters; the server uses it to encrypt generated answers so they are not sent
to the browser until a student asks to reveal the solution.
Restart the app after changing environment variables. Without a provider key,
the local numerical generators remain available; AI-generated conceptual and
multiple-choice exercises display a provider setup message.

Authenticated students receive 15 AI-assisted questions per Manila calendar
day. Successful local numerical questions are tracked separately and remain
available after that allowance is used. Failed generations do not consume the
allowance, and the server reserves AI requests atomically per student to prevent
concurrent requests from exceeding it. Guests can use local numerical practice
without an account; provider-backed guest requests remain subject to the
existing per-address rate limit.

The usage and verified question-bank tables require the active PostgreSQL
migration. After updating the app, run:

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate:deploy
```

The API validates model output and independently checks every numerical
calculation; local templates are also checked before use. This catches
malformed calculations but does not replace expert review of AI-generated
physics content. Requests are also limited per source address in each app
process; multi-instance deployments should add a shared rate-limit store for a
consistent global request rate.
