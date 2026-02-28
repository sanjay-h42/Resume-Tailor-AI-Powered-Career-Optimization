import { useState, useEffect } from 'react';
import { Sparkles, FileText, Briefcase, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { submitOptimization, checkStatus } from './api';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, submitting, processing, completed, error
  const [result, setResult] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText || !jobDescription) return;

    setStatus('submitting');
    setErrorMessage('');
    try {
      const response = await submitOptimization({
        resume_text: resumeText,
        job_description: jobDescription
      });
      setTaskId(response.id);
      setStatus('processing');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to submit request');
    }
  };

  useEffect(() => {
    let interval;
    if (status === 'processing' && taskId) {
      interval = setInterval(async () => {
        try {
          const res = await checkStatus(taskId);
          if (res.status === 'completed') {
            setResult(res);
            setStatus('completed');
            clearInterval(interval);
          } else if (res.status === 'failed') {
            setStatus('error');
            setErrorMessage('Optimization failed on the server.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, taskId]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900 pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl mb-6 border border-brand-500/20">
            <Sparkles className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI Resume Optimizer
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            Tailor your resume precisely to any job description.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-500 font-medium bg-brand-500/10 inline-flex px-4 py-2 rounded-full border border-brand-500/20">
            <ShieldCheck className="w-4 h-4" />
            Privacy First: Data is stored securely in an internal, local database.
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-brand-500" />
                  Your Current Resume
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-48 bg-dark-900/50 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 resize-none"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-48 bg-dark-900/50 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting' || status === 'processing'}
                className="w-full relative group overflow-hidden bg-brand-600 flex items-center justify-center gap-2 hover:bg-brand-500 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)]"
              >
                {status === 'idle' || status === 'error' ? (
                  <>Optimize Resume <Sparkles className="w-5 h-5" /></>
                ) : status === 'completed' ? (
                  <>Optimize Another <Sparkles className="w-5 h-5" /></>
                ) : (
                  <>Processing... <Loader2 className="w-5 h-5 animate-spin" /></>
                )}
              </button>

              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>

          <div className="glass-panel p-8 flex flex-col h-full bg-gradient-to-b from-dark-800/80 to-dark-900/80">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-brand-500" />
              Optimization Result
            </h2>

            <div className="flex-1 rounded-xl bg-dark-900/80 border border-white/5 p-6 overflow-y-auto min-h-[400px]">
              {status === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <FileText className="w-12 h-12 opacity-20" />
                  <p>Your optimized resume will appear here</p>
                </div>
              )}

              {status === 'submitting' && (
                <div className="h-full flex flex-col items-center justify-center text-brand-500 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="animate-pulse">Connecting to backend...</p>
                </div>
              )}

              {status === 'processing' && (
                <div className="h-full flex flex-col items-center justify-center text-brand-500 space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 rounded-full"></div>
                    <Loader2 className="w-16 h-16 animate-spin relative z-10" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-medium text-lg animate-pulse">AI is tailoring your resume...</p>
                    <p className="text-sm text-gray-400">This might take a few seconds.</p>
                  </div>
                </div>
              )}

              {status === 'completed' && result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col space-y-8">
                  <div className="flex items-center justify-between gap-2 text-brand-500 pb-4 border-b border-brand-500/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Optimization Complete</span>
                    </div>
                  </div>

                  {/* Score Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Match</p>
                      <p className="text-3xl font-bold text-white">{result.relevance_score}%</p>
                    </div>
                    <div className="bg-brand-500/10 p-4 rounded-xl border border-brand-500/20 text-center">
                      <p className="text-xs text-brand-500 uppercase tracking-wider mb-1">Optimized Potential</p>
                      <p className="text-3xl font-bold text-brand-500">{result.optimized_score}%</p>
                    </div>
                  </div>

                  {/* Tailored Profile */}
                  {result.tailored_profile && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-sm font-semibold text-brand-500 mb-3 uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Recommended Profile Summary
                      </h3>
                      <p className="text-gray-300 text-sm italic leading-relaxed">
                        "{result.tailored_profile}"
                      </p>
                    </div>
                  )}

                  {/* Project Suggestions */}
                  {result.project_suggestions && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <h3 className="text-sm font-semibold text-brand-500 mb-3 uppercase tracking-tight flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Project Roadmap for Alignment
                      </h3>
                      <ul className="space-y-3">
                        {(typeof result.project_suggestions === 'string' ? JSON.parse(result.project_suggestions) : result.project_suggestions).map((suggestion, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-gray-400">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Full Optimized Resume */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-tight">Full Optimized Content</h3>
                    <div className="prose prose-invert prose-brand max-w-none text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-dark-900/50 p-6 rounded-xl border border-white/5">
                      {result.optimized_resume}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
