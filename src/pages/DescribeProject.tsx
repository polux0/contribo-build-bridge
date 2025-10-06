import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import AISuggestionCard from "@/components/AISuggestionCard";
import { planFromInput, type Milestone, type IntentType } from "@/ai/milestones";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Reward &", sublabel: "Timeline" },
  { number: 4, label: "Preview &", sublabel: "Publish" }
];

const DescribeProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [description, setDescription] = useState(""); // Start with empty string
  const [milestones, setMilestones] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [milestoneList, setMilestoneList] = useState<any[]>([]);
  const [detectedIntent, setDetectedIntent] = useState<IntentType | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastGeneratedDescription, setLastGeneratedDescription] = useState("");
  
  // Add state for total budget and timeline
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [totalTimeline, setTotalTimeline] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDC");
  
  useEffect(() => {
    // Initialize with data from previous step
    if (location.state?.description) {
      setDescription(location.state.description);
      if (location.state.milestones) {
        setMilestones(location.state.milestones);
      } else {
        generateMilestones(location.state.description);
      }
    } else if (location.state?.template) {
      const templateDesc = `Implement ${location.state.template.title}`;
      setDescription(templateDesc);
      generateMilestones(templateDesc);
    }
    // Remove the else clause that auto-generates milestones on initial load
  }, [location.state]);

  // Enhanced debounced milestone generation with better typing detection
  useEffect(() => {
    // Don't generate if description is empty
    if (!description.trim()) {
      setMilestoneList([]);
      setMilestones("");
      setDetectedIntent(null);
      setIsTyping(false);
      return;
    }
    
    // If description changed, immediately clear old milestones and show typing indicator
    if (description !== lastGeneratedDescription) {
      setMilestoneList([]);
      setMilestones("");
      setDetectedIntent(null);
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout - wait for user to stop typing
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      generateMilestones(description);
    }, 1500); // Wait 1.5 seconds after user stops typing
    
    setTypingTimeout(newTimeout);
    
    return () => {
      if (newTimeout) clearTimeout(newTimeout);
    };
  }, [description]);

  const generateMilestones = async (need: string) => {
    if (!need.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const result = await planFromInput(need);
      
      setDetectedIntent(result.intent);
      setLastGeneratedDescription(need);
      
      // Convert the structured milestones to the format expected by AISuggestionCard
      const formattedMilestones = result.milestones.map((milestone, index) => ({
        id: `milestone-${index + 1}`,
        title: milestone.title,
        outcome: milestone.outcome,
        video: '', // Not used in new schema
        videoDescription: milestone.proof.video_description,
        proof: milestone.proof.pull_request_url,
        timeline: milestone.timeline,
        budgetEstimate: milestone.payout
      }));
      
      setMilestoneList(formattedMilestones);
      
      // Also set the raw milestones text for backward compatibility
      const milestonesText = JSON.stringify(result.milestones, null, 2);
      setMilestones(milestonesText);
      
    } catch (error) {
      console.error("❌ MILESTONE GENERATION FAILED:", error);
      setMilestones("Failed to generate milestones. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate("/hiring");
  };

  const handleNext = () => {
    navigate("/hiring/inputs-context", { 
      state: { 
        description: description,
        milestones: milestones,
        milestoneList: milestoneList,
        detectedIntent: detectedIntent,
        totalBudget: totalBudget,
        totalTimeline: totalTimeline,
        selectedCurrency: selectedCurrency
      } 
    });
  };

  const handleInsertSuggestion = () => {
    console.log("Inserting AI suggestion");
  };

  const handleAIAction = (action: string) => {
    // For now, just regenerate milestones with the same description
    generateMilestones(description);
  };

  const handleTotalBudgetChange = (budget: string, currency: string) => {
    setTotalBudget(budget);
    setSelectedCurrency(currency);
  };

  const handleTotalTimelineChange = (timeline: string) => {
    setTotalTimeline(timeline);
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
            <ProgressStepper steps={steps} currentStep={1} />
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-card border-border bg-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Step 1 · Describe what you need</h2>
                  <p className="text-sm text-gray-600">
                    Type a sentence. We'll propose a structured milestone.
                  </p>
                  {detectedIntent && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Detected: {detectedIntent}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Your description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`min-h-14 text-base bg-muted border-border resize-none ${
                        !description.trim() ? 'border-red-300' : ''
                      }`}
                      placeholder="Add wallet login and protect routes with SIWE"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific about what you want to build. Include technical requirements, features, and any constraints. The more detail you provide, the better we can match you with the right developers.
                    </p>
                    {!description.trim() && (
                      <p className="text-xs text-red-600">
                        Please describe what you need before proceeding.
                      </p>
                    )}
                  </div>

                  {/* AI Milestones - Only show when not typing and has content */}
                  {!isTyping && (milestoneList.length > 0 || isGenerating) && (
                    <AISuggestionCard
                      milestones={milestoneList}
                      isGenerating={isGenerating}
                      onInsert={handleInsertSuggestion}
                      onTotalBudgetChange={handleTotalBudgetChange}
                      onTotalTimelineChange={handleTotalTimelineChange}
                    />
                  )}

                  {/* Enhanced typing indicator */}
                  {isTyping && description.trim() && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Waiting for you to finish typing...</span>
                    </div>
                  )}

                  {/* Generating indicator */}
                  {isGenerating && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Generating milestones...</span>
                    </div>
                  )}

                </div>

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
                    disabled={!description.trim()}
                    className="bg-contribo-black hover:bg-gray-800 text-white font-medium px-12 py-2 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default DescribeProject;
