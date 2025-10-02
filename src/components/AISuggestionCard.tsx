import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MilestoneCard from "./MilestoneCard";
import { Plus } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  outcome: string;
  proof: string;
  timeline: string;
  payout: string;
}

interface AISuggestionCardProps {
  milestones: string;
  isGenerating: boolean;
  onInsert: () => void;
}

const AISuggestionCard = ({ milestones, isGenerating, onInsert }: AISuggestionCardProps) => {
  const [milestoneList, setMilestoneList] = useState<Milestone[]>([]);

  // Parse milestones from AI text into structured format
  const parseMilestones = (text: string): Milestone[] => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const milestones: Milestone[] = [];
    let currentMilestone: Partial<Milestone> = {};
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check if this is a numbered milestone start
      if (/^\d+\./.test(trimmed)) {
        if (currentMilestone.title) {
          milestones.push(currentMilestone as Milestone);
        }
        currentMilestone = {
          id: `milestone-${milestones.length + 1}`,
          title: trimmed.replace(/^\d+\.\s*/, ''),
          outcome: '',
          proof: '',
          timeline: '',
          payout: ''
        };
      } else if (currentMilestone.title && trimmed) {
        // Try to parse structured content
        if (trimmed.toLowerCase().includes('outcome:')) {
          currentMilestone.outcome = trimmed.replace(/outcome:\s*/i, '');
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

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestoneList(prev => 
      prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestoneList(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: 'New Milestone',
      outcome: '',
      proof: '',
      timeline: '',
      payout: ''
    };
    setMilestoneList(prev => [...prev, newMilestone]);
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
