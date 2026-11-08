import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";
import { lessons } from "@/app/lessonModules";

export const guestQuizProgressCookie = "calph_quiz_progress";

export const lessonSequence = lessons.map((lesson) => ({
  slug: lesson.slug,
  title: lesson.title,
}));

export type LessonSlug = (typeof lessonSequence)[number]["slug"];

export function isLessonSlug(value: string): value is LessonSlug {
  return lessonSequence.some((lesson) => lesson.slug === value);
}

export function prerequisiteFor(lessonSlug: string) {
  const index = lessonSequence.findIndex((lesson) => lesson.slug === lessonSlug);
  return index > 0 ? lessonSequence[index - 1] : null;
}

function signProgress(progress: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "A random AUTH_SECRET with at least 32 characters is required to sign guest quiz progress."
    );
  }
  return createHmac("sha256", secret).update(progress).digest("base64url");
}

export function readGuestQuizProgress(request: Request): Set<LessonSlug> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return new Set();
  const value = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${guestQuizProgressCookie}=`))
    ?.slice(guestQuizProgressCookie.length + 1);
  if (!value) return new Set();

  const [encodedProgress, providedSignature, ...extra] = value.split(".");
  if (
    !encodedProgress ||
    encodedProgress.length > 512 ||
    !providedSignature ||
    providedSignature.length > 100 ||
    extra.length
  ) {
    return new Set();
  }

  const expectedSignature = signProgress(encodedProgress);
  const provided = Buffer.from(providedSignature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return new Set();
  }

  const decoded = Buffer.from(encodedProgress, "base64url").toString("utf8");
  const slugs = decoded
    .split(",")
    .filter((slug): slug is LessonSlug => isLessonSlug(slug));
  return new Set(slugs);
}

export function writeGuestQuizProgress(
  response: NextResponse,
  request: Request,
  completed: ReadonlySet<LessonSlug>
) {
  const encoded = Buffer.from([...completed].join(","), "utf8").toString(
    "base64url"
  );
  const value = `${encoded}.${signProgress(encoded)}`;
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${guestQuizProgressCookie}=${value}; Path=/; HttpOnly; SameSite=Lax${secure}`
  );
}
