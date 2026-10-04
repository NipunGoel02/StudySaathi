import React, { useState } from 'react';
import { HelpCircle, RefreshCw, Sparkles, CheckCircle2, XCircle, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MCQs({ notes, mcqs, onGenerate, isLoading, error }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAllExplanations, setShowAllExplanations] = useState(false);

  const handleSelectOption = (qId, optionKey, correctAnswer) => {
    if (selectedAnswers[qId]) return; // prevent changing answer after selecting

    const updated = {
      ...selectedAnswers,
      [qId]: optionKey,
    };
    setSelectedAnswers(updated);

    // If all questions are answered, check score and launch confetti
    if (mcqs && Object.keys(updated).length === mcqs.length) {
      const correctCount = mcqs.reduce((acc, q) => {
        return updated[q.id] === q.correct_answer ? acc + 1 : acc;
      }, 0);
      if (correctCount >= mcqs.length * 0.7) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowAllExplanations(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = mcqs
    ? mcqs.reduce((acc, q) => (selectedAnswers[q.id] === q.correct_answer ? acc + 1 : acc), 0)
    : 0;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
            ❓
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">AI Practice MCQs</h2>
            <p className="text-xs text-slate-500">10 exam-style multiple-choice questions from your notes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mcqs && mcqs.length > 0 && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset selected answers"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Answers
            </button>
          )}

          <button
            type="button"
            disabled={isLoading || !notes}
            onClick={onGenerate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Creating questions...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {mcqs && mcqs.length > 0 ? "Generate New MCQs" : "Generate MCQs"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress & Score Bar when MCQs exist */}
      {mcqs && mcqs.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Answered: {answeredCount} / {mcqs.length}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Score: {correctCount} / {answeredCount || 0}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllExplanations(!showAllExplanations)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
          >
            {showAllExplanations ? "Hide Explanations" : "Reveal All Explanations"}
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                ❓
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-heading mb-1">
              Creating practice questions...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Formulating 10 exam-level MCQs with accurate answers and explanations using Ollama.
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        ) : mcqs && mcqs.length > 0 ? (
          <div className="space-y-6">
            {mcqs.map((mcq, index) => {
              const qId = mcq.id || index + 1;
              const selectedOpt = selectedAnswers[qId];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === mcq.correct_answer;
              const shouldShowExplanation = showAllExplanations || isAnswered;

              return (
                <div
                  key={qId}
                  className={`p-5 md:p-6 rounded-xl border transition-all ${
                    isAnswered
                      ? isCorrect
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-rose-200 bg-rose-50/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold font-mono shrink-0">
                      Q{index + 1}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug font-heading flex-1">
                      {mcq.question}
                    </h3>
                  </div>

                  {/* Options A, B, C, D */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {['A', 'B', 'C', 'D'].map((letter) => {
                      const optionText = mcq.options ? mcq.options[letter] : null;
                      if (!optionText) return null;

                      let btnStyle = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-700 bg-white";

                      if (isAnswered) {
                        if (letter === mcq.correct_answer) {
                          btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20";
                        } else if (letter === selectedOpt) {
                          btnStyle = "border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20";
                        } else {
                          btnStyle = "border-slate-200 text-slate-400 bg-slate-50 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={letter}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(qId, letter, mcq.correct_answer)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-sm transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isAnswered && letter === mcq.correct_answer
                              ? "bg-emerald-600 text-white"
                              : isAnswered && letter === selectedOpt
                              ? "bg-rose-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {letter}
                          </span>
                          <span className="flex-1 mt-0.5">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback and Explanation */}
                  {shouldShowExplanation && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        {isAnswered && (
                          isCorrect ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          )
                        )}
                        <span className="font-bold text-slate-800">
                          Correct Answer: Option {mcq.correct_answer}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed pt-1">
                        <strong className="text-slate-700">Explanation: </strong>
                        {mcq.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Generate New MCQs CTA */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={onGenerate}
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Generate New MCQs
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 mb-1">No Practice Questions Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Generate 10 multiple-choice questions based directly on your study notes to test your understanding.
            </p>
            <button
              type="button"
              disabled={!notes}
              onClick={onGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate MCQs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
