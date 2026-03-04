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
import type { Skill } from '@/types/skill';

const CATEGORIES = ['Languages', 'Frameworks', 'Tools', 'Other'];

interface SkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
  onSave: (data: { name: string; category: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function SkillModal({
  open,
  onOpenChange,
  skill,
  onSave,
  onDelete,
}: SkillModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setCategory(skill.category || 'Other');
    } else {
      setName('');
      setCategory('Other');
    }
  }, [skill, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), category });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f1e8] border-4 border-black rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase" style={{ fontWeight: 900 }}>
            {skill ? 'Edit Skill' : 'Add Skill'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Skill Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Category
            </Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border-2 border-black bg-white px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {skill && onDelete && (
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
            disabled={saving || !name.trim()}
            className="bg-black text-white hover:bg-[#333] border-2 border-black"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
