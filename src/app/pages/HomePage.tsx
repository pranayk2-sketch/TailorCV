import { HeroPanel } from '../components/HeroPanel';
import { ExperiencePanel } from '../components/ExperiencePanel';
import { InternshipPanel } from '../components/InternshipPanel';
import { GeneratedResumesPanel } from '../components/GeneratedResumesPanel';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 md:p-8 overflow-x-hidden">
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
