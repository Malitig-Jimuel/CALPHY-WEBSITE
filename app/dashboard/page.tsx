
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Atom, BookOpen, LogOut } from "lucide-react";

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#080D1B] px-5 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-white/10" />
        <div className="mt-14 h-8 w-72 rounded-lg bg-white/10" />
        <div className="mt-8 h-48 rounded-2xl bg-white/10" />
      </div>
    </main>
  );
}

async function DashboardContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#080D1B] px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-400 p-2.5 text-slate-950">
              <Atom size={25} />
            </div>
            <span className="text-2xl font-black">
              Calph<span className="text-sky-400">++</span>
            </span>
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
              <LogOut size={16} />
              Log out
            </button>
          </form>
        </header>

        <section className="py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
            Your learning space
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Welcome, {session.user.name || "Physics learner"}!
          </h1>

          <p className="mt-3 text-slate-400">
            You're signed in as {session.user.email}.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#10182B] p-7">
            <BookOpen className="text-sky-400" size={30} />

            <h2 className="mt-4 text-xl font-bold">Continue learning</h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Explore the six Physics modules and start building your learning
              progress.
            </p>

            <Link
              href="/#topics"
              className="mt-6 inline-block rounded-xl bg-sky-400 px-5 py-3 font-bold text-slate-950 hover:bg-sky-300"
            >
              Explore Physics lessons
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
