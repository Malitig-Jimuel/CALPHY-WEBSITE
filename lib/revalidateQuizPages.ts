import { revalidatePath } from "next/cache";

export function revalidateQuizPages() {
  for (const path of [
    "/dashboard",
    "/dashboard/progress",
    "/dashboard/performance",
    "/dashboard/quiz-attempts",
    "/dashboard/quiz-history",
  ]) {
    revalidatePath(path);
  }
}
