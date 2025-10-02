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
import { Plus, DollarSign, Calendar } from "lucide-react";

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

  // Initialize milestones from previous step
  useEffect(() => {
    console.log("Project data:", projectData); // Debug log
    console.log("MilestoneList from project data:", projectData.milestoneList); // Debug log
    
    if (projectData.milestoneList && projectData.milestoneList.length > 0) {
      // Convert milestoneList to MilestoneWithReward format
      const convertedMilestones: MilestoneWithReward[] = projectData.milestoneList.map((milestone: any, index: number) => ({
        id: milestone.id || `milestone-${index + 1}`,
        title: milestone.title || 'New Milestone',
        outcome: milestone.outcome || '',
        proof: milestone.proof || '',
        timeline: milestone.timeline || '3 days',
        payout: milestone.payout || '25%',
        rewardAmount: '0',
        currency: 'USDC',
        dueDate: new Date(Date.now() + (index + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      console.log("Setting converted milestones:", convertedMilestones); // Debug log
      setMilestones(convertedMilestones);
    } else if (projectData.milestones && projectData.milestones.trim()) {
      // Fallback: Parse milestones from AI text
      const parsedMilestones = parseMilestonesFromText(projectData.milestones);
      console.log("Setting parsed milestones:", parsedMilestones); // Debug log
      setMilestones(parsedMilestones);
    } else {
      console.log("No milestones found, using defaults"); // Debug log
      // Create default milestones if none provided
      const defaultMilestones: MilestoneWithReward[] = [
        {
          id: "milestone-1",
          title: "Authentication Setup",
          outcome: "Users can log in with wallet",
          proof: "video demo of login flow",
          timeline: "3 days",
          payout: "30%",
          rewardAmount: "840",
          currency: "USDC",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: "milestone-2", 
          title: "Route Protection",
          outcome: "Protected routes redirect to login",
          proof: "screenshot of redirect behavior",
          timeline: "2 days",
          payout: "20%",
          rewardAmount: "560",
          currency: "USDC",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      setMilestones(defaultMilestones);
    }
  }, [projectData.milestoneList, projectData.milestones]);

  // Parse milestones from AI text
  const parseMilestonesFromText = (text: string): MilestoneWithReward[] => {
    if (!text) return [];
    
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
      timeline: milestone.timeline || '3 days',
      payout: milestone.payout || '25%',
      rewardAmount: milestone.rewardAmount || '0',
      currency: milestone.currency || 'USDC',
      dueDate: milestone.dueDate || defaultDate
    };
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

  const complexityOptions = [
    { value: "simple", label: "Simple (task)" },
    { value: "medium", label: "Medium (milestone)" },
    { value: "complex", label: "Complex (project)" }
  ];

  const currencyOptions = [
    { value: "USDC", label: "USDC" },
    { value: "USDT", label: "USDT" },
    { value: "ETH", label: "ETH" },
    { value: "USD", label: "USD" }
  ];

  const handleSuggestReward = () => {
    console.log("Suggesting reward with AI");
  };

  const handleSuggestDuration = () => {
    console.log("Suggesting duration with AI");
  };

  const handleBack = () => {
    navigate("/hiring/inputs-context", { state: projectData });
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
            <h1 className="text-2xl font-bold text-card-foreground">Create Milestone Project</h1>
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

                {/* Milestones */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Milestone Rewards & Timelines</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <Card key={milestone.id} className="p-4 border shadow-sm bg-card">
                        <div className="space-y-4">
                          {/* Milestone Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-card-foreground">
                                Milestone {index + 1}: {milestone.title.replace(/\*\*/g, '').replace(/^Title:\s*/i, '')}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">{milestone.outcome.replace(/\*\*/g, '')}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMilestone(milestone.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              ×
                            </Button>
                          </div>

                          {/* Reward & Timeline Controls */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Reward Amount */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground">Reward Amount</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-card-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={milestone.rewardAmount}
                                    onChange={(e) => updateMilestone(milestone.id, { rewardAmount: e.target.value })}
                                    className="pl-8 text-sm bg-muted border-border h-9"
                                    placeholder="0"
                                  />
                                </div>
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

                          {/* Milestone Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-muted-foreground">Proof:</span>
                              <span className="ml-2 text-muted-foreground">{milestone.proof.replace(/\*\*/g, '')}</span>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Payout:</span>
                              <span className="ml-2 text-muted-foreground">{milestone.payout.replace(/\*\*/g, '')}</span>
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
                </div>

                {/* Global Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-card-foreground">Global Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Default Currency */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-card-foreground">Default Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="bg-muted border-border h-11">
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

                    {/* Complexity */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-card-foreground">Project Complexity</Label>
                      <Select value={complexity} onValueChange={setComplexity}>
                        <SelectTrigger className="bg-muted border-border h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {complexityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Please fix the following issues:</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc list-inside space-y-1">
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
