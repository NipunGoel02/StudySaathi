import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, AlertCircle, ShieldCheck, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import MCQs from './components/MCQs';
import Flashcards from './components/Flashcards';

export default function App() {
  const [fileInfo, setFileInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'mcqs' | 'flashcards'

  // AI Content State
  const [summaryData, setSummaryData] = useState(null);
  const [mcqsData, setMcqsData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);

  // Loading States
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingMcqs, setIsGeneratingMcqs] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Error States
  const [globalError, setGlobalError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [mcqsError, setMcqsError] = useState(null);
  const [flashcardsError, setFlashcardsError] = useState(null);

  // Health / Ollama Status
  const [ollamaStatus, setOllamaStatus] = useState({
    available: false,
    selected_model: 'qwen3:4b',
    loading: true,
  });

  // Check Ollama server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health');
        if (res.ok) {
          const data = await res.json();
          setOllamaStatus({
            available: data.ollama?.available ?? false,
            selected_model: data.ollama?.selected_model || 'qwen3:4b',
            loading: false,
          });
        } else {
          setOllamaStatus((prev) => ({ ...prev, available: false, loading: false }));
        }
      } catch {
        setOllamaStatus((prev) => ({ ...prev, available: false, loading: false }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const clearErrors = () => {
    setGlobalError(null);
    setSummaryError(null);
    setMcqsError(null);
    setFlashcardsError(null);
  };

  const handleUploadSuccess = (info) => {
    clearErrors();
    setFileInfo(info);
    // Reset previous generated materials for new notes
    setSummaryData(null);
    setMcqsData(null);
    setFlashcardsData(null);
  };

  const triggerError = (msg) => {
    setGlobalError(msg);
    setTimeout(() => {
      setGlobalError((prev) => (prev === msg ? null : prev));
    }, 6000);
  };

  // Generate Summary handler
  const handleGenerateSummary = async () => {
    if (!fileInfo || !fileInfo.text) {
      triggerError("Please upload your study notes first.");
      return;
    }
    clearErrors();
    setActiveTab('summary');
    setIsGeneratingSummary(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: fileInfo.text, model: ollamaStatus.selected_model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }
      setSummaryData(data.summary);
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      setSummaryError(msg);
      triggerError(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate MCQs handler
  const handleGenerateMCQs = async () => {
    if (!fileInfo || !fileInfo.text) {
      triggerError("Please upload your study notes first.");
      return;
    }
    clearErrors();
    setActiveTab('mcqs');
    setIsGeneratingMcqs(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: fileInfo.text, model: ollamaStatus.selected_model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }
      setMcqsData(data.mcqs);
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      setMcqsError(msg);
      triggerError(msg);
    } finally {
      setIsGeneratingMcqs(false);
    }
  };

  // Generate Flashcards handler
  const handleGenerateFlashcards = async () => {
    if (!fileInfo || !fileInfo.text) {
      triggerError("Please upload your study notes first.");
      return;
    }
    clearErrors();
    setActiveTab('flashcards');
    setIsGeneratingFlashcards(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: fileInfo.text, model: ollamaStatus.selected_model }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }
      setFlashcardsData(data.flashcards);
    } catch (err) {
      const msg = err.message || "Something went wrong. Please try again.";
      setFlashcardsError(msg);
      triggerError(msg);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation / Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                  Study Saathi
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                &quot;Your personal AI study companion&quot;
              </p>
            </div>
          </div>

          {/* Local AI Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                ollamaStatus.available
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                ollamaStatus.available
                  ? `Connected to local Ollama (${ollamaStatus.selected_model})`
                  : 'Ollama is offline or unreachable'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaStatus.available
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span>● Local AI</span>
              {ollamaStatus.available && (
                <span className="hidden md:inline font-mono font-normal text-[11px] text-emerald-600/90 pl-1 border-l border-emerald-200">
                  {ollamaStatus.selected_model}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 flex-1">
        {/* Subtitle banner for mobile */}
        <div className="block sm:hidden text-center pb-2">
          <p className="text-xs text-slate-500 italic">
            &quot;Your personal AI study companion&quot;
          </p>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between gap-3 shadow-xs animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{globalError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              className="text-xs font-bold text-rose-400 hover:text-rose-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Upload Card */}
        <section aria-label="Upload Notes Section">
          <FileUpload
            fileInfo={fileInfo}
            onUploadSuccess={handleUploadSuccess}
            onError={triggerError}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </section>

        {/* Section 2: AI Tools Section */}
        <section aria-label="AI Tools Section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Study Tools
            </h2>
            {fileInfo ? (
              <span className="text-xs text-slate-500">
                Notes ready for revision
              </span>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Upload notes above to unlock tools
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: AI Summary */}
            <div
              className={`p-6 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                activeTab === 'summary' && fileInfo
                  ? 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              } ${!fileInfo ? 'opacity-85' : ''}`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4">
                  📝
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
                  AI Summary
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Turn your notes into concise exam-ready points.
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingSummary}
                onClick={handleGenerateSummary}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'summary' && summaryData
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isGeneratingSummary ? (
                  <span>Generating...</span>
                ) : summaryData ? (
                  <span>View Summary</span>
                ) : (
                  <span>Generate Summary</span>
                )}
              </button>
            </div>

            {/* Card 2: AI MCQs */}
            <div
              className={`p-6 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                activeTab === 'mcqs' && fileInfo
                  ? 'border-purple-400 ring-2 ring-purple-400/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              } ${!fileInfo ? 'opacity-85' : ''}`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl mb-4">
                  ❓
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
                  AI MCQs
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Practice with questions generated directly from your notes.
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingMcqs}
                onClick={handleGenerateMCQs}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'mcqs' && mcqsData
                    ? 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isGeneratingMcqs ? (
                  <span>Generating...</span>
                ) : mcqsData ? (
                  <span>View Practice MCQs</span>
                ) : (
                  <span>Generate MCQs</span>
                )}
              </button>
            </div>

            {/* Card 3: AI Flashcards */}
            <div
              className={`p-6 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                activeTab === 'flashcards' && fileInfo
                  ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              } ${!fileInfo ? 'opacity-85' : ''}`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                  🧠
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
                  AI Flashcards
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Revise important concepts using quick flashcards.
                </p>
              </div>

              <button
                type="button"
                disabled={isGeneratingFlashcards}
                onClick={handleGenerateFlashcards}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'flashcards' && flashcardsData
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isGeneratingFlashcards ? (
                  <span>Generating...</span>
                ) : flashcardsData ? (
                  <span>View Flashcards</span>
                ) : (
                  <span>Generate Flashcards</span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Active Tool Workspace */}
        <section aria-label="Generated Study Content Workspace" className="pt-2">
          {/* Tool Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>📝</span>
              <span>Summary</span>
              {summaryData && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mcqs')}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'mcqs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>❓</span>
              <span>MCQs</span>
              {mcqsData && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>🧠</span>
              <span>Flashcards</span>
              {flashcardsData && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'summary' && (
            <Summary
              notes={fileInfo?.text}
              summaryData={summaryData}
              onGenerate={handleGenerateSummary}
              isLoading={isGeneratingSummary}
              error={summaryError}
            />
          )}

          {activeTab === 'mcqs' && (
            <MCQs
              notes={fileInfo?.text}
              mcqs={mcqsData}
              onGenerate={handleGenerateMCQs}
              isLoading={isGeneratingMcqs}
              error={mcqsError}
            />
          )}

          {activeTab === 'flashcards' && (
            <Flashcards
              notes={fileInfo?.text}
              flashcards={flashcardsData}
              onGenerate={handleGenerateFlashcards}
              isLoading={isGeneratingFlashcards}
              error={flashcardsError}
            />
          )}
        </section>

        {/* Section 4: Local Privacy & Open Innovation Features */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Why Local AI Matters
              </div>
              <h3 className="text-lg md:text-xl font-bold font-heading">
                100% Private, Offline &amp; Free Study Companion
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Your study materials never leave your device. All summarization, question generation, and flashcards run through <strong>Ollama</strong> using small open-weight AI models directly on your hardware.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span>Zero Cloud Uploads</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>No API Cost</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>No API Keys</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Works Offline</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-heading">Study Saathi</span>
            <span>—</span>
            <span>Built for a real friend preparing for exams</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Ollama + PyMuPDF
            </span>
            <span>•</span>
            <span>Hacktoberfest: Build for a Friend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
