import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  milestones: Milestone[];
  isGenerating: boolean;
  onInsert?: (suggestion: string) => void;
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
  const [totalBudget, setTotalBudget] = useState("");
  const [totalTimeline, setTotalTimeline] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  const [newMilestoneIds, setNewMilestoneIds] = useState<Set<string>>(new Set());

  // Process milestones when they change
  const processedMilestones = useMemo(() => {
    if (Array.isArray(milestones) && milestones.length > 0) {
      const looksLikeMilestone = (entry: any): entry is Milestone =>
        entry &&
        typeof entry === 'object' &&
        'id' in entry &&
        'title' in entry &&
        'videoDescription' in entry &&
        'budgetEstimate' in entry;

      if (looksLikeMilestone(milestones[0])) {
        return milestones as Milestone[];
      }
    }
    return [];
  }, [milestones]);

  // Update local state when processed milestones change
  useEffect(() => {
    if (processedMilestones.length > 0) {
      setMilestoneList(processedMilestones);
    }
  }, [processedMilestones]);

  const handleUpdateMilestone = (updatedMilestone: Milestone) => {
    setMilestoneList(prev => 
      prev.map(milestone => 
        milestone.id === updatedMilestone.id ? updatedMilestone : milestone
      )
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestoneList(prev => prev.filter(milestone => milestone.id !== id));
    setNewMilestoneIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleAddMilestone = () => {
    const newId = `milestone-${Date.now()}`;
    const newMilestone: Milestone = {
      id: newId,
      title: "New Milestone",
      outcome: "",
      video: "",
      videoDescription: "",
      proof: "",
      timeline: "",
      budgetEstimate: ""
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

  // Simplified currency options - only USDC and USDT
  const currencies = [
    { value: "USDC", label: "USDC" },
    { value: "USDT", label: "USDT" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">Project Milestones</h3>
      </div>
      
      {/* Milestones List */}
      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Generating milestones...</span>
          </div>
        </div>
      ) : milestoneList.length > 0 ? (
        <div className="space-y-4">
          {milestoneList.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onUpdate={handleUpdateMilestone}
              onDelete={handleDeleteMilestone}
              isNew={newMilestoneIds.has(milestone.id)}
            />
          ))}
        </div>
      ) : null}

      {/* Total Budget and Timeline Controls - Moved to appear right after milestone cards */}
      {milestoneList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Total Timeline</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={totalTimeline}
                onChange={(e) => handleTimelineChange(e.target.value)}
                placeholder="30"
                className="flex-1"
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Total Budget</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={totalBudget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                placeholder="5000"
                className="flex-1"
              />
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-20">
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
      )}

      {/* Add Milestone Button - Only show when milestones are generated */}
      {milestoneList.length > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAddMilestone}
            className="h-8 px-3 text-xs w-full"
            variant="outline"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Milestone
          </Button>
        </div>
      )}
    </div>
  );
};

export default AISuggestionCard;
