import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import { HeroPanel } from '../components/HeroPanel';
import { ExperiencePanel } from '../components/ExperiencePanel';
import { InternshipPanel } from '../components/InternshipPanel';
import { GeneratedResumesPanel } from '../components/GeneratedResumesPanel';
import { useAuth } from '@/features/auth/AuthProvider';

export function HomePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 md:p-8 overflow-x-hidden">
      {/* Header with logout */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-[#ff6b6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff5252] transition-colors border-2 border-black shadow-lg"
          style={{ fontWeight: 800 }}
        >
          <LogOut className="w-4 h-4" strokeWidth={3} />
          Logout
        </button>
      </div>

      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}
      />
      
      {/* Simplified 4-Panel Grid Layout */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Row 1: Hero | Your Experience */}
        <div className="h-[500px] lg:h-[600px]">
          <HeroPanel />
        </div>
        
        <div className="h-[500px] lg:h-[600px]">
          <ExperiencePanel />
        </div>
        
        {/* Row 2: Internship Explorer | Generated Resumes */}
        <div className="h-[500px] lg:h-[600px]">
          <InternshipPanel />
        </div>
        
        <div className="h-[500px] lg:h-[600px]">
          <GeneratedResumesPanel />
        </div>
      </div>
    </div>
  );
}
