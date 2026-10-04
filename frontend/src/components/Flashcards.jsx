import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Sparkles, ChevronLeft, ChevronRight, Shuffle, LayoutGrid, Maximize2, Check, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Flashcards({ notes, flashcards, onGenerate, isLoading, error }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState({});
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'grid'
  const [masteredCards, setMasteredCards] = useState({});

  // Reset states when new flashcards are generated
  useEffect(() => {
    setCurrentIndex(0);
    setRevealedCards({});
    setMasteredCards({});
  }, [flashcards]);

  const toggleReveal = (index) => {
    setRevealedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleNext = () => {
    if (!flashcards || flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (!flashcards || flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleMastered = (index, e) => {
    e?.stopPropagation();
    const updated = {
      ...masteredCards,
      [index]: !masteredCards[index],
    };
    setMasteredCards(updated);

    if (Object.values(updated).filter(Boolean).length === flashcards.length) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const masteredCount = Object.values(masteredCards).filter(Boolean).length;
  const currentCard = flashcards && flashcards[currentIndex];
  const isCurrentRevealed = revealedCards[currentIndex];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            🧠
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">AI Revision Flashcards</h2>
            <p className="text-xs text-slate-500">
              {flashcards ? `${flashcards.length} flashcards generated` : '10–15 quick recall flashcards'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {flashcards && flashcards.length > 0 && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'single' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Single Focus Card"
              >
                Focus
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="All Cards Grid"
              >
                Grid
              </button>
            </div>
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
                Preparing flashcards...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {flashcards && flashcards.length > 0 ? "Regenerate Flashcards" : "Generate Flashcards"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar when flashcards exist */}
      {flashcards && flashcards.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-100 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Progress: {viewMode === 'single' ? `Card ${currentIndex + 1} of ${flashcards.length}` : `${flashcards.length} Cards Total`}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Mastered: {masteredCount} / {flashcards.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const allRev = {};
              flashcards.forEach((_, i) => { allRev[i] = true; });
              setRevealedCards(allRev);
            }}
            className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline underline-offset-2"
          >
            Reveal All
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                🧠
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-heading mb-1">
              Preparing your flashcards...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Creating bite-sized question and answer cards for active recall and exam revision.
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        ) : flashcards && flashcards.length > 0 ? (
          viewMode === 'single' ? (
            /* Single Focus Flashcard Carousel */
            <div className="max-w-2xl mx-auto space-y-6">
              <div
                onClick={() => toggleReveal(currentIndex)}
                className="group relative min-h-[260px] md:min-h-[290px] p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      #{currentIndex + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {isCurrentRevealed ? 'Answer' : 'Question'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleMastered(currentIndex, e)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      masteredCards[currentIndex]
                        ? 'bg-emerald-100 text-emerald-700 font-semibold'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {masteredCards[currentIndex] ? 'Mastered' : 'Mark as known'}
                  </button>
                </div>

                {/* Question / Answer Content */}
                <div className="py-6 my-auto text-center">
                  {!isCurrentRevealed ? (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 block mb-2">
                        Question
                      </span>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug font-heading">
                        {currentCard.question}
                      </h3>
                      <p className="text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                        <span>Click card to reveal answer</span>
                      </p>
                    </div>
                  ) : (
                    <div className="animate-fadeIn">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-2">
                        Answer
                      </span>
                      <p className="text-base md:text-lg font-medium text-slate-800 leading-relaxed">
                        {currentCard.answer}
                      </p>
                      <p className="text-xs text-slate-400 mt-4 font-medium">
                        Click card to flip back to question
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Card {currentIndex + 1} of {flashcards.length}</span>
                  <span className="text-indigo-600 font-medium group-hover:underline">
                    {isCurrentRevealed ? "Flip back" : "Reveal answer →"}
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous card"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs px-2 py-1">
                  {flashcards.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentIndex
                          ? 'w-6 bg-indigo-600'
                          : masteredCards[i]
                          ? 'w-2 bg-emerald-400'
                          : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                      title={`Go to card ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Next card"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Grid View of all Flashcards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((card, idx) => {
                const isRevealed = revealedCards[idx];
                const isMastered = masteredCards[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleReveal(idx)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[200px] ${
                      isRevealed
                        ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleMastered(idx, e)}
                          className={`p-1 rounded-md text-xs cursor-pointer ${
                            isMastered ? 'bg-emerald-100 text-emerald-700' : 'text-slate-300 hover:text-slate-600'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!isRevealed ? (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                            Question
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug font-heading">
                            {card.question}
                          </h4>
                        </div>
                      ) : (
                        <div className="animate-fadeIn">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                            Answer
                          </span>
                          <p className="text-xs font-medium text-slate-800 leading-relaxed">
                            {card.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{isRevealed ? "Answer revealed" : "Click to reveal"}</span>
                      <span className="text-indigo-600 font-semibold">{isRevealed ? "Flip ↺" : "Reveal →"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Layers className="w-10 h-10 text-slate-300 mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 mb-1">No Flashcards Generated Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Create 10 to 15 quick recall flashcards from your study notes to practice definitions and core concepts.
            </p>
            <button
              type="button"
              disabled={!notes}
              onClick={onGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Flashcards
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
