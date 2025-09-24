import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Acceptance", sublabel: "Criteria" },
  { number: 4, label: "Reward &", sublabel: "Timeline" },
  { number: 5, label: "Preview &", sublabel: "Publish" }
];

const RewardTimeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [rewardAmount, setRewardAmount] = useState("2800");
  const [currency, setCurrency] = useState("USDC");
  const [complexity, setComplexity] = useState("medium");
  const [duration, setDuration] = useState("10");
  
  // Set default date to today
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDate);

  // Get data from previous steps
  const gigData = location.state || {
    title: "Wallet Login + SIWE Protection",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs.",
    acceptanceCriteria: [
      "Route guards enforce auth on protected pages",
      "SIWE session persists & refreshes correctly", 
      "Unit & integration tests pass in CI",
      "Docs include setup, env vars, and edge cases"
    ]
  };

  const formatPrice = () => {
    return `$${rewardAmount}`;
  };

  const formatTimeline = () => {
    return `${duration} days`;
  };

  const formatDueDate = () => {
    const date = new Date(dueDate);
    return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
  };

  // Simplified synchronization functions
  const handleDurationChange = (newDuration: string) => {
    const durationNum = parseInt(newDuration);
    if (isNaN(durationNum) || durationNum < 1) return;
    
    setDuration(newDuration);
    // Calculate new due date based on duration from today
    const today = new Date();
    const newDueDate = new Date(today.getTime() + durationNum * 24 * 60 * 60 * 1000);
    setDueDate(newDueDate.toISOString().split('T')[0]);
  };

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    
    setDueDate(newDate);
    // Calculate duration from today to the selected date
    const today = new Date();
    const selectedDate = new Date(newDate);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDuration(Math.max(1, diffDays).toString());
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
    navigate("/hiring/acceptance-criteria", { state: gigData });
  };

  const handleNext = () => {
    navigate("/hiring/preview-publish", { 
      state: { 
        ...gigData,
        rewardAmount,
        currency,
        complexity,
        duration,
        dueDate
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white font-inter text-contribo-text">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <Card className="p-6 shadow-card border-border bg-card">
            <h1 className="text-2xl font-bold text-card-foreground">Create Milestone Gig</h1>
          </Card>

          {/* Progress Stepper */}
          <div className="px-6">
            <ProgressStepper steps={steps} currentStep={4} />
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-card border-border bg-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-card-foreground">Step 4 · Set reward & timeline</h2>
                  <p className="text-sm text-muted-foreground">
                    Fixed price = faster approvals.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Reward */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Reward</label>
                    <div className="flex gap-4">
                      <div className="relative flex-1 max-w-56">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-card-foreground">$</span>
                        <Input
                          type="number"
                          value={rewardAmount}
                          onChange={(e) => setRewardAmount(e.target.value)}
                          className="pl-8 text-base bg-muted border-border h-11"
                          placeholder="0"
                        />
                      </div>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-32 bg-muted border-border h-11">
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

                  {/* Complexity */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Complexity</label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger className="max-w-md bg-muted border-border h-11">
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

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Duration</label>
                    <div className="flex gap-4">
                      <div className="relative">
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => handleDurationChange(e.target.value)}
                          className="w-56 text-base bg-muted border-border h-11 pr-16"
                          placeholder="0"
                          min="1"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">days</span>
                      </div>
                      <div className="relative">
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-56 text-base bg-muted border-border h-11"
                          min={defaultDate}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDueDate()}</p>
                  </div>
                </div>

                {/* AI Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled
                    className="h-8 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Suggest reward
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                  <Button
                    variant="secondary"
                    disabled
                    className="h-8 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Suggest duration
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-16">
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    className="px-8 py-2 h-11 font-bold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold px-12 py-2 h-11"
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
