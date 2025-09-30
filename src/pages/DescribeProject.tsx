import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import AISuggestionCard from "@/components/AISuggestionCard";
import { generateAISuggestion, refineAISuggestion } from "@/utils/aiSuggestions";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Acceptance", sublabel: "Criteria" },
  { number: 4, label: "Reward &", sublabel: "Timeline" },
  { number: 5, label: "Preview &", sublabel: "Publish" }
];

const DescribeProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [description, setDescription] = useState("Add wallet login and protect routes with SIWE");
  const [aiSuggestion, setAiSuggestion] = useState(generateAISuggestion("Add wallet login and protect routes with SIWE"));
  
  useEffect(() => {
    // Initialize with data from previous step
    if (location.state?.description) {
      setDescription(location.state.description);
      setAiSuggestion(generateAISuggestion(location.state.description));
    } else if (location.state?.template) {
      const templateDesc = `Implement ${location.state.template.title}`;
      setDescription(templateDesc);
      setAiSuggestion(generateAISuggestion(templateDesc));
    }
  }, [location.state]);

  // Update suggestion when description changes
  useEffect(() => {
    if (description.trim()) {
      const newSuggestion = generateAISuggestion(description);
      setAiSuggestion(newSuggestion);
    }
  }, [description]);

  const handleBack = () => {
    navigate("/hiring");
  };

  const handleNext = () => {
    navigate("/hiring/inputs-context", { 
      state: { 
        title: aiSuggestion.title,
        price: aiSuggestion.price,
        timeline: aiSuggestion.timeline,
        description: aiSuggestion.description
      } 
    });
  };

  const handleInsertSuggestion = () => {
    console.log("Inserting AI suggestion");
  };

  const handleAIAction = (action: string) => {
    const refinedSuggestion = refineAISuggestion(aiSuggestion, action);
    setAiSuggestion(refinedSuggestion);
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
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Your description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-14 text-base bg-muted border-border resize-none"
                      placeholder="Describe what you need..."
                    />
                  </div>

                  {/* AI Suggestion */}
                  <AISuggestionCard 
                    suggestion={aiSuggestion}
                    onInsert={handleInsertSuggestion}
                  />

                  {/* AI Action Chips */}
                  <div className="flex flex-wrap gap-2">
                    {["Refine with AI", "Tighten scope", "Suggest tests"].map((action) => (
                      <Button
                        key={action}
                        variant="secondary"
                        size="sm"
                        disabled
                        className="h-8 px-4 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm relative"
                      >
                        {action}
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                      </Button>
                    ))}
                  </div>
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

export default DescribeProject;
