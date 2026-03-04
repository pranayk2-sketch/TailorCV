import { useState, useEffect } from 'react';
import { PageLayout } from '../components/PageLayout';
import { FileText, Download, Code2, Edit, Eye, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { listGeneratedResumes } from '@/api/generatedResumes';
import type { GeneratedResume } from '@/types/generatedResume';

const COMPANY_COLORS = [
  '#4285f4', '#635bff', '#0668e1', '#ff9900', '#00a4ef', '#555555',
  '#e50914', '#ff5a5f', '#1db954', '#00a1e0', '#0077b5', '#a855f7',
];

function colorForTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

export function ResumesPage() {
  const [resumes, setResumes] = useState<GeneratedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGeneratedResumes().then(({ data, error: err }) => {
      setResumes(data ?? []);
      setError(err ?? null);
      setLoading(false);
    });
  }, []);

  const readyCount = resumes.filter((r) => r.pdf_path).length;
  const draftCount = resumes.length - readyCount;

  if (loading) {
    return (
      <PageLayout title="Generated Resumes">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#ffd93d] animate-spin" strokeWidth={3} />
            <p className="text-white uppercase" style={{ fontWeight: 900 }}>Loading…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Generated Resumes">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-[#f9dc5c] rounded-3xl p-6 border-4 border-black shadow-xl">
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>{resumes.length}</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Total Resumes</div>
          </div>
          <div className="bg-[#95e1d3] rounded-3xl p-6 border-4 border-black shadow-xl">
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>{readyCount}</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Ready to Download</div>
          </div>
          <div className="bg-[#ffb347] rounded-3xl p-6 border-4 border-black shadow-xl">
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>{draftCount}</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Drafts</div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-400 rounded-2xl p-4 text-red-800" style={{ fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Resume List */}
        <div className="bg-[#1a1a1a] rounded-3xl p-4 border-4 border-black shadow-xl">
          <div className="max-h-[700px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {resumes.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" strokeWidth={2} />
                <p className="text-white text-xl uppercase mb-2" style={{ fontWeight: 900 }}>No resumes yet</p>
                <p className="text-white/60 text-sm" style={{ fontWeight: 600 }}>
                  Generate tailored resumes from the Internship Explorer
                </p>
              </div>
            ) : (
              resumes.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border-2 border-black shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center border-2 border-black flex-shrink-0"
                        style={{ backgroundColor: colorForTitle(resume.title) }}
                      >
                        <FileText className="w-8 h-8 text-white" strokeWidth={3} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl uppercase mb-1" style={{ fontWeight: 900 }}>{resume.title}</h3>
                            <p className="text-sm opacity-60" style={{ fontWeight: 600 }}>
                              Generated on {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs border-2 border-black ${
                              resume.pdf_path ? 'bg-[#95e1d3] text-black' : 'bg-gray-200 text-gray-600'
                            }`}
                            style={{ fontWeight: 900 }}
                          >
                            {resume.pdf_path ? 'Ready' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            disabled={!resume.pdf_path}
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors border-2 border-black text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontWeight: 700 }}
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button
                            className="bg-[#f9dc5c] text-black px-4 py-2 rounded-lg hover:bg-[#e9cc4c] transition-colors border-2 border-black text-sm flex items-center gap-2"
                            style={{ fontWeight: 700 }}
                          >
                            <Code2 className="w-4 h-4" />
                            View LaTeX
                          </button>
                          <button
                            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-black text-sm flex items-center gap-2"
                            style={{ fontWeight: 700 }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-black text-sm flex items-center gap-2"
                            style={{ fontWeight: 700 }}
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f5f1e8;
          border-radius: 4px;
          border: 2px solid #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e1d8; }
      `}</style>
    </PageLayout>
  );
}
