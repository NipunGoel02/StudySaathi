import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Sparkles, BookOpen, Eye, EyeOff } from 'lucide-react';

const SAMPLE_NOTES = `OPERATING SYSTEMS: PROCESSES, THREADS & MEMORY MANAGEMENT

1. Process Management:
A process is a program in execution. It contains the program code, current activity represented by the program counter, processor registers, and memory containing stack, data, and heap.
- Process States: New, Ready, Running, Waiting (Blocked), and Terminated.
- Process Control Block (PCB): Information associated with each process including Process ID (PID), Program Counter, CPU registers, CPU scheduling info, Memory management info, and I/O status info.
- Context Switching: The mechanism to store the state of an active process so that CPU execution can be resumed from the same point later, allowing multiple processes to share a single CPU. Context switch time is pure overhead.

2. Threads vs. Processes:
- A thread is a basic unit of CPU utilization, also known as a lightweight process.
- Threads of the same process share: Code section, Data section, and OS resources (open files, signals).
- Threads have their own: Thread ID, Program counter, Register set, and Stack.
- Advantage: Faster context switching, lower resource consumption, and improved responsiveness.

3. Process Synchronization:
- Critical Section Problem: A section of code that accesses shared resources. Only one process should be executing in its critical section at any given time.
- Three Requirements: Mutual Exclusion, Progress, and Bounded Waiting.
- Semaphore: A synchronization tool provided by the OS. Two atomic operations: wait() [decrements] and signal() [increments].
  * Counting Semaphore: Value can range over an unrestricted domain.
  * Binary Semaphore (Mutex): Value ranges between 0 and 1.
- Deadlock: A situation where every process in a set is waiting for an event that only another process in the set can cause.
- 4 Necessary Conditions for Deadlock (Coffman Conditions): Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.

4. Memory Management & Virtual Memory:
- Paging: Memory management scheme that eliminates the need for contiguous physical memory allocation. Logical memory is divided into fixed-size blocks called 'Pages', and physical memory into 'Frames'.
- Page Table: Maps logical page numbers to physical frame numbers.
- Translation Lookaside Buffer (TLB): A high-speed hardware cache used to reduce memory access time during address translation.
- Virtual Memory: Technique that allows the execution of processes that may not be completely in physical memory. Separates user logical memory from physical memory.
- Page Fault: An interrupt that occurs when a program attempts to access a memory block that is not currently mapped into physical RAM.
- Page Replacement Algorithms: FIFO (First In First Out), Optimal (OPT - lowest fault rate, replaces page that will not be used for longest period), and LRU (Least Recently Used).`;

export default function FileUpload({ fileInfo, onUploadSuccess, onError, isUploading, setIsUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.txt')) {
      onError("Please upload a PDF or TXT file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Failed to process the uploaded file.");
      }

      onUploadSuccess({
        filename: data.filename,
        fileType: data.file_type,
        charCount: data.char_count,
        pageCount: data.page_count,
        text: data.text,
      });
    } catch (err) {
      onError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSample = () => {
    onUploadSuccess({
      filename: "Operating_Systems_Core_Concepts.txt",
      fileType: "TXT",
      charCount: SAMPLE_NOTES.length,
      pageCount: 1,
      text: SAMPLE_NOTES,
    });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 transition-all hover:shadow-md">
      {!fileInfo ? (
        <div>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleChange}
              className="hidden"
              id="notes-file-input"
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50 transition-transform group-hover:scale-110">
              {isUploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-2 font-heading">
              Upload Your Study Notes
            </h2>
            <p className="text-sm md:text-base text-slate-500 text-center max-w-lg mb-6 leading-relaxed">
              Upload your PDF or TXT notes and let Study Saathi turn them into easy-to-revise study material.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Reading notes...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Choose File
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSample();
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer"
                title="Try instant sample notes"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Try Sample Notes
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                PDF
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                TXT
              </span>
              <span>•</span>
              <span>Local processing via PyMuPDF</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    ✓ Notes uploaded successfully
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-white/80 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {fileInfo.fileType}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-md">
                  {fileInfo.filename}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-3">
                  <span>
                    {fileInfo.pageCount > 1
                      ? `${fileInfo.pageCount} pages`
                      : '1 page'}
                  </span>
                  <span>•</span>
                  <span>{fileInfo.charCount.toLocaleString()} characters extracted</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? "Hide Text" : "View Text"}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Notes
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>

          {showPreview && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>Extracted Text Preview ({fileInfo.charCount} chars)</span>
                <span>PyMuPDF</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300">
                {fileInfo.text.slice(0, 2000)}
                {fileInfo.text.length > 2000 && "\n\n... [truncated in preview, full text used for AI] ..."}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
