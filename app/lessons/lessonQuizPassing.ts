export const LESSON_QUIZ_PASS_PERCENT = 60;

export function hasPassedLessonQuiz(score: number, totalQuestions: number) {
  return (
    totalQuestions > 0 &&
    Math.round((score / totalQuestions) * 100) >= LESSON_QUIZ_PASS_PERCENT
  );
}
