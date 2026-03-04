import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PageLayout } from '../components/PageLayout';
import { Upload, FileText, CheckCircle, Loader2, FileSearch } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadResumeFile, parseResume, listUploadedResumes } from '@/api/uploads';
import { importParsedResume } from '@/api/importResume';
import { ImportPreviewModal } from '@/features/experience/components/ImportPreviewModal';
import type { UploadedResume } from '@/types/upload';
import type { ParsedResume } from '@/types/parsedResume';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function UploadResumePage() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState<UploadedResume | null>(null);
  const [existingResumes, setExistingResumes] = useState<UploadedResume[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listUploadedResumes().then(({ data }) => {
      if (data?.length) setExistingResumes(data);
    });
  }, [uploaded]);

  const handleImportFromResume = async (resumeId?: string) => {
    const id = resumeId ?? uploaded?.id;
    if (!id) return;
    setParseError(null);
    setParseLoading(true);
    const { data, error: err } = await parseResume(id);
    setParseLoading(false);
    if (err) {
      setParseError(err);
      return;
    }
    if (data) {
      setParsedData(data);
      setPreviewOpen(true);
    }
  };

  const handleConfirmImport = async (parsed: ParsedResume) => {
    const { error: err } = await importParsedResume(parsed);
    if (err) {
      setParseError(err);
      return;
    }
    setPreviewOpen(false);
    setParsedData(null);
    navigate('/experience');
  };

  const processFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError('File too large (max 10MB)');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file type. Use PDF or DOCX.');
      return;
    }

    setLoading(true);
    const { data, error: err } = await uploadResumeFile(file);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    if (data) setUploaded(data);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleBrowse = () => inputRef.current?.click();

  return (
    <PageLayout title="Upload Resume">
      <div className="max-w-[900px] mx-auto p-4 md:p-8">
        {existingResumes.length > 0 && !uploaded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-[#95e1d3]/50 rounded-2xl p-4 border-2 border-black"
            >
            <p className="text-sm" style={{ fontWeight: 600 }}>
              You already have {existingResumes.length} resume{existingResumes.length > 1 ? 's' : ''} uploaded.
              {existingResumes[0] && (
                <span className="opacity-75"> Latest: {existingResumes[0].file_name}</span>
              )}
            </p>
            <p className="text-xs opacity-75 mt-1">You can upload another resume or import from an existing one.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {existingResumes.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleImportFromResume(r.id)}
                  disabled={parseLoading}
                  className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-[#333] disabled:opacity-60"
                >
                  Import from {r.file_name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {!uploaded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#f5f1e8] rounded-3xl p-12 border-4 border-black shadow-xl"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ffd93d] rounded-full border-4 border-black mb-6 shadow-lg">
                <Upload className="w-10 h-10" strokeWidth={3} />
              </div>
              <h2 className="text-4xl mb-4 uppercase" style={{ fontWeight: 900 }}>Upload Your Resume</h2>
              <p className="text-lg opacity-75 max-w-md mx-auto" style={{ fontWeight: 600 }}>
                Upload your existing resume and we'll extract your experience automatically
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-xl p-3 text-red-800 text-sm" style={{ fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-4 border-dashed rounded-2xl p-12 transition-all ${
                dragActive ? 'border-[#ff6b6b] bg-[#ff6b6b]/10' : 'border-black bg-white/60'
              }`}
            >
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" strokeWidth={2} />
                <p className="text-lg mb-2" style={{ fontWeight: 700 }}>
                  Drag & drop your resume here
                </p>
                <p className="text-sm opacity-60 mb-6" style={{ fontWeight: 600 }}>
                  Supports PDF and DOCX files
                </p>
                <div className="flex items-center gap-4 justify-center mb-4">
                  <div className="h-px bg-black/20 flex-1 max-w-[100px]" />
                  <span className="text-sm opacity-60" style={{ fontWeight: 700 }}>OR</span>
                  <div className="h-px bg-black/20 flex-1 max-w-[100px]" />
                </div>
                <button
                  onClick={handleBrowse}
                  disabled={loading}
                  className="bg-black text-white px-8 py-3 rounded-xl hover:bg-[#333] transition-colors border-2 border-black shadow-lg inline-flex items-center gap-2 disabled:opacity-60"
                  style={{ fontWeight: 800 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Browse Files
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs opacity-60" style={{ fontWeight: 700 }}>
                Maximum file size: 10MB • Supported formats: PDF, DOCX
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#95e1d3] rounded-3xl p-6 border-4 border-black shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#95e1d3]" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-2xl uppercase mb-1" style={{ fontWeight: 900 }}>Upload Successful!</h3>
                  <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
                    {uploaded.file_name} — {(uploaded.size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl"
            >
              <h3 className="text-2xl uppercase mb-4" style={{ fontWeight: 900 }}>Next Steps</h3>
              <p className="text-base mb-4" style={{ fontWeight: 600 }}>
                Extract your experience, skills, and coursework from the resume using our parser.
                Run the parse server first: <code className="bg-black/10 px-1 rounded">npm run parse-server</code>
              </p>

              {parseError && (
                <div className="mb-4 bg-red-100 border-2 border-red-400 rounded-xl p-3 text-red-800 text-sm" style={{ fontWeight: 600 }}>
                  {parseError}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleImportFromResume()}
                  disabled={parseLoading}
                  className="bg-black text-white px-6 py-3 rounded-xl hover:bg-[#333] transition-colors border-2 border-black inline-flex items-center gap-2 disabled:opacity-60"
                  style={{ fontWeight: 800 }}
                >
                  {parseLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Parsing…
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-5 h-5" strokeWidth={3} />
                      Import From Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setUploaded(null);
                    setParseError(null);
                  }}
                  className="bg-[#ffd93d] text-black px-6 py-3 rounded-xl hover:bg-[#ffc020] transition-colors border-2 border-black"
                  style={{ fontWeight: 800 }}
                >
                  Upload Another
                </button>
                <button
                  onClick={() => navigate('/experience')}
                  className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors border-2 border-black"
                  style={{ fontWeight: 800 }}
                >
                  Go to Experience
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <ImportPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          parsed={parsedData}
          onConfirm={handleConfirmImport}
        />
      </div>
    </PageLayout>
  );
}
