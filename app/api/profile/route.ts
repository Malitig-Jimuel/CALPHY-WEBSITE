import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(254),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72),
  confirmPassword: z.string().min(8).max(72),
});

const resetSchema = z.object({
  currentPassword: z.string().min(1).max(72),
});

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
}

function revalidateLearningPages() {
  revalidatePath("/home");
  revalidatePath("/dashboard/progress");
  revalidatePath("/dashboard/performance");
  revalidatePath("/dashboard/quiz-attempts");
  revalidatePath("/dashboard/quiz-history");
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to update your profile." }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid name and email address." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, email },
      select: { id: true, name: true, email: true },
    });

    revalidateLearningPages();
    revalidatePath("/profile");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email address is already associated with another account." },
        { status: 409 }
      );
    }

    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Unable to update your profile right now." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to manage your account." }, { status: 401 });
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    if (data.action === "change-password") {
      const parsed = passwordSchema.safeParse(data);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Use a password of at least 8 characters and confirm it." },
          { status: 400 }
        );
      }

      if (parsed.data.newPassword !== parsed.data.confirmPassword) {
        return NextResponse.json(
          { error: "The new password and confirmation do not match." },
          { status: 400 }
        );
      }

      if (Buffer.byteLength(parsed.data.newPassword, "utf8") > 72) {
        return NextResponse.json(
          { error: "The new password must not exceed 72 UTF-8 bytes." },
          { status: 400 }
        );
      }

      if (Buffer.byteLength(parsed.data.currentPassword, "utf8") > 72) {
        return NextResponse.json(
          { error: "The current password must not exceed 72 UTF-8 bytes." },
          { status: 400 }
        );
      }

      if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
        return NextResponse.json(
          { error: "Your current password is incorrect." },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return NextResponse.json({ message: "Password updated successfully." });
    }

    if (data.action === "reset-progress") {
      const parsed = resetSchema.safeParse(data);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Enter your current password to reset progress." },
          { status: 400 }
        );
      }

      if (Buffer.byteLength(parsed.data.currentPassword, "utf8") > 72) {
        return NextResponse.json(
          { error: "The current password must not exceed 72 UTF-8 bytes." },
          { status: 400 }
        );
      }

      if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
        return NextResponse.json(
          { error: "Your current password is incorrect." },
          { status: 400 }
        );
      }

      await prisma.$transaction([
        prisma.quizAttempt.deleteMany({ where: { userId: user.id } }),
        prisma.lessonProgress.deleteMany({ where: { userId: user.id } }),
      ]);

      revalidateLearningPages();

      return NextResponse.json({ message: "Your learning progress was reset." });
    }

    return NextResponse.json({ error: "Unknown profile action." }, { status: 400 });
  } catch (error) {
    console.error("Failed to manage profile security or progress:", error);
    return NextResponse.json(
      { error: "Unable to complete that request right now." },
      { status: 500 }
    );
  }
}
