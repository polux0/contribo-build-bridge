import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  budgetEstimate: string;
}

interface AISuggestionCardProps {
  milestones: string | any[];
  isGenerating: boolean;
  onInsert?: () => void;
  onTotalBudgetChange?: (budget: string, currency: string) => void;
  onTotalTimelineChange?: (timeline: string) => void;
}

const AISuggestionCard = ({ 
  milestones, 
  isGenerating, 
  onInsert, 
  onTotalBudgetChange, 
  onTotalTimelineChange 
}: AISuggestionCardProps) => {
  const [milestoneList, setMilestoneList] = useState<Milestone[]>([]);
  const [newMilestoneIds, setNewMilestoneIds] = useState<Set<string>>(new Set());
  const [totalTimeline, setTotalTimeline] = useState<string>("");
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDC");

  // Process milestones with useMemo to prevent infinite loops
  const processedMilestones = useMemo(() => {
    if (isGenerating) {
      return [];
    }

    if (!milestones) {
      return [];
    }

    // Handle both string and array inputs
    let milestonesToProcess;
    if (typeof milestones === 'string') {
      try {
        milestonesToProcess = JSON.parse(milestones);
      } catch (error) {
        console.error("❌ Failed to parse milestones string:", error);
        return [];
      }
    } else if (Array.isArray(milestones)) {
      milestonesToProcess = milestones;
    } else {
      console.error("❌ Invalid milestones format:", typeof milestones);
      return [];
    }

    if (Array.isArray(milestonesToProcess) && milestonesToProcess.length > 0) {
      const looksLikeMilestone = (entry: any): entry is Milestone =>
        entry &&
        typeof entry === 'object' &&
        'id' in entry &&
        'title' in entry &&
        'videoDescription' in entry &&
        'budgetEstimate' in entry;

      if (looksLikeMilestone(milestonesToProcess[0])) {
        return milestonesToProcess as Milestone[];
      }

      const formattedMilestones: Milestone[] = milestonesToProcess.map((milestone, index) => ({
        id: `milestone-${index + 1}`,
        title: milestone.title || '',
        outcome: milestone.outcome || '',
        video: '',
        videoDescription: milestone.proof?.video_description || '',
        proof: milestone.proof?.pull_request_url || '',
        timeline: milestone.timeline || '',
        budgetEstimate: milestone.payout || ''
      }));

      return formattedMilestones;
    }
    
    return [];
  }, [milestones, isGenerating]);

  // Update milestoneList when processedMilestones changes
  useEffect(() => {
    setMilestoneList(processedMilestones);
    
    // Calculate totals when milestones change
    if (processedMilestones.length > 0) {
      const totalDays = processedMilestones.reduce((total, milestone) => {
        const timeline = milestone.timeline.replace(/\*\*/g, '');
        const days = parseInt(timeline.match(/\d+/)?.[0] || '0');
        return total + days;
      }, 0);
      
      const totalAmount = processedMilestones.reduce((total, milestone) => {
        const budget = milestone.budgetEstimate.replace(/\*\*/g, '');
        const amount = parseInt(budget.match(/\d+/)?.[0] || '0');
        return total + amount;
      }, 0);
      
      setTotalTimeline(`${totalDays}`);
      setTotalBudget(`${totalAmount}`);
    } else {
      setTotalTimeline("");
      setTotalBudget("");
    }
  }, [processedMilestones]);

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestoneList(prev => 
      prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
    );
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
      budgetEstimate: ''
    };
    setMilestoneList(prev => [...prev, newMilestone]);
    setNewMilestoneIds(prev => new Set([...prev, newId]));
  };

  const handleTimelineChange = (value: string) => {
    setTotalTimeline(value);
    if (onTotalTimelineChange) {
      onTotalTimelineChange(value);
    }
  };

  const handleBudgetChange = (value: string) => {
    setTotalBudget(value);
    if (onTotalBudgetChange) {
      onTotalBudgetChange(value, selectedCurrency);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    if (onTotalBudgetChange) {
      onTotalBudgetChange(totalBudget, currency);
    }
  };

  const currencies = [
    { value: "USDC", label: "USDC" },
    { value: "USDT", label: "USDT" },
    { value: "ETH", label: "ETH" },
    { value: "BTC", label: "BTC" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" }
  ];

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
            
            {/* Total Estimate */}
            {milestoneList.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Total Estimate</h4>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <span className="font-medium text-gray-600">Total Timeline:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        value={totalTimeline}
                        onChange={(e) => handleTimelineChange(e.target.value)}
                        className="text-sm w-20 text-center h-8"
                        placeholder="30"
                      />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="font-medium text-gray-600">Total Budget:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        value={totalBudget}
                        onChange={(e) => handleBudgetChange(e.target.value)}
                        className="text-sm w-20 text-center h-8"
                        placeholder="5000"
                      />
                      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger className="w-16 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No milestones generated yet</p>
        )}
      </div>
    </Card>
  );
};

export default AISuggestionCard;
