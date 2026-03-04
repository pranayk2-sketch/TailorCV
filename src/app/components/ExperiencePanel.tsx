import { motion } from 'motion/react';
import { GraduationCap, Upload, Github } from 'lucide-react';
import { useNavigate } from 'react-router';

export function ExperiencePanel() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      className="bg-[#f9dc5c] rounded-3xl p-8 md:p-10 h-full shadow-xl relative overflow-hidden border-4 border-black"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Retro Computer Illustration */}
      <div className="absolute bottom-6 right-6 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1571845615528-6d8d60c459ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY29tcHV0ZXIlMjByZXRyb3xlbnwxfHx8fDE3NzI2MDA4NDR8MA&ixlib=rb-4.1.0&q=80&w=400"
          alt="Retro computer"
          className="w-64 h-64 object-cover rounded-2xl mix-blend-multiply"
        />
      </div>
      
      {/* Decorative icon */}
      <div className="absolute top-6 right-6 bg-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-black">
        <GraduationCap className="w-8 h-8 text-[#f9dc5c]" strokeWidth={3} />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-6xl md:text-7xl mb-4 uppercase tracking-tight" style={{ fontWeight: 900, lineHeight: 1 }}>
            Your<br/>Experience
          </h2>
        </div>
        
        <div className="mb-auto">
          <p className="text-lg mb-6 max-w-md" style={{ fontWeight: 700 }}>
            Manage all your career data in one place.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4 mt-auto">
          <button 
            onClick={() => navigate('/experience')}
            className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-[#333] transition-colors border-2 border-black shadow-lg text-lg flex items-center justify-center gap-3" 
            style={{ fontWeight: 800 }}
          >
            Open Experience Editor
          </button>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/upload')}
              className="bg-white text-black py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors border-2 border-black shadow-lg flex items-center justify-center gap-2" 
              style={{ fontWeight: 800 }}
            >
              <Upload className="w-5 h-5" />
              Upload Resume
            </button>
            <button className="bg-[#4ecdc4] text-black py-3 px-4 rounded-xl hover:bg-[#3dbbb3] transition-colors border-2 border-black shadow-lg flex items-center justify-center gap-2" style={{ fontWeight: 800 }}>
              <Github className="w-5 h-5" />
              Import GitHub
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}