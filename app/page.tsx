import { Suspense } from "react";
import { auth } from "@/auth";
import { connection } from "next/server";
import HomeLanding from "./HomeLanding";

async function PersonalizedHome() {
  await connection();
  const session = await auth();

  return <HomeLanding isAuthenticated={Boolean(session?.user)} />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="min-h-dvh bg-[#080D1B]"
        />
      }
    >
      <PersonalizedHome />
    </Suspense>
  );
}
