import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import MilestoneCard from "@/components/MilestoneCard";
import { Plus, DollarSign, Calendar, X } from "lucide-react";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Reward &", sublabel: "Timeline" },
  { number: 4, label: "Preview &", sublabel: "Publish" }
];

interface MilestoneWithReward {
  id: string;
  title: string;
  outcome: string;
  proof: string;
  videoDescription: string;
  timeline: string;
  payout: string;
  rewardAmount: string;
  currency: string;
  startDate: string;
  endDate: string;
}

const RewardTimeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [milestones, setMilestones] = useState<MilestoneWithReward[]>([]);
  const [currency, setCurrency] = useState("USDC");
  const [complexity, setComplexity] = useState("medium");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Set default date to today
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];

  // Get data from previous steps
  const projectData = location.state || {
    title: "Wallet Login + SIWE Protection",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs.",
    milestoneList: [],
    totalBudget: "",
    totalTimeline: "",
    selectedCurrency: "USDC"
  };

  // Initialize milestones from previous step
  useEffect(() => {
    if (projectData.milestoneList && projectData.milestoneList.length > 0) {
      // Convert milestoneList to MilestoneWithReward format
      const convertedMilestones: MilestoneWithReward[] = projectData.milestoneList.map((milestone: any, index: number) => ({
        id: milestone.id || `milestone-${index + 1}`,
        title: milestone.title || 'New Milestone',
        outcome: milestone.outcome || '',
        proof: milestone.proof || '',
        videoDescription: milestone.videoDescription || '',
        timeline: milestone.timeline || '',
        payout: '25', // Default payout percentage
        rewardAmount: milestone.budgetEstimate || '',
        currency: projectData.selectedCurrency || 'USDC',
        startDate: defaultDate,
        endDate: defaultDate
      }));

      setMilestones(convertedMilestones);
      
      // Distribute budget and timeline if provided
      if (projectData.totalBudget && projectData.totalTimeline) {
        const totalBudget = parseFloat(projectData.totalBudget);
        const totalTimeline = parseInt(projectData.totalTimeline);
        const distributedMilestones = distributeBudgetAndTimeline(convertedMilestones, totalBudget, totalTimeline);
        setMilestones(distributedMilestones);
      }
    }
  }, [projectData.milestoneList, projectData.totalBudget, projectData.totalTimeline, projectData.selectedCurrency, defaultDate]);

  // Fixed distribution function - ensure exact totals
  const distributeBudgetAndTimeline = (
    milestones: MilestoneWithReward[], 
    totalBudget: number, 
    totalTimeline: number
  ): MilestoneWithReward[] => {
    if (milestones.length === 0) return milestones;
    
    // Calculate equal distribution
    const equalPercentage = 100 / milestones.length;
    const baseRewardAmount = totalBudget / milestones.length;
    const baseTimelineDays = totalTimeline / milestones.length;
    
    return milestones.map((milestone, index) => {
      // For the last milestone, use remaining budget/timeline to ensure exact totals
      const isLastMilestone = index === milestones.length - 1;
      
      const rewardAmount = isLastMilestone 
        ? (totalBudget - (baseRewardAmount * (milestones.length - 1))).toFixed(2)
        : baseRewardAmount.toFixed(2);
        
      const timelineDays = isLastMilestone
        ? Math.ceil(totalTimeline - (baseTimelineDays * (milestones.length - 1)))
        : Math.floor(baseTimelineDays);

      return {
        ...milestone,
        rewardAmount: rewardAmount.toString(),
        payout: equalPercentage.toFixed(1),
        timeline: timelineDays.toString()
      };
    });
  };

  const handleUpdateMilestone = (updatedMilestone: MilestoneWithReward) => {
    setMilestones(prev => 
      prev.map(milestone => 
        milestone.id === updatedMilestone.id ? updatedMilestone : milestone
      )
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== id));
  };

  const handleAddMilestone = () => {
    const newMilestone: MilestoneWithReward = {
      id: `milestone-${Date.now()}`,
      title: "New Milestone",
      outcome: "",
      proof: "",
      videoDescription: "",
      timeline: "",
      payout: "25",
      rewardAmount: "",
      currency: currency,
      startDate: defaultDate,
      endDate: defaultDate
    };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const getTotalReward = () => {
    return milestones.reduce((total, milestone) => {
      const amount = parseFloat(milestone.rewardAmount) || 0;
      return total + amount;
    }, 0);
  };

  const getTotalTimeline = () => {
    return milestones.reduce((total, milestone) => {
      const days = parseInt(milestone.timeline) || 0;
      return total + days;
    }, 0);
  };

  const validateMilestones = () => {
    const errors: string[] = [];
    
    milestones.forEach((milestone, index) => {
      if (!milestone.title.trim()) {
        errors.push(`Milestone ${index + 1}: Title is required`);
      }
      if (!milestone.rewardAmount || parseFloat(milestone.rewardAmount) <= 0) {
        errors.push(`Milestone ${index + 1}: Valid reward amount is required`);
      }
      if (!milestone.timeline || parseInt(milestone.timeline) <= 0) {
        errors.push(`Milestone ${index + 1}: Valid timeline is required`);
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateMilestones()) {
      navigate("/hiring/preview-publish", { 
        state: { 
          ...projectData,
          milestones,
          totalReward: getTotalReward(),
          totalTimeline: getTotalTimeline(),
          currency,
          complexity
        } 
      });
    }
  };

  const handleBack = () => {
    navigate("/hiring/inputs-context", { 
      state: {
        ...projectData,
        milestones: milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          outcome: milestone.outcome,
          proof: milestone.proof,
          videoDescription: milestone.videoDescription,
          timeline: milestone.timeline,
          budgetEstimate: milestone.rewardAmount
        }))
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ProgressStepper steps={steps} currentStep={3} />
        
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Set Rewards & Timeline
                </h1>
                <p className="text-gray-600">
                  Configure the rewards and timeline for each milestone.
                </p>
              </div>

              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Summary</h3>
                  <p className="text-sm text-gray-700">{projectData.description}</p>
                </div>

                {/* Milestones Section - Removed global currency selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
                    {/* Removed global currency selector completely */}
                  </div>

                  {/* Milestones List */}
                  {milestones.length > 0 ? (
                    <div className="space-y-4">
                      {milestones.map((milestone) => (
                        <MilestoneCard
                          key={milestone.id}
                          milestone={milestone}
                          onUpdate={handleUpdateMilestone}
                          onDelete={handleDeleteMilestone}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No milestones available. Please go back and generate milestones first.
                    </div>
                  )}

                  {/* Add Milestone Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleAddMilestone}
                      variant="outline"
                      className="h-8 px-3 text-xs w-full"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Milestone
                    </Button>
                  </div>
                </div>

                {/* Summary Section */}
                {milestones.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Project Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-blue-700">Total Reward:</span>
                        <span className="ml-2 text-lg font-bold text-blue-900">
                          ${getTotalReward().toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Total Days:</span>
                        <span className="ml-2 text-lg font-bold text-blue-900">
                          {getTotalTimeline()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={milestones.length === 0}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Next: Preview & Publish
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RewardTimeline;
