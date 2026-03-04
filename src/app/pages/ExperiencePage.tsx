import { PageLayout } from '../components/PageLayout';
import { Edit, Plus, User, Briefcase, Code, Trophy, BookOpen, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

export function ExperiencePage() {
  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#f5f1e8] rounded-3xl p-8 border-4 border-black shadow-xl"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-[#ffb347] rounded-2xl border-4 border-black flex items-center justify-center shadow-lg">
              <User className="w-12 h-12" strokeWidth={3} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-4xl mb-2 uppercase" style={{ fontWeight: 900 }}>John Doe</h2>
                  <p className="text-lg opacity-75" style={{ fontWeight: 600 }}>Software Engineer & Full-Stack Developer</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2" style={{ fontWeight: 800 }}>
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              
              <p className="text-base" style={{ fontWeight: 500 }}>
                Passionate about building innovative web applications and solving complex problems. 
                Experienced in full-stack development with a focus on modern JavaScript frameworks and cloud technologies.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Projects */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#f9dc5c] rounded-3xl p-8 border-4 border-black shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-[#f9dc5c]" strokeWidth={3} />
              </div>
              <h3 className="text-3xl uppercase" style={{ fontWeight: 900 }}>Projects</h3>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2" style={{ fontWeight: 800 }}>
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'ResumeForge', description: 'AI-powered resume builder with LaTeX generation', tech: ['React', 'TypeScript', 'OpenAI'] },
              { name: 'TaskMaster Pro', description: 'Team collaboration tool with real-time updates', tech: ['Next.js', 'Supabase', 'Tailwind'] },
              { name: 'CodeSnippet Manager', description: 'Developer tool for organizing code snippets', tech: ['Vue.js', 'Firebase', 'Monaco'] },
            ].map((project, index) => (
              <div key={index} className="bg-white/80 rounded-2xl p-5 border-2 border-black">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-xl uppercase" style={{ fontWeight: 900 }}>{project.name}</h4>
                  <button className="text-black hover:text-gray-700">
                    <Edit className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
                <p className="text-sm mb-3" style={{ fontWeight: 600 }}>{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="bg-black text-white px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Work Experience */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#ff7b54] rounded-3xl p-8 border-4 border-black shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#ff7b54]" strokeWidth={3} />
              </div>
              <h3 className="text-3xl uppercase" style={{ fontWeight: 900 }}>Work Experience</h3>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2" style={{ fontWeight: 800 }}>
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { company: 'Tech Corp', role: 'Software Engineering Intern', dates: 'Jun 2023 - Aug 2023', points: ['Built REST APIs serving 10k+ requests/day', 'Implemented CI/CD pipeline reducing deployment time by 50%'] },
              { company: 'StartupXYZ', role: 'Frontend Developer Intern', dates: 'Jan 2023 - May 2023', points: ['Developed responsive UI components using React', 'Improved page load time by 40% through optimization'] },
            ].map((exp, index) => (
              <div key={index} className="bg-white/90 rounded-2xl p-5 border-2 border-black">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl uppercase mb-1" style={{ fontWeight: 900 }}>{exp.company}</h4>
                    <p className="text-base mb-1" style={{ fontWeight: 700 }}>{exp.role}</p>
                    <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>{exp.dates}</p>
                  </div>
                  <button className="text-black hover:text-gray-700">
                    <Edit className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
                <ul className="space-y-2 mt-3">
                  {exp.points.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ fontWeight: 600 }}>
                      <span className="text-black">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Leadership & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Leadership */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#95e1d3] rounded-3xl p-8 border-4 border-black shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[#95e1d3]" strokeWidth={3} />
                </div>
                <h3 className="text-2xl uppercase" style={{ fontWeight: 900 }}>Leadership</h3>
              </div>
              <button className="bg-black text-white px-3 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black" style={{ fontWeight: 800 }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/80 rounded-xl p-4 border-2 border-black">
                <h4 className="text-base uppercase mb-1" style={{ fontWeight: 900 }}>CS Club President</h4>
                <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>2022 - 2023</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border-2 border-black">
                <h4 className="text-base uppercase mb-1" style={{ fontWeight: 900 }}>Hackathon Organizer</h4>
                <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>2023</p>
              </div>
            </div>
          </motion.div>
          
          {/* Skills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#c59ade] rounded-3xl p-8 border-4 border-black shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-[#c59ade]" strokeWidth={3} />
                </div>
                <h3 className="text-2xl uppercase" style={{ fontWeight: 900 }}>Skills</h3>
              </div>
              <button className="bg-black text-white px-3 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black" style={{ fontWeight: 800 }}>
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'].map((skill) => (
                    <span key={skill} className="bg-white text-black px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>Frameworks</h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Next.js', 'Node.js', 'Express', 'Tailwind'].map((skill) => (
                    <span key={skill} className="bg-white text-black px-3 py-1 rounded-lg text-xs border-2 border-black" style={{ fontWeight: 700 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Coursework */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#ffd93d] rounded-3xl p-8 border-4 border-black shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#ffd93d]" strokeWidth={3} />
              </div>
              <h3 className="text-3xl uppercase" style={{ fontWeight: 900 }}>Relevant Coursework</h3>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2" style={{ fontWeight: 800 }}>
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['Data Structures & Algorithms', 'Database Systems', 'Web Development', 'Machine Learning', 'Computer Networks', 'Operating Systems'].map((course) => (
              <span key={course} className="bg-white text-black px-4 py-2 rounded-xl text-sm border-2 border-black" style={{ fontWeight: 700 }}>
                {course}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
