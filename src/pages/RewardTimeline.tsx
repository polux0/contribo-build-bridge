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
  // { number: 3, label: "Acceptance", sublabel: "Criteria" }, // Commented out for organizations outsourcing
  { number: 3, label: "Reward &", sublabel: "Timeline" },
  { number: 4, label: "Preview &", sublabel: "Publish" }
];

interface MilestoneWithReward {
  id: string;
  title: string;
  outcome: string;
  proof: string;
  videoDescription: string; // Add this field
  timeline: string;
  payout: string;
  rewardAmount: string;
  currency: string;
  dueDate: string;
}

const RewardTimeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [milestones, setMilestones] = useState<MilestoneWithReward[]>([]);
  const [currency, setCurrency] = useState("USDC");
  const [complexity, setComplexity] = useState("medium");
  
  // Set default date to today
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];

  // Get data from previous steps
  const projectData = location.state || {
    title: "Wallet Login + SIWE Protection",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs.",
    milestones: ""
  };

  // Helper function to calculate payout percentage
  const calculatePayoutPercentage = (milestoneReward: string): string => {
    const totalReward = milestones.reduce((sum, m) => sum + parseFloat(m.rewardAmount || '0'), 0);
    const milestoneRewardNum = parseFloat(milestoneReward || '0');
    
    if (totalReward === 0) return '0';
    
    const percentage = (milestoneRewardNum / totalReward) * 100;
    return Math.round(percentage).toString();
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
        timeline: milestone.timeline || '3 days',
        payout: milestone.payout || '25%',
        rewardAmount: '0',
        currency: projectData.selectedCurrency || 'USDC',
        dueDate: new Date(Date.now() + (index + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      // If we have total budget and timeline from previous step, distribute them
      if (projectData.totalBudget && projectData.totalTimeline) {
        const totalBudget = parseFloat(projectData.totalBudget);
        const totalTimeline = parseInt(projectData.totalTimeline);
        
        // Distribute budget and timeline proportionally
        const distributedMilestones = distributeBudgetAndTimeline(
          convertedMilestones, 
          totalBudget, 
          totalTimeline
        );
        
        setMilestones(distributedMilestones);
        setCurrency(projectData.selectedCurrency || 'USDC');
      } else {
        setMilestones(convertedMilestones);
      }
    } else if (projectData.milestones && projectData.milestones.trim()) {
      // Fallback: Parse milestones from AI text
      const parsedMilestones = parseMilestonesFromText(projectData.milestones);
      setMilestones(parsedMilestones);
    } else {
      // Default milestones
      setMilestones([
        {
          id: "milestone-1",
          title: "Setup & Planning",
          outcome: "Project setup and initial planning",
          proof: "",
          videoDescription: "",
          timeline: "2 days",
          payout: "20%",
          rewardAmount: "0",
          currency: "USDC",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: "milestone-2", 
          title: "Core Implementation",
          outcome: "Main feature implementation",
          proof: "",
          videoDescription: "",
          timeline: "5 days",
          payout: "60%",
          rewardAmount: "0",
          currency: "USDC",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: "milestone-3",
          title: "Testing & Documentation",
          outcome: "Testing and documentation",
          proof: "",
          videoDescription: "",
          timeline: "3 days", 
          payout: "20%",
          rewardAmount: "0",
          currency: "USDC",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]);
    }
  }, [projectData]);

  // Parse milestones from AI text
  const parseMilestonesFromText = (text: string): MilestoneWithReward[] => {
    if (!text || typeof text !== 'string') return [];
    
    console.log("Parsing milestones from text:", text); // Debug log
    
    const lines = text.split('\n').filter(line => line.trim());
    const milestones: MilestoneWithReward[] = [];
    let currentMilestone: Partial<MilestoneWithReward> = {};
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for numbered milestones (1., 2., etc.)
      if (/^\d+\./.test(trimmed)) {
        // Save previous milestone if it exists
        if (currentMilestone.title) {
          milestones.push(createMilestoneWithReward(currentMilestone as any));
        }
        // Start new milestone
        currentMilestone = {
          id: `milestone-${milestones.length + 1}`,
          title: trimmed.replace(/^\d+\.\s*/, ''),
          outcome: '',
          proof: '',
          videoDescription: '', // Initialize videoDescription
          timeline: '',
          payout: '',
          rewardAmount: '0',
          currency: 'USDC',
          dueDate: defaultDate
        };
      } else if (currentMilestone.title && trimmed) {
        // Parse milestone details
        if (trimmed.toLowerCase().includes('outcome:')) {
          currentMilestone.outcome = trimmed.replace(/outcome:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('proof:')) {
          currentMilestone.proof = trimmed.replace(/proof:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('timeline:')) {
          currentMilestone.timeline = trimmed.replace(/timeline:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('payout:')) {
          currentMilestone.payout = trimmed.replace(/payout:\s*/i, '');
        } else if (trimmed.toLowerCase().includes('video description:')) {
          currentMilestone.videoDescription = trimmed.replace(/video description:\s*/i, '');
        } else if (!currentMilestone.outcome) {
          // If no specific label, treat as outcome
          currentMilestone.outcome = trimmed;
        }
      }
    });
    
    // Add the last milestone
    if (currentMilestone.title) {
      milestones.push(createMilestoneWithReward(currentMilestone as any));
    }
    
    console.log("Parsed milestones:", milestones); // Debug log
    return milestones;
  };

  const createMilestoneWithReward = (milestone: Partial<MilestoneWithReward>): MilestoneWithReward => {
    return {
      id: milestone.id || `milestone-${Date.now()}`,
      title: milestone.title || 'New Milestone',
      outcome: milestone.outcome || '',
      proof: milestone.proof || '',
      videoDescription: milestone.videoDescription || '', // Ensure videoDescription is set
      timeline: milestone.timeline || '3 days',
      payout: milestone.payout || '25%',
      rewardAmount: milestone.rewardAmount || '0',
      currency: milestone.currency || 'USDC',
      dueDate: milestone.dueDate || defaultDate
    };
  };

  // Fixed distribution function - ensure exact totals
  const distributeBudgetAndTimeline = (
    milestones: MilestoneWithReward[], 
    totalBudget: number, 
    totalTimeline: number
  ): MilestoneWithReward[] => {
    if (milestones.length === 0) return milestones;
    
    // Calculate equal distribution with exact totals
    const equalPercentage = 100 / milestones.length;
    const baseRewardAmount = Math.floor(totalBudget / milestones.length);
    const baseTimelineDays = Math.floor(totalTimeline / milestones.length);
    
    // Calculate remainder to distribute to first milestone
    const rewardRemainder = totalBudget - (baseRewardAmount * milestones.length);
    const timelineRemainder = totalTimeline - (baseTimelineDays * milestones.length);
    
    return milestones.map((milestone, index) => {
      // Add remainder to the first milestone to ensure exact totals
      const rewardAmount = index === 0 
        ? baseRewardAmount + rewardRemainder 
        : baseRewardAmount;
      
      const timelineDays = index === 0 
        ? baseTimelineDays + timelineRemainder 
        : baseTimelineDays;
      
      return {
        ...milestone,
        rewardAmount: rewardAmount.toFixed(0),
        timeline: `${timelineDays} days`,
        currency: projectData.selectedCurrency || 'USDC',
        payout: `${Math.round(equalPercentage)}%`
      };
    });
  };

  // Milestone management functions
  const updateMilestone = (id: string, updates: Partial<MilestoneWithReward>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    // Clear validation errors when user starts making changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const addMilestone = () => {
    const newMilestone: MilestoneWithReward = {
      id: `milestone-${Date.now()}`,
      title: 'New Milestone',
      outcome: '',
      proof: '',
      videoDescription: '', // Initialize videoDescription
      timeline: '3 days',
      payout: '25%',
      rewardAmount: '0',
      currency: 'USDC',
      dueDate: defaultDate
    };
    setMilestones(prev => [...prev, newMilestone]);
    // Clear validation errors when adding milestones
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const getTotalReward = () => {
    return milestones.reduce((total, milestone) => total + parseFloat(milestone.rewardAmount || '0'), 0);
  };

  const getTotalTimeline = () => {
    return milestones.reduce((total, milestone) => {
      const days = parseInt(milestone.timeline?.replace(/\D/g, '') || '0');
      return total + days;
    }, 0);
  };

  // Updated currency options - only USDC and USDT
  const currencyOptions = [
    { value: "USDC", label: "USDC" },
    { value: "USDT", label: "USDT" }
  ];

  const complexityOptions = [
    { value: "simple", label: "Simple (task)" },
    { value: "medium", label: "Medium (milestone)" },
    { value: "complex", label: "Complex (project)" }
  ];

  const handleSuggestReward = () => {
    console.log("Suggesting reward with AI");
  };

  const handleSuggestDuration = () => {
    console.log("Suggesting duration with AI");
  };

  // Updated handleBack to preserve milestone data in the correct format
  const handleBack = () => {
    // Convert MilestoneWithReward back to the format expected by previous steps
    const convertedMilestoneList = milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      outcome: milestone.outcome,
      proof: milestone.proof,
      videoDescription: milestone.videoDescription,
      timeline: milestone.timeline,
      budgetEstimate: milestone.rewardAmount, // Map rewardAmount to budgetEstimate
      payout: milestone.payout
    }));

    // Convert to JSON string for backward compatibility with DescribeProject
    const milestonesJson = JSON.stringify(convertedMilestoneList, null, 2);

    navigate("/hiring/inputs-context", { 
      state: { 
        ...projectData,
        milestoneList: convertedMilestoneList, // Array format for RewardTimeline
        milestones: milestonesJson, // String format for DescribeProject
        totalReward: getTotalReward(),
        totalTimeline: getTotalTimeline(),
        selectedCurrency: currency, // Pass currency as selectedCurrency
        complexity
      } 
    });
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateMilestones = () => {
    const errors: string[] = [];
    
    if (milestones.length === 0) {
      errors.push("Please add at least one milestone.");
    }
    
    milestones.forEach((milestone, index) => {
      if (!milestone.rewardAmount.trim() || parseFloat(milestone.rewardAmount) <= 0) {
        errors.push(`Milestone ${index + 1}: Please enter a valid reward amount.`);
      }
      if (!milestone.timeline.trim()) {
        errors.push(`Milestone ${index + 1}: Please enter a timeline.`);
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

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <Card className="p-6 shadow-card border-border bg-card">
            <h1 className="text-2xl font-bold text-card-foreground">Set Rewards & Timelines</h1>
          </Card>

          {/* Progress Stepper */}
          <div className="px-6">
            <ProgressStepper steps={steps} currentStep={3} />
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-card border-border bg-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Step 3 · Set rewards & timelines</h2>
                  <p className="text-sm text-gray-600">
                    Configure rewards and timelines for each milestone.
                  </p>
                </div>

                {/* Project Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">${getTotalReward().toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Reward</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">{getTotalTimeline()}</div>
                    <div className="text-xs text-muted-foreground">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-card-foreground">{milestones.length}</div>
                    <div className="text-xs text-muted-foreground">Milestones</div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-gray-700">Currency:</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-20 bg-muted border-border h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="p-4 border shadow-sm bg-card">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-card-foreground">
                            Milestone {index + 1}: {milestone.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Reward Amount */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Reward Amount</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={milestone.rewardAmount.replace(/\*\*/g, '')}
                                onChange={(e) => updateMilestone(milestone.id, { rewardAmount: e.target.value })}
                                className="text-sm bg-muted border-border h-9"
                                placeholder="e.g., 1000"
                              />
                              <Select 
                                value={milestone.currency} 
                                onValueChange={(value) => updateMilestone(milestone.id, { currency: value })}
                              >
                                <SelectTrigger className="w-20 bg-muted border-border h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {currencyOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Timeline</Label>
                            <Input
                              value={milestone.timeline.replace(/\*\*/g, '')}
                              onChange={(e) => updateMilestone(milestone.id, { timeline: e.target.value })}
                              className="text-sm bg-muted border-border h-9"
                              placeholder="e.g., 3 days"
                            />
                          </div>

                          {/* Due Date */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                            <Input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) => updateMilestone(milestone.id, { dueDate: e.target.value })}
                              className="text-sm bg-muted border-border h-9"
                              min={defaultDate}
                            />
                          </div>
                        </div>

                        {/* Milestone Details - Stacked vertically */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-medium text-muted-foreground">Video Proof:</span>
                            <span className="ml-2 text-muted-foreground">{milestone.videoDescription.replace(/\*\*/g, '')}</span>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">GitHub Proof:</span>
                            <span className="ml-2 text-muted-foreground">{milestone.proof.replace(/\*\*/g, '')}</span>
                          </div>
                        </div>

                        {/* Dynamic Payout - calculated from reward amounts */}
                        <div className="flex justify-end pt-2">
                          <div className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Payout: {calculatePayoutPercentage(milestone.rewardAmount)}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Add Milestone Button at Bottom */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addMilestone}
                    className="h-8 px-3 text-xs w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Milestone
                  </Button>
                </div>

                {/* Removed Global Settings section completely */}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Please fix the following errors:
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-8 py-2 h-11 font-medium"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-contribo-black hover:bg-gray-800 text-white font-medium px-12 py-2 h-11"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RewardTimeline;
