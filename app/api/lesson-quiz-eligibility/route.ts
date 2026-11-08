import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isLessonSlug,
  lessonSequence,
  prerequisiteFor,
  readGuestQuizProgress,
} from "@/lib/lessonQuizSequence";

export async function GET(request: Request) {
  const lessonSlug = new URL(request.url).searchParams.get("lessonSlug");
  if (!lessonSlug || !isLessonSlug(lessonSlug)) {
    return NextResponse.json(
      { error: "Select a valid Calph++ lesson." },
      { status: 400 }
    );
  }

  try {
    const session = await auth();
    let completedSlugs: Set<string>;
    let saved = false;
    if (session?.user?.id) {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonSlug: true },
      });
      completedSlugs = new Set(progress.map((entry) => entry.lessonSlug));
      saved = true;
    } else {
      completedSlugs = readGuestQuizProgress(request);
    }

    const prerequisite = prerequisiteFor(lessonSlug);
    const prerequisiteCompleted =
      prerequisite === null || completedSlugs.has(prerequisite.slug);
    const completed = completedSlugs.has(lessonSlug);
    const eligible = prerequisiteCompleted || completed;
    const allCompleted = lessonSequence.every((lesson) =>
      completedSlugs.has(lesson.slug)
    );

    return NextResponse.json({
      lessonSlug,
      eligible,
      completed,
      prerequisiteCompleted,
      prerequisiteTitle: prerequisite?.title ?? null,
      allCompleted,
      saved,
    });
  } catch (error) {
    console.error("Failed to load lesson quiz eligibility:", error);
    return NextResponse.json(
      { error: "Unable to check quiz eligibility. Please reload and try again." },
      { status: 500 }
    );
  }
}
