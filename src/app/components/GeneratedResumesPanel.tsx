import { motion } from 'motion/react';
import { FileText, Download, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function GeneratedResumesPanel() {
  const navigate = useNavigate();
  
  const resumes = [
    { company: 'Google', role: 'SWE Resume', color: '#4285f4' },
    { company: 'Stripe', role: 'Backend Resume', color: '#635bff' },
  ];
  
  return (
    <motion.div
      onClick={() => navigate('/resumes')}
      className="bg-[#95e1d3] rounded-3xl p-8 md:p-10 h-full shadow-xl relative overflow-hidden border-4 border-black cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative element */}
      <div className="absolute top-6 right-6 bg-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-black">
        <FileText className="w-8 h-8 text-[#95e1d3]" strokeWidth={3} />
      </div>
      
      {/* Retro computer graphic */}
      <div className="absolute bottom-6 right-6 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1711346105258-bbb9136592d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMGRlc2t0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NzI2MDA4NDV8MA&ixlib=rb-4.1.0&q=80&w=400"
          alt="Retro desktop"
          className="w-64 h-64 object-cover rounded-2xl mix-blend-multiply"
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-6xl md:text-7xl mb-4 uppercase tracking-tight" style={{ fontWeight: 900, lineHeight: 1 }}>
            Generated<br/>Resumes
          </h2>
        </div>
        
        <p className="text-lg mb-8 max-w-md" style={{ fontWeight: 700 }}>
          Access all your AI-generated role-specific resumes.
        </p>
        
        {/* Preview Resume Cards */}
        <div className="space-y-4 mb-auto">
          {resumes.map((resume, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-5 border-2 border-black shadow-md"
              whileHover={{ x: 5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl mb-1 uppercase" style={{ fontWeight: 900 }}>{resume.company}</div>
                  <div className="text-sm opacity-75" style={{ fontWeight: 600 }}>{resume.role}</div>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center border-2 border-black"
                  style={{ backgroundColor: resume.color }}
                >
                  <FileText className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-[#333] transition-colors text-sm flex items-center justify-center gap-2 border-2 border-black" style={{ fontWeight: 700 }}>
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm border-2 border-black flex items-center gap-1" style={{ fontWeight: 700 }}>
                  <Code2 className="w-4 h-4" />
                  LaTeX
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}