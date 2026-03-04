import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Upload, FileText, CheckCircle, Edit } from 'lucide-react';
import { motion } from 'motion/react';

export function UploadResumePage() {
  const [uploaded, setUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploaded(true);
  };
  
  const handleUpload = () => {
    setUploaded(true);
  };
  
  return (
    <PageLayout title="Upload Resume">
      <div className="max-w-[900px] mx-auto p-4 md:p-8">
        {!uploaded ? (
          /* Upload Area */
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
            
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-4 border-dashed rounded-2xl p-12 transition-all ${
                dragActive 
                  ? 'border-[#ff6b6b] bg-[#ff6b6b]/10' 
                  : 'border-black bg-white/60'
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
                  <div className="h-px bg-black/20 flex-1 max-w-[100px]"></div>
                  <span className="text-sm opacity-60" style={{ fontWeight: 700 }}>OR</span>
                  <div className="h-px bg-black/20 flex-1 max-w-[100px]"></div>
                </div>
                
                <button 
                  onClick={handleUpload}
                  className="bg-black text-white px-8 py-3 rounded-xl hover:bg-[#333] transition-colors border-2 border-black shadow-lg inline-flex items-center gap-2" 
                  style={{ fontWeight: 800 }}
                >
                  <Upload className="w-5 h-5" />
                  Browse Files
                </button>
              </div>
            </div>
            
            {/* Supported Formats */}
            <div className="mt-6 text-center">
              <p className="text-xs opacity-60" style={{ fontWeight: 700 }}>
                Maximum file size: 10MB • Supported formats: PDF, DOCX
              </p>
            </div>
          </motion.div>
        ) : (
          /* Preview Area */
          <div className="space-y-6">
            {/* Success Message */}
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
                  <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>Your resume has been parsed and analyzed</p>
                </div>
              </div>
            </motion.div>
            
            {/* Parsed Experience Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl"
            >
              <h3 className="text-3xl uppercase mb-6" style={{ fontWeight: 900 }}>Parsed Experience Preview</h3>
              
              <div className="space-y-6">
                {/* Education */}
                <div className="bg-white/80 rounded-2xl p-6 border-2 border-black">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl uppercase" style={{ fontWeight: 900 }}>Education</h4>
                    <button className="text-black hover:text-gray-700">
                      <Edit className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg" style={{ fontWeight: 900 }}>University of California, Berkeley</p>
                      <p className="text-base" style={{ fontWeight: 700 }}>B.S. in Computer Science</p>
                      <p className="text-sm opacity-60" style={{ fontWeight: 600 }}>2022 - 2026</p>
                    </div>
                  </div>
                </div>
                
                {/* Work Experience */}
                <div className="bg-white/80 rounded-2xl p-6 border-2 border-black">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl uppercase" style={{ fontWeight: 900 }}>Work Experience</h4>
                    <button className="text-black hover:text-gray-700">
                      <Edit className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg mb-1" style={{ fontWeight: 900 }}>Tech Corp</p>
                      <p className="text-base mb-1" style={{ fontWeight: 700 }}>Software Engineering Intern</p>
                      <p className="text-sm opacity-60 mb-2" style={{ fontWeight: 600 }}>Jun 2023 - Aug 2023</p>
                      <ul className="space-y-1 text-sm" style={{ fontWeight: 600 }}>
                        <li>• Built REST APIs serving 10k+ requests/day</li>
                        <li>• Implemented CI/CD pipeline</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="bg-white/80 rounded-2xl p-6 border-2 border-black">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-xl uppercase" style={{ fontWeight: 900 }}>Skills</h4>
                    <button className="text-black hover:text-gray-700">
                      <Edit className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS'].map((skill) => (
                      <span key={skill} className="bg-black text-white px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <button className="flex-1 bg-black text-white py-4 px-6 rounded-2xl hover:bg-[#333] transition-colors border-4 border-black shadow-xl text-lg" style={{ fontWeight: 900 }}>
                Confirm Import
              </button>
              <button className="flex-1 bg-[#ffd93d] text-black py-4 px-6 rounded-2xl hover:bg-[#ffc020] transition-colors border-4 border-black shadow-xl text-lg" style={{ fontWeight: 900 }}>
                Edit Data
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
