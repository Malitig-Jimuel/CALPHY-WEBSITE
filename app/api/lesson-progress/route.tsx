
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowedLessons = [
  "measurements-vectors",
  "fluids",
  "temperature-heat",
  "waves-sound",
  "optics",
  "electricity",
];

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Please log in to save your progress." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { lessonSlug, completed } = body as {
      lessonSlug?: unknown;
      completed?: unknown;
    };

    if (
      typeof lessonSlug !== "string" ||
      !allowedLessons.includes(lessonSlug) ||
      typeof completed !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid lesson progress data." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonSlug: {
          userId: user.id,
          lessonSlug,
        },
      },
      create: {
        userId: user.id,
        lessonSlug,
        completed,
        completedAt: completed ? now : null,
        lastAccessedAt: now,
      },
      update: {
        completed,
        completedAt: completed ? now : null,
        lastAccessedAt: now,
      },
    });

    return NextResponse.json({
      message: "Lesson progress saved.",
      progress,
    });
  } catch (error) {
    console.error("Failed to save lesson progress:", error);

    return NextResponse.json(
      { error: "Unable to save lesson progress." },
      { status: 500 }
    );
  }
}
