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
  { number: 2, label: "Context", sublabel: "Inputs" },
  { number: 3, label: "Rewards", sublabel: "Timeline" },
  { number: 4, label: "Preview", sublabel: "Publish" }
];

const DescribeProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [description, setDescription] = useState("");
  const [milestoneList, setMilestoneList] = useState<Milestone[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<IntentType | null>(null);
  const [lastGeneratedDescription, setLastGeneratedDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [totalTimeline, setTotalTimeline] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");

  // Check if user is coming back from a later step
  useEffect(() => {
    if (location.state?.milestoneList && location.state.milestoneList.length > 0) {
      setMilestoneList(location.state.milestoneList);
      setDescription(location.state.description || "");
      setTotalBudget(location.state.totalBudget || "");
      setTotalTimeline(location.state.totalTimeline || "");
      setSelectedCurrency(location.state.selectedCurrency || "USDC");
      setDetectedIntent(location.state.detectedIntent);
    }
  }, [location.state]);

  // Debounced milestone generation - only when user stops typing
  useEffect(() => {
    if (!description.trim()) {
      setMilestoneList([]);
      setDetectedIntent(null);
      return;
    }

    // Don't generate if user is still typing
    if (isTyping) return;
    
    // Don't generate if we already have milestones for this description
    if (lastGeneratedDescription === description && milestoneList.length > 0) return;

    const timeoutId = setTimeout(() => {
      generateMilestones(description);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [description, isTyping, lastGeneratedDescription, milestoneList.length]);

  // Track typing state
  useEffect(() => {
    setIsTyping(true);
    const timeoutId = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timeoutId);
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
        budgetEstimate: milestone.budget_estimate
      }));

      setMilestoneList(formattedMilestones);
    } catch (error) {
      console.error("❌ MILESTONE GENERATION FAILED:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertSuggestion = (suggestion: string) => {
    setDescription(prev => prev + " " + suggestion);
  };

  const handleTotalBudgetChange = (budget: string, currency: string) => {
    setTotalBudget(budget);
    setSelectedCurrency(currency);
  };

  const handleTotalTimelineChange = (timeline: string) => {
    setTotalTimeline(timeline);
  };

  const handleBack = () => {
    navigate("/hiring");
  };

  const handleNext = () => {
    // Only show error if user tries to proceed without description
    if (!description.trim()) {
      return;
    }
    
    navigate("/hiring/inputs-context", { 
      state: { 
        description: description,
        milestones: JSON.stringify(milestoneList),
        milestoneList: milestoneList,
        detectedIntent: detectedIntent,
        totalBudget: totalBudget,
        totalTimeline: totalTimeline,
        selectedCurrency: selectedCurrency
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ProgressStepper steps={steps} currentStep={1} />
        
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Describe Your Project
                </h1>
                <p className="text-gray-600">
                  Tell us what you need built. Be as specific as possible about your requirements.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you need built?
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-14 text-base bg-muted border-border resize-none"
                    placeholder="Add wallet login and protect routes with SIWE"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Be specific about what you want to build. Include technical requirements, features, and any constraints. The more detail you provide, the better we can match you with the right developers.
                  </p>
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
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Analyzing your requirements...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!description.trim()}
                  variant="default"
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Next: Context & Inputs
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

export default DescribeProject;
