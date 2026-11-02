import "dotenv/config";
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sourcePath = resolve(args.find((argument) => argument !== "--dry-run") ?? "prisma/dev.db");
const tableNames = ["User", "LessonProgress", "QuizAttempt", "QuizAnswer"];

function parseSqliteDate(value, field) {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
    throw new Error(`Could not parse a date in ${field}.`);
  }
  if (typeof value !== "string") {
    throw new Error(`Unexpected date value in ${field}.`);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const withTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const date = new Date(withTimezone);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Could not parse a date in ${field}.`);
  }

  return date;
}

function chunk(items, size = 500) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function readSourceDatabase() {
  if (!existsSync(sourcePath)) {
    throw new Error(`SQLite source database not found: ${sourcePath}`);
  }

  const source = new DatabaseSync(sourcePath, { readOnly: true });

  try {
    const integrity = source.prepare("PRAGMA quick_check").get();
    if (Object.values(integrity ?? {})[0] !== "ok") {
      throw new Error("The SQLite source database failed its integrity check.");
    }

    const foreignKeyProblems = source.prepare("PRAGMA foreign_key_check").all();
    if (foreignKeyProblems.length > 0) {
      throw new Error("The SQLite source database contains broken foreign keys.");
    }

    return {
      User: source.prepare('SELECT * FROM "User"').all(),
      LessonProgress: source.prepare('SELECT * FROM "LessonProgress"').all(),
      QuizAttempt: source.prepare('SELECT * FROM "QuizAttempt"').all(),
      QuizAnswer: source.prepare('SELECT * FROM "QuizAnswer"').all(),
    };
  } finally {
    source.close();
  }
}

function mapRows(rows) {
  return {
    User: rows.User.map((row) => ({
      ...row,
      createdAt: parseSqliteDate(row.createdAt, "User.createdAt"),
      updatedAt: parseSqliteDate(row.updatedAt, "User.updatedAt"),
    })),
    LessonProgress: rows.LessonProgress.map((row) => ({
      ...row,
      completed: Boolean(row.completed),
      lastAccessedAt: parseSqliteDate(row.lastAccessedAt, "LessonProgress.lastAccessedAt"),
      completedAt: row.completedAt == null
        ? null
        : parseSqliteDate(row.completedAt, "LessonProgress.completedAt"),
      createdAt: parseSqliteDate(row.createdAt, "LessonProgress.createdAt"),
      updatedAt: parseSqliteDate(row.updatedAt, "LessonProgress.updatedAt"),
    })),
    QuizAttempt: rows.QuizAttempt.map((row) => ({
      ...row,
      createdAt: parseSqliteDate(row.createdAt, "QuizAttempt.createdAt"),
    })),
    QuizAnswer: rows.QuizAnswer.map((row) => ({
      ...row,
      isCorrect: Boolean(row.isCorrect),
      createdAt: parseSqliteDate(row.createdAt, "QuizAnswer.createdAt"),
    })),
  };
}

async function insertRows(model, rows) {
  for (const batch of chunk(rows)) {
    if (batch.length > 0) {
      await model.createMany({ data: batch });
    }
  }
}

function safeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/postgres(?:ql)?:\/\/[^@\s]+@/gi, "postgresql://<redacted>@");
}

async function main() {
  const data = mapRows(readSourceDatabase());
  if (dryRun) {
    console.log("SQLite source validated; no data was written.");
    for (const table of tableNames) {
      console.log(`  ${table}: ${data[table].length} rows`);
    }
    return;
  }

  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error("DIRECT_URL is required for the SQLite import.");
  }

  const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });

  try {
    const counts = Object.fromEntries(
      await Promise.all(
        tableNames.map(async (table) => [
          table,
          await prisma[table[0].toLowerCase() + table.slice(1)].count(),
        ]),
      ),
    );

    const occupiedTables = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([table]) => table);

    if (occupiedTables.length > 0) {
      throw new Error(
        `Import stopped because these Neon tables are not empty: ${occupiedTables.join(", ")}.`,
      );
    }

    await prisma.$transaction(
      async (transaction) => {
        await insertRows(transaction.user, data.User);
        await insertRows(transaction.lessonProgress, data.LessonProgress);
        await insertRows(transaction.quizAttempt, data.QuizAttempt);
        await insertRows(transaction.quizAnswer, data.QuizAnswer);

        const expectedCounts = Object.fromEntries(
          tableNames.map((table) => [table, data[table].length]),
        );
        const actualCounts = Object.fromEntries(
          await Promise.all(
            tableNames.map(async (table) => [
              table,
              await transaction[table[0].toLowerCase() + table.slice(1)].count(),
            ]),
          ),
        );

        for (const table of tableNames) {
          if (actualCounts[table] !== expectedCounts[table]) {
            throw new Error(
              `Verification failed for ${table}: expected ${expectedCounts[table]}, found ${actualCounts[table]}.`,
            );
          }
        }
      },
      { maxWait: 10_000, timeout: 120_000 },
    );

    console.log("SQLite data imported and verified:");
    for (const table of tableNames) {
      console.log(`  ${table}: ${data[table].length} rows`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`SQLite-to-Neon import failed: ${safeErrorMessage(error)}`);
  process.exitCode = 1;
});
