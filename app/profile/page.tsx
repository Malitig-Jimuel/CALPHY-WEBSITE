import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your Calph++ account and learning progress.",
};

async function ProfileContent() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <main className="h-full min-h-0 overflow-y-auto bg-[#080D1B] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
          Account settings
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Your Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
          Manage your personal information, security, and saved learning data.
        </p>
        <ProfileForm name={user.name ?? ""} email={user.email} />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="h-full min-h-0 overflow-y-auto bg-[#080D1B] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="mt-4 h-10 w-64 rounded bg-white/10" />
            <div className="mt-8 h-64 rounded-2xl bg-white/5" />
          </div>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
