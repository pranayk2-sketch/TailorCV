import { PageLayout } from '../components/PageLayout';
import { Sparkles, Search, FileText, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function AssistantPage() {
  const navigate = useNavigate();
  
  const steps = [
    { number: 1, title: 'Choose Internships', description: 'Browse and select internships you want to apply to', icon: Search, color: '#ff7b54' },
    { number: 2, title: 'Analyze Job Description', description: 'AI analyzes requirements and matches your skills', icon: Sparkles, color: '#6a4c93' },
    { number: 3, title: 'Generate Tailored Resume', description: 'Create optimized resumes for each position', icon: FileText, color: '#95e1d3' },
  ];
  
  return (
    <PageLayout>
      <div className="max-w-[1000px] mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ffd93d] rounded-full border-4 border-black mb-6 shadow-xl">
            <Sparkles className="w-10 h-10" strokeWidth={3} />
          </div>
          
          <h1 className="text-5xl md:text-6xl mb-4 uppercase text-white" style={{ fontWeight: 900 }}>
            Resume Assistant
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto" style={{ fontWeight: 600 }}>
            Let AI guide you through creating perfect resumes for every internship opportunity
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-6 md:p-8 border-4 border-black shadow-xl"
            >
              <div className="flex items-start gap-6">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-black shadow-lg flex-shrink-0"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm bg-black text-white px-3 py-1 rounded-lg border-2 border-black" style={{ fontWeight: 900 }}>
                      STEP {step.number}
                    </span>
                    <h3 className="text-2xl uppercase" style={{ fontWeight: 900 }}>{step.title}</h3>
                  </div>
                  <p className="text-base opacity-75" style={{ fontWeight: 600 }}>{step.description}</p>
                </div>
                
                <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-gray-400" strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl mb-8"
        >
          <h3 className="text-2xl uppercase mb-4" style={{ fontWeight: 900 }}>Your Progress</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ fontWeight: 700 }}>Experience Profile</span>
              <span className="text-sm bg-[#95e1d3] px-3 py-1 rounded-lg border-2 border-black" style={{ fontWeight: 900 }}>Complete</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ fontWeight: 700 }}>Internships Selected</span>
              <span className="text-sm bg-gray-200 px-3 py-1 rounded-lg border-2 border-black" style={{ fontWeight: 900 }}>0 / 3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ fontWeight: 700 }}>Resumes Generated</span>
              <span className="text-sm bg-gray-200 px-3 py-1 rounded-lg border-2 border-black" style={{ fontWeight: 900 }}>0</span>
            </div>
          </div>
          
          <div className="bg-gray-200 h-3 rounded-full border-2 border-black overflow-hidden">
            <div className="bg-[#ffd93d] h-full w-1/3 border-r-2 border-black"></div>
          </div>
          <p className="text-xs mt-2 opacity-75" style={{ fontWeight: 700 }}>33% Complete</p>
        </motion.div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button 
            onClick={() => navigate('/internships')}
            className="bg-[#ff6b6b] text-white px-12 py-5 rounded-2xl hover:bg-[#ff5252] transition-colors border-4 border-black shadow-xl text-xl inline-flex items-center gap-3" 
            style={{ fontWeight: 900 }}
          >
            <Search className="w-6 h-6" strokeWidth={3} />
            Browse Internships
          </button>
          
          <p className="text-white/60 mt-4 text-sm" style={{ fontWeight: 600 }}>
            Start by finding internships that match your interests
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
