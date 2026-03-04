import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import type { ParsedResume, ParsedExperience, ParsedSkill, ParsedCoursework } from '@/types/parsedResume';

interface ImportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsed: ParsedResume | null;
  onConfirm: (parsed: ParsedResume) => Promise<void>;
  loading?: boolean;
}

export function ImportPreviewModal({
  open,
  onOpenChange,
  parsed,
  onConfirm,
  loading = false,
}: ImportPreviewModalProps) {
  const [edited, setEdited] = useState<ParsedResume | null>(parsed ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (parsed) setEdited(parsed);
  }, [parsed]);

  const display = edited ?? parsed;
  if (!display) return null;

  const updateExperience = (i: number, field: keyof ParsedExperience, value: string | string[]) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, experiences: [...prev.experiences] };
      next.experiences[i] = { ...next.experiences[i], [field]: value };
      return next;
    });
  };

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, experiences: [...prev.experiences] };
      const bullets = [...(next.experiences[expIdx].bullets || [])];
      bullets[bulletIdx] = value;
      next.experiences[expIdx] = { ...next.experiences[expIdx], bullets };
      return next;
    });
  };

  const removeExperience = (i: number) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, experiences: [...prev.experiences] };
      next.experiences.splice(i, 1);
      return next;
    });
  };

  const removeSkill = (i: number) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, skills: [...prev.skills] };
      next.skills.splice(i, 1);
      return next;
    });
  };

  const updateSkill = (i: number, field: 'name' | 'category', value: string) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, skills: [...prev.skills] };
      next.skills[i] = { ...next.skills[i], [field]: value };
      return next;
    });
  };

  const removeCoursework = (i: number) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, coursework: [...prev.coursework] };
      next.coursework.splice(i, 1);
      return next;
    });
  };

  const updateCoursework = (i: number, field: 'course_code' | 'course_name', value: string) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, coursework: [...prev.coursework] };
      next.coursework[i] = { ...next.coursework[i], [field]: value };
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!edited) return;
    setSaving(true);
    await onConfirm(edited);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f1e8] border-4 border-black rounded-2xl max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase" style={{ fontWeight: 900 }}>
            Import From Resume — Preview
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm opacity-75 mb-4" style={{ fontWeight: 600 }}>
          Review and edit the parsed data before importing. You can change any field.
        </p>

        <div className="space-y-6">
          {display.experiences.length > 0 && (
            <div>
              <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>Experiences</h4>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {display.experiences.map((e: ParsedExperience, i: number) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 border-2 border-black space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="text-xs uppercase opacity-75 block mb-1">Role</label>
                          <input
                            type="text"
                            value={e.role_title}
                            onChange={(ev) => updateExperience(i, 'role_title', ev.target.value)}
                            className="w-full px-2 py-1.5 border-2 border-black rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs uppercase opacity-75 block mb-1">Organization</label>
                          <input
                            type="text"
                            value={e.org}
                            onChange={(ev) => updateExperience(i, 'org', ev.target.value)}
                            className="w-full px-2 py-1.5 border-2 border-black rounded text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeExperience(i)}
                        className="text-red-600 hover:text-red-800 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs uppercase opacity-75 block mb-1">Bullets</label>
                      <div className="space-y-1.5">
                        {(e.bullets || []).map((b, bi) => (
                          <div key={bi} className="flex gap-2 items-start">
                            <span className="text-black/50 mt-1.5">•</span>
                            <input
                              type="text"
                              value={b}
                              onChange={(ev) => updateBullet(i, bi, ev.target.value)}
                              className="flex-1 px-2 py-1.5 border-2 border-black rounded text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {display.skills.length > 0 && (
            <div>
              <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>Skills</h4>
              <div className="flex flex-wrap gap-2">
                {display.skills.map((s: ParsedSkill, i: number) => (
                  <div key={i} className="bg-white px-2 py-1 rounded border-2 border-black text-xs flex items-center gap-1">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(ev) => updateSkill(i, 'name', ev.target.value)}
                      className="w-24 min-w-0 border-b border-black/30 bg-transparent focus:outline-none"
                    />
                    <button onClick={() => removeSkill(i)} className="text-red-600">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {display.coursework.length > 0 && (
            <div>
              <h4 className="text-sm uppercase mb-2" style={{ fontWeight: 900 }}>Coursework</h4>
              <div className="space-y-2">
                {display.coursework.map((c: ParsedCoursework, i: number) => (
                  <div key={i} className="bg-white px-2 py-1.5 rounded border-2 border-black text-xs flex items-center gap-2">
                    <input
                      type="text"
                      value={c.course_code}
                      onChange={(ev) => updateCoursework(i, 'course_code', ev.target.value)}
                      placeholder="Code"
                      className="w-20 min-w-0 border-b border-black/30 bg-transparent focus:outline-none"
                    />
                    <span>:</span>
                    <input
                      type="text"
                      value={c.course_name}
                      onChange={(ev) => updateCoursework(i, 'course_name', ev.target.value)}
                      placeholder="Name"
                      className="flex-1 min-w-0 border-b border-black/30 bg-transparent focus:outline-none"
                    />
                    <button onClick={() => removeCoursework(i)} className="text-red-600">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {display.experiences.length === 0 && display.skills.length === 0 && display.coursework.length === 0 && (
            <p className="text-sm opacity-75" style={{ fontWeight: 600 }}>
              No data to import. The parser may not have detected any sections.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving || (display.experiences.length === 0 && display.skills.length === 0 && display.coursework.length === 0)}
            className="bg-black text-white hover:bg-[#333] border-2 border-black"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing…
              </>
            ) : (
              'Confirm Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
