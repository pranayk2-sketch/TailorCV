import { useState, useEffect } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Edit, Plus, User, Briefcase, Code, Trophy, BookOpen, Wrench, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { getProfile, updateProfile } from '@/api/profile';
import {
  listExperiences,
  listBullets,
  upsertExperience,
  deleteExperience,
  upsertBulletsForExperience,
  reorderExperiences,
} from '@/api/experiences';
import { listSkills, upsertSkill, deleteSkill } from '@/api/skills';
import { listCoursework, upsertCoursework, deleteCoursework } from '@/api/coursework';
import { getLatestUploadedResume } from '@/api/uploads';
import { ExperienceModal, type ExperienceFormData } from '@/features/experience/components/ExperienceModal';
import { SkillModal } from '@/features/experience/components/SkillModal';
import { CourseworkModal } from '@/features/experience/components/CourseworkModal';
import { ProfileModal } from '@/features/experience/components/ProfileModal';
import type { Profile } from '@/types/profile';
import type { Experience, ExperienceBullet, ExperienceType } from '@/types/experience';
import type { Skill } from '@/types/skill';
import type { Coursework } from '@/types/coursework';
import type { UploadedResume } from '@/types/upload';

function formatDate(d: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ExperiencePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bulletsByExp, setBulletsByExp] = useState<Record<string, ExperienceBullet[]>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [coursework, setCoursework] = useState<Coursework[]>([]);
  const [latestUpload, setLatestUpload] = useState<UploadedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expModalType, setExpModalType] = useState<ExperienceType>('work');
  const [expModalExperience, setExpModalExperience] = useState<Experience | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillModalSkill, setSkillModalSkill] = useState<Skill | null>(null);
  const [courseworkModalOpen, setCourseworkModalOpen] = useState(false);
  const [courseworkModalItem, setCourseworkModalItem] = useState<Coursework | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [profileRes, expRes, skillsRes, courseworkRes, uploadRes] = await Promise.all([
      getProfile(),
      listExperiences(),
      listSkills(),
      listCoursework(),
      getLatestUploadedResume(),
    ]);

    if (profileRes.error) setError(profileRes.error);
    else setProfile(profileRes.data);

    if (expRes.error) setError((e) => e || expRes.error);
    else {
      setExperiences(expRes.data);
      const bullets: Record<string, ExperienceBullet[]> = {};
      for (const exp of expRes.data) {
        const { data } = await listBullets(exp.id);
        bullets[exp.id] = data ?? [];
      }
      setBulletsByExp(bullets);
    }

    if (skillsRes.error) setError((e) => e || skillsRes.error);
    else setSkills(skillsRes.data);

    if (courseworkRes.error) setError((e) => e || courseworkRes.error);
    else setCoursework(courseworkRes.data);

    if (uploadRes.data) setLatestUpload(uploadRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddExperience = (type: ExperienceType) => {
    setExpModalType(type);
    setExpModalExperience(null);
    setExpModalOpen(true);
  };

  const openEditExperience = (exp: Experience) => {
    setExpModalType(exp.type);
    setExpModalExperience(exp);
    setExpModalOpen(true);
  };

  const handleSaveExperience = async (data: ExperienceFormData) => {
    const sortOrder = expModalExperience
      ? expModalExperience.sort_order
      : experiences.filter((e) => e.type === expModalType).length;

    if (expModalExperience) {
      const { error } = await upsertExperience({
        id: expModalExperience.id,
        type: expModalType,
        org: data.org,
        role_title: data.role_title,
        location: data.location || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        is_current: data.is_current,
        sort_order: sortOrder,
      });
      if (error) return;
      await upsertBulletsForExperience(expModalExperience.id, data.bullets);
    } else {
      const { data: created } = await upsertExperience({
        type: expModalType,
        org: data.org,
        role_title: data.role_title,
        location: data.location || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        is_current: data.is_current,
        sort_order: sortOrder,
      });
      if (created && data.bullets.length > 0) {
        await upsertBulletsForExperience(created.id, data.bullets);
      }
    }
    await loadData();
  };

  const handleDeleteExperience = async () => {
    if (!expModalExperience) return;
    await deleteExperience(expModalExperience.id);
    await loadData();
  };

  const handleMoveExperience = async (exp: Experience, direction: 'up' | 'down') => {
    const sameType = experiences.filter((e) => e.type === exp.type).sort((a, b) => a.sort_order - b.sort_order);
    const idx = sameType.findIndex((e) => e.id === exp.id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameType.length) return;
    const swap = sameType[swapIdx];
    const updates = [
      { id: exp.id, sort_order: swap.sort_order },
      { id: swap.id, sort_order: exp.sort_order },
    ];
    await reorderExperiences(updates);
    await loadData();
  };

  const openAddSkill = () => {
    setSkillModalSkill(null);
    setSkillModalOpen(true);
  };

  const openEditSkill = (skill: Skill) => {
    setSkillModalSkill(skill);
    setSkillModalOpen(true);
  };

  const handleSaveSkill = async (data: { name: string; category: string }) => {
    if (skillModalSkill) {
      await upsertSkill({ id: skillModalSkill.id, name: data.name, category: data.category });
    } else {
      await upsertSkill({ name: data.name, category: data.category });
    }
    await loadData();
  };

  const handleDeleteSkill = async () => {
    if (!skillModalSkill) return;
    await deleteSkill(skillModalSkill.id);
    await loadData();
  };

  const openAddCoursework = () => {
    setCourseworkModalItem(null);
    setCourseworkModalOpen(true);
  };

  const openEditCoursework = (c: Coursework) => {
    setCourseworkModalItem(c);
    setCourseworkModalOpen(true);
  };

  const handleSaveCoursework = async (data: { course_code: string; course_name: string; category?: string }) => {
    if (courseworkModalItem) {
      await upsertCoursework({
        id: courseworkModalItem.id,
        course_code: data.course_code,
        course_name: data.course_name,
        category: data.category ?? null,
      });
    } else {
      await upsertCoursework({
        course_code: data.course_code,
        course_name: data.course_name,
        category: data.category ?? null,
      });
    }
    await loadData();
  };

  const handleDeleteCoursework = async () => {
    if (!courseworkModalItem) return;
    await deleteCoursework(courseworkModalItem.id);
    await loadData();
  };

  const handleSaveProfile = async (data: { full_name?: string; headline?: string; bio?: string }) => {
    await updateProfile(data);
    await loadData();
  };

  const projects = experiences.filter((e) => e.type === 'project').sort((a, b) => a.sort_order - b.sort_order);
  const work = experiences.filter((e) => e.type === 'work').sort((a, b) => a.sort_order - b.sort_order);
  const leadership = experiences.filter((e) => e.type === 'leadership').sort((a, b) => a.sort_order - b.sort_order);
  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <PageLayout title="Your Experience">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#ffd93d] animate-spin" strokeWidth={3} />
            <p className="text-white uppercase" style={{ fontWeight: 900 }}>Loading…</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Your Experience">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
        {error && (
          <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-4 text-red-800" style={{ fontWeight: 600 }}>
            {error}
          </div>
        )}

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
                  <h2 className="text-4xl mb-2 uppercase" style={{ fontWeight: 900 }}>
                    {profile?.full_name || 'Your Name'}
                  </h2>
                  <p className="text-lg opacity-75" style={{ fontWeight: 600 }}>
                    {profile?.headline || 'Add your headline'}
                  </p>
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2"
                  style={{ fontWeight: 800 }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <p className="text-base" style={{ fontWeight: 500 }}>
                {profile?.bio || 'Add a short bio in your profile.'}
              </p>
              {latestUpload && (
                <p className="text-sm mt-3 opacity-75" style={{ fontWeight: 600 }}>
                  Latest resume: {latestUpload.file_name} (uploaded {new Date(latestUpload.created_at).toLocaleDateString()})
                </p>
              )}
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
            <button
              onClick={() => openAddExperience('project')}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2"
              style={{ fontWeight: 800 }}
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
          <div className="space-y-4">
            {projects.length === 0 && (
              <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>No projects yet. Add one above.</p>
            )}
            {projects.map((exp, idx) => (
              <div key={exp.id} className="bg-white/80 rounded-2xl p-5 border-2 border-black flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-xl uppercase" style={{ fontWeight: 900 }}>{exp.org}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveExperience(exp, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => handleMoveExperience(exp, 'down')}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => openEditExperience(exp)}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        <Edit className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={async () => {
                          await deleteExperience(exp.id);
                          await loadData();
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm mb-2" style={{ fontWeight: 700 }}>{exp.role_title}</p>
                  <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
                    {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                  </p>
                  <ul className="space-y-2 mt-3">
                    {(bulletsByExp[exp.id] || []).map((b) => (
                      <li key={b.id} className="flex gap-2 text-sm" style={{ fontWeight: 600 }}>
                        <span className="text-black">•</span>
                        {b.bullet}
                      </li>
                    ))}
                  </ul>
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
            <button
              onClick={() => openAddExperience('work')}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2"
              style={{ fontWeight: 800 }}
            >
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {work.length === 0 && (
              <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>No work experience yet. Add one above.</p>
            )}
            {work.map((exp, idx) => (
              <div key={exp.id} className="bg-white/90 rounded-2xl p-5 border-2 border-black flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl uppercase mb-1" style={{ fontWeight: 900 }}>{exp.org}</h4>
                      <p className="text-base mb-1" style={{ fontWeight: 700 }}>{exp.role_title}</p>
                      <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
                        {formatDate(exp.start_date)} – {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveExperience(exp, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => handleMoveExperience(exp, 'down')}
                        disabled={idx === work.length - 1}
                        className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => openEditExperience(exp)}
                        className="p-1 rounded hover:bg-black/10"
                      >
                        <Edit className="w-4 h-4" strokeWidth={3} />
                      </button>
                      <button
                        onClick={async () => {
                          await deleteExperience(exp.id);
                          await loadData();
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-3">
                    {(bulletsByExp[exp.id] || []).map((b) => (
                      <li key={b.id} className="flex gap-2 text-sm" style={{ fontWeight: 600 }}>
                        <span className="text-black">•</span>
                        {b.bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leadership & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <button
                onClick={() => openAddExperience('leadership')}
                className="bg-black text-white px-3 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black"
                style={{ fontWeight: 800 }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {leadership.length === 0 && (
                <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>No leadership entries yet.</p>
              )}
              {leadership.map((exp, idx) => (
                <div key={exp.id} className="bg-white/80 rounded-xl p-4 border-2 border-black flex justify-between items-center">
                  <div>
                    <h4 className="text-base uppercase mb-1" style={{ fontWeight: 900 }}>{exp.org}</h4>
                    <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>{exp.role_title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveExperience(exp, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleMoveExperience(exp, 'down')}
                      disabled={idx === leadership.length - 1}
                      className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" strokeWidth={3} />
                    </button>
                    <button onClick={() => openEditExperience(exp)} className="text-sm" style={{ fontWeight: 700 }}>
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await deleteExperience(exp.id);
                        await loadData();
                      }}
                      className="text-red-600 text-xs"
                      style={{ fontWeight: 700 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

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
              <button
                onClick={openAddSkill}
                className="bg-black text-white px-3 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-1"
                style={{ fontWeight: 800 }}
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>{cat}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span
                        key={s.id}
                        className="bg-white text-black px-3 py-1 rounded-lg text-xs border-2 border-black flex items-center gap-1 cursor-pointer hover:bg-gray-100"
                        style={{ fontWeight: 700 }}
                        onClick={() => openEditSkill(s)}
                      >
                        {s.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSkill(s.id).then(loadData);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>No skills yet. Add some above.</p>
              )}
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
            <button
              onClick={openAddCoursework}
              className="bg-black text-white px-4 py-2 rounded-xl hover:bg-[#333] transition-colors border-2 border-black flex items-center gap-2"
              style={{ fontWeight: 800 }}
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {coursework.length === 0 && (
              <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>No coursework yet. Add one above.</p>
            )}
            {coursework.map((c) => (
              <span
                key={c.id}
                className="bg-white text-black px-4 py-2 rounded-xl text-sm border-2 border-black flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                style={{ fontWeight: 700 }}
                onClick={() => openEditCoursework(c)}
              >
                {c.course_code ? `${c.course_code}: ` : ''}{c.course_name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCoursework(c.id).then(loadData);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <ExperienceModal
        open={expModalOpen}
        onOpenChange={setExpModalOpen}
        type={expModalType}
        experience={expModalExperience}
        bullets={expModalExperience ? (bulletsByExp[expModalExperience.id] || []).map((b) => b.bullet) : []}
        onSave={handleSaveExperience}
        onDelete={expModalExperience ? handleDeleteExperience : undefined}
      />

      <SkillModal
        open={skillModalOpen}
        onOpenChange={setSkillModalOpen}
        skill={skillModalSkill}
        onSave={handleSaveSkill}
        onDelete={skillModalSkill ? handleDeleteSkill : undefined}
      />

      <CourseworkModal
        open={courseworkModalOpen}
        onOpenChange={setCourseworkModalOpen}
        coursework={courseworkModalItem}
        onSave={handleSaveCoursework}
        onDelete={courseworkModalItem ? handleDeleteCoursework : undefined}
      />
    </PageLayout>
  );
}
