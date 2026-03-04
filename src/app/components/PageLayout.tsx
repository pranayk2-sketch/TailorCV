import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] overflow-x-hidden">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}
      />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#f5f1e8] text-black px-4 py-2 rounded-xl hover:bg-[#e5e1d8] transition-colors border-2 border-black shadow-lg"
            style={{ fontWeight: 800 }}
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
            Home
          </button>
          
          {title && (
            <h1 className="text-2xl md:text-4xl uppercase text-white" style={{ fontWeight: 900 }}>
              {title}
            </h1>
          )}
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
