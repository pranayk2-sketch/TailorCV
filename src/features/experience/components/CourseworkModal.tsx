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
import type { Coursework } from '@/types/coursework';

interface CourseworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coursework?: Coursework | null;
  onSave: (data: { course_code: string; course_name: string; category?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function CourseworkModal({
  open,
  onOpenChange,
  coursework,
  onSave,
  onDelete,
}: CourseworkModalProps) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coursework) {
      setCourseCode(coursework.course_code);
      setCourseName(coursework.course_name);
      setCategory(coursework.category ?? '');
    } else {
      setCourseCode('');
      setCourseName('');
      setCategory('');
    }
  }, [coursework, open]);

  const handleSubmit = async () => {
    if (!courseName.trim()) return;
    setSaving(true);
    await onSave({
      course_code: courseCode.trim(),
      course_name: courseName.trim(),
      category: category.trim() || undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f1e8] border-4 border-black rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase" style={{ fontWeight: 900 }}>
            {coursework ? 'Edit Course' : 'Add Course'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Course Code
            </Label>
            <Input
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS 61A"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Course Name *
            </Label>
            <Input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Structure and Interpretation of Computer Programs"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Category
            </Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Core"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {coursework && onDelete && (
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
            disabled={saving || !courseName.trim()}
            className="bg-black text-white hover:bg-[#333] border-2 border-black"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
