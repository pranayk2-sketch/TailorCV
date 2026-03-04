import { motion } from 'motion/react';
import { Building2, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router';

export function InternshipPanel() {
  const navigate = useNavigate();
  
  const internships = [
    { company: 'Google', role: 'SWE Intern', location: 'Mountain View' },
    { company: 'Stripe', role: 'Backend Intern', location: 'San Francisco' },
    { company: 'Meta', role: 'ML Intern', location: 'Remote' },
  ];
  
  return (
    <motion.div
      onClick={() => navigate('/internships')}
      className="bg-[#ff7b54] rounded-3xl p-8 md:p-10 h-full shadow-xl relative overflow-hidden border-4 border-black cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative icon */}
      <div className="absolute top-6 right-6 bg-[#ffd93d] rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-black">
        <Search className="w-8 h-8 text-black" strokeWidth={3} />
      </div>
      
      {/* Retro Computer */}
      <div className="absolute bottom-6 right-6 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1661793422829-e1f648ab4a15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBjb21wdXRlciUyMG1vbml0b3J8ZW58MXx8fHwxNzcyNjAwODQ0fDA&ixlib=rb-4.1.0&q=80&w=400"
          alt="Old computer monitor"
          className="w-64 h-64 object-cover rounded-2xl mix-blend-multiply"
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-6xl md:text-7xl mb-4 uppercase tracking-tight" style={{ fontWeight: 900, lineHeight: 1 }}>
            Internship<br/>Explorer
          </h2>
        </div>
        
        <p className="text-lg mb-8 max-w-md" style={{ fontWeight: 700 }}>
          Browse internships automatically pulled from Simplify's GitHub internship list.
        </p>
        
        {/* Preview Internship Cards */}
        <div className="space-y-3 mb-auto">
          {internships.map((internship, index) => (
            <motion.div
              key={index}
              className="bg-white/90 rounded-xl p-4 border-2 border-black shadow-md"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl mb-1 uppercase" style={{ fontWeight: 900 }}>{internship.company}</div>
                  <div className="text-sm mb-2" style={{ fontWeight: 600 }}>{internship.role}</div>
                  <div className="flex items-center gap-1 text-xs opacity-75">
                    <MapPin className="w-3 h-3" />
                    {internship.location}
                  </div>
                </div>
                <Building2 className="w-6 h-6" strokeWidth={3} />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Action Button */}
        <div className="mt-auto">
          <button 
            onClick={() => navigate('/internships')}
            className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-[#333] transition-colors border-2 border-black shadow-lg text-lg" 
            style={{ fontWeight: 800 }}
          >
            Browse Internships
          </button>
        </div>
      </div>
    </motion.div>
  );
}