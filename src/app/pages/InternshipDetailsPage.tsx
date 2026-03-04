import { PageLayout } from '../components/PageLayout';
import { Building2, MapPin, Calendar, Sparkles, TrendingUp, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useParams } from 'react-router';

export function InternshipDetailsPage() {
  const { id } = useParams();
  
  const matchingSkills = ['Python', 'React', 'TypeScript', 'APIs', 'Git', 'SQL'];
  const missingSkills = ['Kubernetes', 'Docker', 'GraphQL'];
  
  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-[#4285f4] rounded-2xl border-4 border-black flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl mb-2 uppercase" style={{ fontWeight: 900 }}>Google</h1>
              <h2 className="text-2xl mb-3" style={{ fontWeight: 700 }}>Software Engineering Intern</h2>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={3} />
                  <span style={{ fontWeight: 600 }}>Mountain View, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={3} />
                  <span style={{ fontWeight: 600 }}>Summer 2026</span>
                </div>
                <span className="bg-black text-white px-3 py-1 rounded-lg border-2 border-black" style={{ fontWeight: 700 }}>
                  On-site
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#f9dc5c] rounded-3xl p-8 border-4 border-black shadow-xl"
            >
              <h3 className="text-3xl uppercase mb-4" style={{ fontWeight: 900 }}>Job Description</h3>
              
              <div className="space-y-4 text-base" style={{ fontWeight: 600 }}>
                <p>
                  As a Software Engineering Intern at Google, you will work on cutting-edge technologies that impact billions of users worldwide. 
                  You'll collaborate with experienced engineers to design, develop, and deploy scalable solutions.
                </p>
                
                <div>
                  <h4 className="text-lg mb-2 uppercase" style={{ fontWeight: 900 }}>Responsibilities:</h4>
                  <ul className="space-y-2 ml-5">
                    <li>• Design and implement new features for Google products</li>
                    <li>• Write clean, efficient, and well-tested code</li>
                    <li>• Collaborate with cross-functional teams</li>
                    <li>• Participate in code reviews and design discussions</li>
                    <li>• Learn from world-class engineers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg mb-2 uppercase" style={{ fontWeight: 900 }}>Qualifications:</h4>
                  <ul className="space-y-2 ml-5">
                    <li>• Currently pursuing a Bachelor's or Master's degree in Computer Science or related field</li>
                    <li>• Strong foundation in data structures and algorithms</li>
                    <li>• Experience with Python, Java, or C++</li>
                    <li>• Knowledge of web technologies (HTML, CSS, JavaScript)</li>
                    <li>• Excellent problem-solving and communication skills</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg mb-2 uppercase" style={{ fontWeight: 900 }}>Preferred Qualifications:</h4>
                  <ul className="space-y-2 ml-5">
                    <li>• Experience with cloud technologies (Kubernetes, Docker)</li>
                    <li>• Contributions to open-source projects</li>
                    <li>• Previous internship experience</li>
                    <li>• Knowledge of distributed systems</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Skill Match */}
          <div className="space-y-8">
            {/* Skill Match Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#ff6b6b] via-[#ff8c42] to-[#ffd93d] rounded-3xl p-8 border-4 border-black shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#ffd93d]" strokeWidth={3} />
                </div>
                <h3 className="text-2xl uppercase" style={{ fontWeight: 900 }}>Skill Match</h3>
              </div>
              
              <div className="bg-black/90 rounded-2xl p-6 mb-6 border-2 border-black">
                <div className="flex items-end gap-2 mb-2">
                  <div className="text-6xl text-white" style={{ fontWeight: 900 }}>84</div>
                  <div className="text-3xl text-white mb-2" style={{ fontWeight: 900 }}>%</div>
                </div>
                <div className="text-white text-sm flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <TrendingUp className="w-4 h-4" />
                  Match Score
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm mb-3 uppercase" style={{ fontWeight: 900 }}>Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchingSkills.map((skill) => (
                      <span key={skill} className="bg-white text-black px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm mb-3 uppercase" style={{ fontWeight: 900 }}>Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((skill) => (
                      <span key={skill} className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <button className="w-full bg-[#6a4c93] text-white py-4 px-6 rounded-2xl hover:bg-[#5a3c83] transition-colors border-4 border-black shadow-xl flex items-center justify-center gap-3 text-lg" style={{ fontWeight: 900 }}>
                <Sparkles className="w-6 h-6" strokeWidth={3} />
                Generate Resume
              </button>
              
              <button className="w-full bg-[#95e1d3] text-black py-4 px-6 rounded-2xl hover:bg-[#85d1c3] transition-colors border-4 border-black shadow-xl text-lg" style={{ fontWeight: 900 }}>
                Improve Resume
              </button>
            </motion.div>
            
            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#ffb347] rounded-3xl p-6 border-4 border-black shadow-xl"
            >
              <h4 className="text-lg uppercase mb-3" style={{ fontWeight: 900 }}>💡 Tips</h4>
              <ul className="space-y-2 text-sm" style={{ fontWeight: 600 }}>
                <li>• Highlight your Python and React experience</li>
                <li>• Add Kubernetes/Docker skills to improve match</li>
                <li>• Emphasize team projects and collaboration</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
