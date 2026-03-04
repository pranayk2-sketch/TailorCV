import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import type { Experience, ExperienceType } from '@/types/experience';

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ExperienceType;
  experience?: Experience | null;
  bullets: string[];
  onSave: (data: ExperienceFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export interface ExperienceFormData {
  org: string;
  role_title: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  bullets: string[];
}

export function ExperienceModal({
  open,
  onOpenChange,
  type,
  experience,
  bullets,
  onSave,
  onDelete,
}: ExperienceModalProps) {
  const [org, setOrg] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [bulletList, setBulletList] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (experience) {
      setOrg(experience.org);
      setRoleTitle(experience.role_title);
      setLocation(experience.location ?? '');
      setStartDate(experience.start_date ?? '');
      setEndDate(experience.end_date ?? '');
      setIsCurrent(experience.is_current);
      setBulletList(bullets.length > 0 ? bullets : ['']);
    } else {
      setOrg('');
      setRoleTitle('');
      setLocation('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
      setBulletList(['']);
    }
  }, [experience, bullets, open]);

  const handleAddBullet = () => setBulletList((prev) => [...prev, '']);
  const handleRemoveBullet = (i: number) =>
    setBulletList((prev) => prev.filter((_, idx) => idx !== i));
  const handleBulletChange = (i: number, v: string) =>
    setBulletList((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });

  const handleSubmit = async () => {
    if (!org.trim() || !roleTitle.trim()) return;
    setSaving(true);
    await onSave({
      org: org.trim(),
      role_title: roleTitle.trim(),
      location: location.trim() || '',
      start_date: startDate || '',
      end_date: isCurrent ? '' : endDate,
      is_current: isCurrent,
      bullets: bulletList.filter((b) => b.trim()),
    });
    setSaving(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setSaving(true);
    await onDelete();
    setSaving(false);
    onOpenChange(false);
  };

  const typeLabel =
    type === 'project' ? 'Project' : type === 'work' ? 'Work Experience' : 'Leadership';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f1e8] border-4 border-black rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase" style={{ fontWeight: 900 }}>
            {experience ? `Edit ${typeLabel}` : `Add ${typeLabel}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Role / Title *
            </Label>
            <Input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Software Engineering Intern"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Organization *
            </Label>
            <Input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. Google"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Location
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isCurrent} onCheckedChange={setIsCurrent} />
            <Label className="text-sm" style={{ fontWeight: 700 }}>
              Currently doing this
            </Label>
          </div>

          {!isCurrent && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 border-2 border-black bg-white"
                />
              </div>
              <div>
                <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
                  End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 border-2 border-black bg-white"
                />
              </div>
            </div>
          )}

          {isCurrent && (
            <div>
              <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 border-2 border-black bg-white"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
                Bullets / Description
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddBullet}
                className="border-2 border-black"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {bulletList.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={b}
                    onChange={(e) => handleBulletChange(i, e.target.value)}
                    placeholder="• Bullet point"
                    className="flex-1 border-2 border-black bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBullet(i)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {experience && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !org.trim() || !roleTitle.trim()}
            className="bg-black text-white hover:bg-[#333] border-2 border-black"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
