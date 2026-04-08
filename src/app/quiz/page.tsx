"use client";

import { useState, useEffect, useCallback } from "react";
import { getActiveQuizzes, submitResponse } from "@/lib/firestore";
import { calculateFinalVector } from "@/lib/scoring";
import type { Quiz, Vector6 } from "@/types";
import { useRouter } from "next/navigation";

export default function QuizPage() {
  const router = useRouter();

  // 回答者情報
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);

  // クイズ状態
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(-1);
  const [answers, setAnswers] = useState<{ quizId: string; choiceIndex: number; responseTimeMs: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  useEffect(() => {
    getActiveQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentQuiz = quizzes[currentIndex];
  const totalQuestions = quizzes.length;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPct = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleStart = () => {
    setStarted(true);
    setQuestionStartTime(Date.now());
  };

  const handleNext = useCallback(async () => {
    if (selectedChoice < 0 || !currentQuiz) return;

    const responseTimeMs = Date.now() - questionStartTime;
    const newAnswers = [...answers, { quizId: currentQuiz.id, choiceIndex: selectedChoice, responseTimeMs }];
    setAnswers(newAnswers);

    if (isLast) {
      setSubmitting(true);
      const choiceVectors = newAnswers.map((a) => {
        const quiz = quizzes.find((q) => q.id === a.quizId)!;
        return quiz.choices[a.choiceIndex].vector;
      });
      const answerTimes = newAnswers.map((a) => a.responseTimeMs);
      const finalVector = calculateFinalVector(choiceVectors, answerTimes);

      await submitResponse({
        respondentName: name.trim() || "匿名",
        respondentEmail: email.trim() || "test@example.com",
        answers: newAnswers,
        finalVector: finalVector as Vector6,
        answerTimes,
      });
      router.push("/quiz/thanks");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedChoice(-1);
      setFadeKey((k) => k + 1);
      setQuestionStartTime(Date.now());
    }
  }, [selectedChoice, currentQuiz, answers, isLast, quizzes, name, email, router, questionStartTime]);

  // --- 入力フォーム画面 ---
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-base-900 mb-1">回答者情報</h2>
              <p className="text-sm text-base-400">入力は任意です。未入力でも回答できます。</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-medium text-base-500 uppercase tracking-wider mb-1.5">名前 / ニックネーム</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="匿名"
                  className="w-full bg-white border border-base-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-base-500 uppercase tracking-wider mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full bg-white border border-base-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-white py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "回答を始める"}
            </button>

            {!loading && quizzes.length === 0 && (
              <p className="text-center text-sm text-base-400 mt-4">現在設問が登録されていません。</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- ローディング / 設問なし ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-base-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-base-400">設問が登録されていません。</p>
        </div>
      </div>
    );
  }

  // --- クイズ画面 ---
  const choiceLabels = ["A", "B", "C", "D", "E"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* プログレス */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-base-500 mb-2.5">
              <span>
                Question <span className="font-medium text-base-700">{currentIndex + 1}</span> / {totalQuestions}
              </span>
              <span className="font-medium text-base-700">{progressPct}%</span>
            </div>
            <div className="w-full h-1 bg-base-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-600 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* 設問 */}
          <div key={fadeKey} className="mb-8 animate-fade-in">
            <p className="text-sm text-base-400 mb-1.5 tracking-wide uppercase font-medium">
              Q{currentIndex + 1} - {currentQuiz.category}
            </p>
            <h2 className="text-xl font-semibold leading-relaxed text-base-900">
              {currentQuiz.question}
            </h2>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3" key={`choices-${fadeKey}`}>
            {currentQuiz.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => setSelectedChoice(i)}
                className={`w-full text-left bg-white border rounded-xl p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-px hover:border-accent hover:bg-accent/5 ${
                  selectedChoice === i
                    ? "border-accent bg-accent/[0.08] shadow-[0_0_0_1px_#0d9488]"
                    : "border-base-200"
                }`}
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                    selectedChoice === i
                      ? "bg-accent text-white"
                      : "bg-base-100 text-base-500"
                  }`}
                >
                  {choiceLabels[i]}
                </span>
                <p className="font-medium text-base-800">{choice.text}</p>
              </button>
            ))}
          </div>

          {/* 次へ */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedChoice < 0 || submitting}
              className="bg-accent hover:bg-accent-dark text-white px-7 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "送信中..." : isLast ? "回答を送信" : "次の質問へ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-base-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-6 flex items-center h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728 0l.707.707M3 12h1m16 0h1m-2.929-7.071l-.707.707M6.636 6.636l-.707-.707" />
            </svg>
          </div>
          <span className="font-semibold text-base-800 tracking-tight">CorePoint</span>
        </div>
      </div>
    </header>
  );
}
