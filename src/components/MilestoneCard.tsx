import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Video, GitPullRequest, Edit2, Save, X } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  outcome: string;
  video: string;
  videoDescription: string;
  proof: string;
  timeline: string;
  budgetEstimate: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onUpdate: (milestone: Milestone) => void;
  onDelete: (id: string) => void;
  isNew?: boolean; // Flag to indicate if this is a newly created milestone
}

const MilestoneCard = ({ milestone, onUpdate, onDelete, isNew = false }: MilestoneCardProps) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedMilestone, setEditedMilestone] = useState(milestone);

  // Extract meaningful description from URLs
  const getMeaningfulDescription = (url: string): string => {
    if (!url) return '';
    
    // GitHub/GitLab PR pattern
    const prMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (prMatch) {
      return `PR #${prMatch[3]} in ${prMatch[1]}/${prMatch[2]}`;
    }
    
    // Live link pattern
    const liveMatch = url.match(/https?:\/\/([^\/]+)/);
    if (liveMatch) {
      return `Live demo: ${liveMatch[1]}`;
    }
    
    // Return original if no pattern matches
    return url;
  };

  const handleSave = () => {
    onUpdate(editedMilestone);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMilestone(milestone);
    setIsEditing(false);
  };

  return (
    <Card className={`p-6 border shadow-sm bg-card ${isNew ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-2">
          <h4 className="text-sm font-semibold text-card-foreground">
            {isEditing ? (
              <Input
                value={editedMilestone.title.replace(/\*\*/g, '')}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, title: e.target.value })}
                className="text-sm font-semibold"
                placeholder="Milestone title"
                autoFocus={isNew}
              />
            ) : (
              milestone.title.replace(/\*\*/g, '')
            )}
          </h4>
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                New
              </span>
            )}
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
        </div>

        <div className="space-y-6">
          <div className="pt-4">
            <Label className="text-sm font-semibold text-gray-900">Outcome</Label>
            {isEditing ? (
              <Textarea
                value={editedMilestone.outcome.replace(/\*\*/g, '')}
                onChange={(e) => setEditedMilestone({ ...editedMilestone, outcome: e.target.value })}
                className="text-sm mt-2 min-h-16"
                rows={3}
                placeholder="Describe what the organization will see working..."
              />
            ) : (
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{milestone.outcome.replace(/\*\*/g, '')}</p>
            )}
          </div>

          <div className="space-y-4">
            {/* Proof Required Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Proof Required (on delivery)
              </h4>
              {isEditing ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      Demo video:
                    </Label>
                    <Textarea
                      value={editedMilestone.videoDescription.replace(/\*\*/g, '')}
                      onChange={(e) => setEditedMilestone({ ...editedMilestone, videoDescription: e.target.value })}
                      className="text-sm mt-1"
                      rows={2}
                      placeholder="Show the system streaming payments in real time."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-green-600" />
                      Pull request:
                    </Label>
                    <Input
                      value={editedMilestone.proof.replace(/\*\*/g, '')}
                      onChange={(e) => setEditedMilestone({ ...editedMilestone, proof: e.target.value })}
                      className="text-sm mt-1"
                      placeholder="Link to the code implementing this milestone"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Video className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Demo video:</span>
                      <p className="text-sm text-gray-700 mt-1">{milestone.videoDescription.replace(/\*\*/g, '')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <GitPullRequest className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">Pull request:</span>
                      <div className="mt-1">
                        {milestone.proof ? (
                          <a 
                            href={milestone.proof} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            {getMeaningfulDescription(milestone.proof.replace(/\*\*/g, ''))}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500">No pull request provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        {/* Removed payout section - no longer displayed in describe-need section */}
      </div>
    </Card>
  );
};

export default MilestoneCard;
