import React, { useState } from 'react';
import { BookOpen, Copy, Check, RefreshCw, Sparkles, FileText, Share2, Layers } from 'lucide-react';

export default function Summary({ notes, summaryData, onGenerate, isLoading, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summaryData) return;
    navigator.clipboard.writeText(summaryData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to nicely format markdown-like text with bold, headings, and bullet points
  const renderFormattedSummary = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-slate-700 leading-relaxed text-sm md:text-base">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Markdown Main Headings (e.g. # or ##)
          if (trimmed.startsWith('#')) {
            const level = trimmed.match(/^#+/)[0].length;
            const headingText = trimmed.replace(/^#+\s*/, '');
            if (level === 1) {
              return (
                <h3 key={idx} className="text-lg md:text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mt-4 pt-2 font-heading flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                  {headingText}
                </h3>
              );
            }
            return (
              <h4 key={idx} className="text-base md:text-lg font-semibold text-indigo-950 mt-3 pt-1 font-heading">
                {headingText}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const content = trimmed.replace(/^[-*•]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="text-indigo-500 font-bold mt-1 text-base leading-none">•</span>
                <span className="flex-1">{formatInlineEmphasis(content)}</span>
              </div>
            );
          }

          // Numbered items
          const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="font-bold text-indigo-600 text-xs mt-1 px-1.5 py-0.5 bg-indigo-50 rounded">
                  {numMatch[1]}
                </span>
                <span className="flex-1">{formatInlineEmphasis(numMatch[2])}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-slate-700">
              {formatInlineEmphasis(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to parse **bold** emphasis and inline `code`
  const formatInlineEmphasis = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 bg-indigo-50/60 px-1 py-0.5 rounded">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            📝
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">AI Exam Summary</h2>
            <p className="text-xs text-slate-500">Concise, exam-oriented concepts & definitions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summaryData && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy entire summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Summary</span>
                </>
              )}
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
                Reading notes...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {summaryData ? "Regenerate Summary" : "Generate Summary"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                📝
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 font-heading mb-1">
              Study Saathi is reading your notes...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Extracting key concepts, formulas, and definitions using local Ollama model.
            </p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        ) : summaryData ? (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                <Sparkles className="w-3.5 h-3.5" /> Generated locally with Ollama
              </span>
              <span>Exam Revision Ready</span>
            </div>
            {renderFormattedSummary(summaryData)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
            <h4 className="text-sm font-semibold text-slate-700 mb-1">No Summary Generated Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Click &quot;Generate Summary&quot; to transform your uploaded notes into concise, exam-ready review points.
            </p>
            <button
              type="button"
              disabled={!notes}
              onClick={onGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
