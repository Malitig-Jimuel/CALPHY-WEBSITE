"use client";

import { useCallback, useEffect, useState } from "react";

export type QuizQuestionOrder = {
  questionIndex: number;
  optionOrder: number[];
};

function shuffledIndexes(count: number) {
  const indexes = Array.from({ length: count }, (_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

export function createInitialQuestionOrder(
  optionCounts: readonly number[]
): QuizQuestionOrder[] {
  return optionCounts.map((count, questionIndex) => ({
    questionIndex,
    optionOrder: Array.from({ length: count }, (_, index) => index),
  }));
}

export function createShuffledQuestionOrder(
  optionCounts: readonly number[],
  previous?: readonly QuizQuestionOrder[]
): QuizQuestionOrder[] {
  const next = shuffledIndexes(optionCounts.length).map((questionIndex) => ({
    questionIndex,
    optionOrder: shuffledIndexes(optionCounts[questionIndex]),
  }));

  if (
    previous &&
    JSON.stringify(next) === JSON.stringify(previous) &&
    next.length > 1
  ) {
    [next[0], next[1]] = [next[1], next[0]];
  } else if (
    previous &&
    JSON.stringify(next) === JSON.stringify(previous) &&
    next[0]?.optionOrder.length > 1
  ) {
    [next[0].optionOrder[0], next[0].optionOrder[1]] = [
      next[0].optionOrder[1],
      next[0].optionOrder[0],
    ];
  }

  return next;
}

export function useShuffledQuestionOrder(optionCounts: readonly number[]) {
  const [questionOrder, setQuestionOrder] = useState(() =>
    createInitialQuestionOrder(optionCounts)
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setQuestionOrder((previous) =>
        createShuffledQuestionOrder(optionCounts, previous)
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [optionCounts]);

  const reshuffle = useCallback(() => {
    setQuestionOrder((previous) =>
      createShuffledQuestionOrder(optionCounts, previous)
    );
  }, [optionCounts]);

  return [questionOrder, reshuffle] as const;
}
