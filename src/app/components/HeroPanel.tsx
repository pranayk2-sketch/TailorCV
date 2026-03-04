import { motion } from 'motion/react';
import { Smile } from 'lucide-react';
import { useNavigate } from 'react-router';

export function HeroPanel() {
  const navigate = useNavigate();

  const handleStartBuilding = () => navigate('/assistant');
  const handleImportResume = () => navigate('/upload');
  
  return (
    <motion.div
      className="bg-[#f5f1e8] rounded-3xl p-8 md:p-10 h-full shadow-xl relative overflow-hidden border-4 border-black"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative smiley */}
      <div className="absolute top-6 right-6 bg-[#ffb347] rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-black">
        <Smile className="w-8 h-8" strokeWidth={3} />
      </div>
      
      {/* Retro sticker */}
      <div className="absolute top-32 right-8 rotate-12">
        <div className="bg-[#ff69b4] rounded-lg px-4 py-2 border-2 border-black shadow-md">
          <span className="text-sm uppercase tracking-wider" style={{ fontWeight: 800 }}>AI Powered</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl mb-3 uppercase tracking-tight" style={{ fontWeight: 900, lineHeight: 1 }}>
            RESUME<span className="text-[#ff6b6b]">FORGE</span>
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
        
        <div className="mb-8 max-w-md">
          <p className="text-lg mb-3" style={{ fontWeight: 700 }}>
            AI-powered resumes tailored for every internship.
          </p>
          <p className="text-base opacity-75" style={{ fontWeight: 500 }}>
            Upload your experience once and generate role-specific resumes automatically.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-auto space-y-4">
          <button 
            onClick={handleStartBuilding}
            className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-[#333] transition-colors border-2 border-black shadow-lg text-lg" 
            style={{ fontWeight: 800 }}
          >
            Start Building Resume
          </button>
          <button 
            onClick={handleImportResume}
            className="w-full bg-[#ff6b6b] text-white py-4 px-6 rounded-xl hover:bg-[#ff5252] transition-colors border-2 border-black shadow-lg text-lg" 
            style={{ fontWeight: 800 }}
          >
            Import Resume
          </button>
        </div>
      </div>
    </motion.div>
  );
}