import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import AISuggestionCard from "@/components/AISuggestionCard";
import { planFromInput, type IntentType } from "@/ai/milestones";

// Define the milestone type for the component
interface ComponentMilestone {
  id: string;
  title: string;
  outcome: string;
  video: string;
  videoDescription: string;
  proof: string;
  timeline: string;
  budgetEstimate: string;
}
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Context", sublabel: "Inputs" },
  { number: 3, label: "Rewards", sublabel: "Timeline" },
  { number: 4, label: "Preview", sublabel: "Publish" }
];

const DescribeProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, updateUserEmail } = useUnifiedAuth();
  const { login } = usePrivy();
  
  const [description, setDescription] = useState("");
  const [milestoneList, setMilestoneList] = useState<ComponentMilestone[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<IntentType | null>(null);
  const [lastGeneratedDescription, setLastGeneratedDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [totalTimeline, setTotalTimeline] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDC");
  
  // Email collection state
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

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

  // Check if user needs to provide email
  useEffect(() => {
    if (user && !user.email && !showEmailInput) {
      setShowEmailInput(true);
    } else if (user && user.email && showEmailInput) {
      setShowEmailInput(false);
    }
  }, [user, showEmailInput]);

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
        title: milestone.title || '',
        outcome: milestone.outcome || '',
        video: '', // Not used in new schema
        videoDescription: milestone.proof?.video_description || '',
        proof: milestone.proof?.pull_request_url || '',
        timeline: milestone.timeline || '',
        budgetEstimate: '0' // Default budget estimate
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

  const handleLogin = () => {
    try {
      // Store the intended destination
      localStorage.setItem('intendedDestination', '/hiring/describe-project');
      login();
    } catch (error) {
      console.error('Error opening login modal:', error);
      toast({
        title: "Authentication failed",
        description: "Failed to open authentication modal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEmail(true);
    try {
      const success = await updateUserEmail(email.trim());
      if (success) {
        toast({
          title: "Email saved",
          description: "Your email has been saved successfully.",
        });
        setShowEmailInput(false);
        setEmail("");
      } else {
        toast({
          title: "Email save failed",
          description: "Failed to save your email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving email:', error);
      toast({
        title: "Email save failed",
        description: "An error occurred while saving your email.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleNext = () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a project.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has email
    if (!user.email) {
      toast({
        title: "Email required",
        description: "Please provide your email address so we can contact you about your project.",
        variant: "destructive",
      });
      setShowEmailInput(true);
      return;
    }

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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="p-8 text-center">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Sign in to create your project
                  </h1>
                  <p className="text-gray-600">
                    Please sign in to start creating your project and find the right developers.
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <Button 
                    onClick={handleLogin}
                    className="bg-black hover:bg-gray-800 text-white px-8 py-3"
                  >
                    Sign in to continue
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/hiring")}
                    className="px-8 py-3"
                  >
                    Back to hiring
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

              {/* Email Collection Section */}
              {showEmailInput && (
                <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Email Required</h3>
                      <p className="text-sm text-gray-600">
                        We need your email address to contact you about your project and potential matches.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveEmail}
                        disabled={!email.trim() || isSavingEmail}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {isSavingEmail ? 'Saving...' : 'Save Email'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setShowEmailInput(false)}
                        disabled={isSavingEmail}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={!description.trim() || !user?.email}
                  variant="default"
                  className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!user?.email ? 'Email Required' : 'Next: Context & Inputs'}
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
