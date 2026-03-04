import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Search, MapPin, Building2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function InternshipsPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  
  const allInternships = [
    { id: 1, company: 'Google', role: 'Software Engineering Intern', location: 'Mountain View, CA', type: 'On-site' },
    { id: 2, company: 'Stripe', role: 'Backend Engineer Intern', location: 'San Francisco, CA', type: 'Hybrid' },
    { id: 3, company: 'Meta', role: 'Machine Learning Intern', location: 'Remote', type: 'Remote' },
    { id: 4, company: 'Amazon', role: 'SDE Intern', location: 'Seattle, WA', type: 'On-site' },
    { id: 5, company: 'Microsoft', role: 'Software Engineer Intern', location: 'Redmond, WA', type: 'Hybrid' },
    { id: 6, company: 'Apple', role: 'iOS Developer Intern', location: 'Cupertino, CA', type: 'On-site' },
    { id: 7, company: 'Netflix', role: 'Full Stack Intern', location: 'Los Gatos, CA', type: 'Hybrid' },
    { id: 8, company: 'Airbnb', role: 'Frontend Engineer Intern', location: 'San Francisco, CA', type: 'Remote' },
    { id: 9, company: 'Uber', role: 'Backend Intern', location: 'San Francisco, CA', type: 'On-site' },
    { id: 10, company: 'Spotify', role: 'Data Engineering Intern', location: 'New York, NY', type: 'Hybrid' },
    { id: 11, company: 'Salesforce', role: 'Cloud Engineer Intern', location: 'San Francisco, CA', type: 'Hybrid' },
    { id: 12, company: 'LinkedIn', role: 'Software Engineer Intern', location: 'Sunnyvale, CA', type: 'On-site' },
  ];
  
  const totalPages = Math.ceil(allInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedInternships = allInternships.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <PageLayout title="Internship Explorer">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5f1e8] rounded-3xl p-6 border-4 border-black shadow-xl mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" strokeWidth={3} />
            <input
              type="text"
              placeholder="Search companies, roles, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-black text-base bg-white"
              style={{ fontWeight: 600 }}
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm opacity-75" style={{ fontWeight: 700 }}>Filters:</span>
            {['All Roles', 'Remote', 'On-site', 'Hybrid', 'Software', 'Data', 'Design'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-lg text-sm border-2 border-black transition-colors ${
                  filter === 'All Roles' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                style={{ fontWeight: 700 }}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Internship List - Scrollable Container */}
        <div className="bg-[#1a1a1a] rounded-3xl p-4 border-4 border-black shadow-xl mb-6">
          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {displayedInternships.map((internship, index) => (
              <motion.div
                key={internship.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 border-2 border-black shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl border-2 border-black flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: ['#4285f4', '#635bff', '#0668e1', '#ff9900', '#00a4ef', '#555555', '#e50914', '#ff5a5f', '#000000', '#1db954', '#00a1e0', '#0077b5'][index % 12]
                      }}
                    >
                      <Building2 className="w-7 h-7 text-white" strokeWidth={3} />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl uppercase mb-1" style={{ fontWeight: 900 }}>{internship.company}</h3>
                      <p className="text-base mb-2" style={{ fontWeight: 700 }}>{internship.role}</p>
                      <div className="flex items-center gap-3 text-sm opacity-75">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span style={{ fontWeight: 600 }}>{internship.location}</span>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded border border-black text-xs" style={{ fontWeight: 700 }}>
                          {internship.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/internships/${internship.id}`)}
                      className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black text-sm" 
                      style={{ fontWeight: 800 }}
                    >
                      View Details
                    </button>
                    <button className="bg-[#ffd93d] text-black px-4 py-2 rounded-xl hover:bg-[#ffc020] transition-colors border-2 border-black text-sm flex items-center gap-1" style={{ fontWeight: 800 }}>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#f5f1e8] rounded-3xl p-6 border-4 border-black shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-xl border-2 border-black ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-400' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={3} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl border-2 border-black text-sm ${
                  currentPage === i + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                style={{ fontWeight: 900 }}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-xl border-2 border-black ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-400' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </motion.div>
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
