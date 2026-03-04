import { PageLayout } from '../components/PageLayout';
import { FileText, Download, Code2, Edit, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export function ResumesPage() {
  const resumes = [
    { id: 1, company: 'Google', role: 'SWE Resume', color: '#4285f4', date: 'March 1, 2026', status: 'Ready' },
    { id: 2, company: 'Stripe', role: 'Backend Resume', color: '#635bff', date: 'March 2, 2026', status: 'Ready' },
    { id: 3, company: 'Meta', role: 'ML Resume', color: '#0668e1', date: 'March 3, 2026', status: 'Draft' },
    { id: 4, company: 'Amazon', role: 'SDE Resume', color: '#ff9900', date: 'March 3, 2026', status: 'Ready' },
    { id: 5, company: 'Microsoft', role: 'Software Engineer Resume', color: '#00a4ef', date: 'March 4, 2026', status: 'Ready' },
    { id: 6, company: 'Apple', role: 'iOS Developer Resume', color: '#555555', date: 'March 4, 2026', status: 'Draft' },
  ];
  
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
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>6</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Total Resumes</div>
          </div>
          
          <div className="bg-[#95e1d3] rounded-3xl p-6 border-4 border-black shadow-xl">
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>4</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Ready to Download</div>
          </div>
          
          <div className="bg-[#ffb347] rounded-3xl p-6 border-4 border-black shadow-xl">
            <div className="text-4xl mb-2" style={{ fontWeight: 900 }}>2</div>
            <div className="text-sm uppercase opacity-75" style={{ fontWeight: 700 }}>Drafts</div>
          </div>
        </motion.div>
        
        {/* Scrollable Resume List */}
        <div className="bg-[#1a1a1a] rounded-3xl p-4 border-4 border-black shadow-xl">
          <div className="max-h-[700px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {resumes.map((resume, index) => (
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
                      style={{ backgroundColor: resume.color }}
                    >
                      <FileText className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-2xl uppercase mb-1" style={{ fontWeight: 900 }}>{resume.company}</h3>
                          <p className="text-base mb-2" style={{ fontWeight: 700 }}>{resume.role}</p>
                          <p className="text-sm opacity-60" style={{ fontWeight: 600 }}>Generated on {resume.date}</p>
                        </div>
                        
                        <span 
                          className={`px-3 py-1 rounded-lg text-xs border-2 border-black ${
                            resume.status === 'Ready' 
                              ? 'bg-[#95e1d3] text-black' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                          style={{ fontWeight: 900 }}
                        >
                          {resume.status}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors border-2 border-black text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        
                        <button className="bg-[#f9dc5c] text-black px-4 py-2 rounded-lg hover:bg-[#e9cc4c] transition-colors border-2 border-black text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                          <Code2 className="w-4 h-4" />
                          View LaTeX
                        </button>
                        
                        <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-black text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        
                        <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-black text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f5f1e8;
          border-radius: 4px;
          border: 2px solid #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e5e1d8;
        }
      `}</style>
    </PageLayout>
  );
}
