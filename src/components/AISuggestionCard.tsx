import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MilestoneCard from "./MilestoneCard";
import { Plus } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  outcome: string;
  video: string;
  videoDescription: string;
  proof: string;
  timeline: string;
  payout: string;
}

interface AISuggestionCardProps {
  milestones: string;
  isGenerating: boolean;
  onInsert: () => void;
  onMilestonesChange?: (milestones: Milestone[]) => void;
}

const AISuggestionCard = ({ milestones, isGenerating, onInsert, onMilestonesChange }: AISuggestionCardProps) => {
  const [milestoneList, setMilestoneList] = useState<Milestone[]>([]);
  const [newMilestoneIds, setNewMilestoneIds] = useState<Set<string>>(new Set());

  // Parse milestones from AI JSON response into structured format
  const parseMilestones = (text: string): Milestone[] => {
    if (!text || typeof text !== 'string') return [];
    
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(text);
      if (Array.isArray(jsonData)) {
        return jsonData.map((milestone, index) => {
          let video = '';
          let videoDescription = '';
          let proof = '';
          
          if (typeof milestone.proof === 'object') {
            video = milestone.proof.video_url || '';
            videoDescription = milestone.proof.video_description || '';
            
            const proofParts = [];
            if (milestone.proof.pull_request_url) {
              proofParts.push(milestone.proof.pull_request_url);
            }
            if (milestone.proof.extra_link) {
              proofParts.push(milestone.proof.extra_link);
            }
            proof = proofParts.join(', ');
          } else {
            proof = milestone.proof || '';
          }
          
          return {
            id: `milestone-${index + 1}`,
            title: milestone.title || '',
            outcome: milestone.outcome || '',
            video: video,
            videoDescription: videoDescription,
            proof: proof,
            timeline: milestone.timeline || '',
            payout: milestone.payout || ''
          };
        });
      }
    } catch (error) {
      console.log('Failed to parse JSON, falling back to text parsing:', error);
    }
    
    // Fallback to text parsing if JSON fails
    const lines = text.split('\n').filter(line => line.trim());
    const milestones: Milestone[] = [];
    let currentMilestone: Partial<Milestone> = {};
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check if this is a numbered milestone start
      if (/^\d+\./.test(trimmed)) {
        if (currentMilestone.title || currentMilestone.outcome) {
          milestones.push(currentMilestone as Milestone);
        }
        // Extract title content and remove "Title:" prefix if present
        const content = trimmed.replace(/^\d+\.\s*/, '');
        const title = content.replace(/^title:\s*/i, '').trim();
        currentMilestone = {
          id: `milestone-${milestones.length + 1}`,
          title: title,
          outcome: '',
          video: '',
          videoDescription: '',
          proof: '',
          timeline: '',
          payout: ''
        };
      } else if (currentMilestone.title && trimmed) {
        // Try to parse structured content
        if (trimmed.toLowerCase().includes('outcome:')) {
          currentMilestone.outcome = trimmed.replace(/outcome:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('video:')) {
          currentMilestone.video = trimmed.replace(/video:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('video description:')) {
          currentMilestone.videoDescription = trimmed.replace(/video description:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('proof:')) {
          currentMilestone.proof = trimmed.replace(/proof:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('timeline:')) {
          currentMilestone.timeline = trimmed.replace(/timeline:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('payout:')) {
          currentMilestone.payout = trimmed.replace(/payout:\s*/i, '');
        } else if (!currentMilestone.outcome) {
          currentMilestone.outcome = trimmed;
        }
      }
    });
    
    if (currentMilestone.title) {
      milestones.push(currentMilestone as Milestone);
    }
    
    return milestones;
  };

  // Update milestone list when AI text changes
  useEffect(() => {
    if (milestones && !isGenerating) {
      const parsed = parseMilestones(milestones);
      setMilestoneList(parsed);
    }
  }, [milestones, isGenerating]);

  // Notify parent when milestone list changes
  useEffect(() => {
    if (onMilestonesChange) {
      onMilestonesChange(milestoneList);
    }
  }, [milestoneList, onMilestonesChange]);

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestoneList(prev => 
      prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
    );
    // Remove from new milestones set once it's been edited
    setNewMilestoneIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(updatedMilestone.id);
      return newSet;
    });
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestoneList(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMilestone = () => {
    const newId = `milestone-${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      title: 'New Milestone',
      outcome: '',
      video: '',
      videoDescription: '',
      proof: '',
      timeline: '',
      payout: ''
    };
    setMilestoneList(prev => [...prev, newMilestone]);
    setNewMilestoneIds(prev => new Set([...prev, newId]));
  };

  return (
    <Card className="p-4 border shadow-sm bg-card">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-card-foreground">Project Milestones</h3>
        </div>
        
        {isGenerating ? (
          <p className="text-xs text-muted-foreground">Generating milestones...</p>
        ) : milestoneList.length > 0 ? (
          <div className="space-y-3">
            {milestoneList.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onUpdate={handleUpdateMilestone}
                onDelete={handleDeleteMilestone}
                isNew={newMilestoneIds.has(milestone.id)}
              />
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddMilestone}
              className="h-7 px-3 text-xs w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Milestone
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">No milestones generated yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddMilestone}
              className="h-7 px-3 text-xs w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Milestone
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AISuggestionCard;
