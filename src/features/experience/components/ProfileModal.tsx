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
import { Textarea } from '@/app/components/ui/textarea';
import type { Profile } from '@/types/profile';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSave: (data: { full_name?: string; headline?: string; bio?: string }) => Promise<void>;
}

export function ProfileModal({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setHeadline(profile.headline ?? '');
      setBio(profile.bio ?? '');
    } else {
      setFullName('');
      setHeadline('');
      setBio('');
    }
  }, [profile, open]);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave({
      full_name: fullName.trim(),
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5f1e8] border-4 border-black rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl uppercase" style={{ fontWeight: 900 }}>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Headline
            </Label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Software Engineer & Full-Stack Developer"
              className="mt-1 border-2 border-black bg-white"
            />
          </div>

          <div>
            <Label className="text-xs uppercase" style={{ fontWeight: 800 }}>
              Bio
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about you..."
              rows={4}
              className="mt-1 border-2 border-black bg-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-black text-white hover:bg-[#333] border-2 border-black"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
