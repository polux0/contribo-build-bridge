import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  outcome: string;
  proof: string;
  timeline: string;
  payout: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onUpdate: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
}

const MilestoneCard = ({ milestone, onUpdate, onDelete }: MilestoneCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMilestone, setEditedMilestone] = useState(milestone);

  const handleSave = () => {
    onUpdate(editedMilestone);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMilestone(milestone);
    setIsEditing(false);
  };

  return (
    <Card className="p-4 border shadow-sm bg-card">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-card-foreground">
            {isEditing ? (
              <Input
                value={editedMilestone.title.replace(/\*\*/g, '')}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, title: e.target.value })}
                className="text-sm font-semibold"
                placeholder="Milestone title"
              />
            ) : (
              milestone.title.replace(/\*\*/g, '')
            )}
          </h4>
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-6 w-6 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(milestone.id)} className="h-6 w-6 p-0 text-red-500">
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Outcome</Label>
            {isEditing ? (
              <Textarea
                value={editedMilestone.outcome.replace(/\*\*/g, '')}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, outcome: e.target.value })}
                className="text-xs mt-1"
                rows={2}
                placeholder="What the organization will see working"
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1">{milestone.outcome.replace(/\*\*/g, '')}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Proof</Label>
            {isEditing ? (
              <Input
                value={editedMilestone.proof.replace(/\*\*/g, '')}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, proof: e.target.value })}
                className="text-xs mt-1"
                placeholder="video, screenshot, demo_url, etc."
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1">{milestone.proof.replace(/\*\*/g, '')}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-xs font-medium text-muted-foreground">Timeline</Label>
              {isEditing ? (
                <Input
                  value={editedMilestone.timeline.replace(/\*\*/g, '')}
                  onChange={(e) => setEditedMilestone({ ...editedMilestone, timeline: e.target.value })}
                  className="text-xs mt-1"
                  placeholder="e.g., 3 days"
                />
              ) : (
                <p className="text-xs text-muted-foreground mt-1">{milestone.timeline.replace(/\*\*/g, '')}</p>
              )}
            </div>
            <div className="flex-1">
              <Label className="text-xs font-medium text-muted-foreground">Payout</Label>
              {isEditing ? (
                <Input
                  value={editedMilestone.payout.replace(/\*\*/g, '')}
                  onChange={(e) => setEditedMilestone({ ...editedMilestone, payout: e.target.value })}
                  className="text-xs mt-1"
                  placeholder="e.g., 25% or $500"
                />
              ) : (
                <p className="text-xs text-muted-foreground mt-1">{milestone.payout.replace(/\*\*/g, '')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MilestoneCard;
