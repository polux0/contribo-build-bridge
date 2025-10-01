import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import { X, Plus } from "lucide-react";

const steps = [
  { number: 1, label: "Describe", sublabel: "Need" },
  { number: 2, label: "Inputs &", sublabel: "Context" },
  { number: 3, label: "Acceptance", sublabel: "Criteria" },
  { number: 4, label: "Reward &", sublabel: "Timeline" },
  { number: 5, label: "Preview &", sublabel: "Publish" }
];

const AcceptanceCriteria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [criteria, setCriteria] = useState([
    "Pull request URL",
    "Loom demo",
    "Readme / documents updated"
  ]);
  
  const [newCriterion, setNewCriterion] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Get data from previous steps
  const projectData = location.state || {
    title: "Wallet Login + SIWE Protection",
    price: "$2,000–$3,200",
    timeline: "1–2 weeks",
    description: "Implement Web3 wallet auth with SIWE and route guards; include tests and docs."
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion("");
      setIsAdding(false);
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSuggestCriteria = () => {
    // AI action for suggesting criteria
    console.log("Suggesting criteria with AI");
  };

  const handleBack = () => {
    navigate("/hiring/inputs-context", { state: projectData });
  };

  const handleNext = () => {
    // Validate that at least one acceptance criterion is provided
    if (criteria.length === 0) {
      alert("Please add at least one acceptance criterion before proceeding.");
      return;
    }
    
    navigate("/hiring/reward-timeline", { 
      state: { 
        ...projectData, 
        acceptanceCriteria: criteria 
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
                  <h2 className="text-xl font-semibold text-gray-900">Step 3 · Define acceptance criteria</h2>
                  <p className="text-sm text-gray-600">
                    Be specific - what must be true for approval?
                  </p>
                </div>

                {/* Criteria List */}
                <div className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="group relative">
                      <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                        <span className="text-base text-card-foreground flex-1">{criterion}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCriterion(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-4 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new criterion */}
                  {isAdding ? (
                    <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-lg">
                      <Input
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        placeholder="Enter acceptance criterion..."
                        className="border-0 bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:outline-none focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCriterion();
                          if (e.key === "Escape") {
                            setIsAdding(false);
                            setNewCriterion("");
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        onClick={handleAddCriterion}
                        size="sm"
                        className="bg-contribo-black hover:bg-gray-800 text-white font-medium"
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsAdding(true)}
                      className="w-full h-14 border-dashed border-border text-muted-foreground hover:text-card-foreground hover:border-primary/20"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add criterion
                    </Button>
                  )}
                </div>

                {/* AI Action Button */}
                <div className="flex">
                  <Button
                    variant="secondary"
                    disabled
                    className="h-9 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Suggest criteria
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                </div>

                {/* Validation Message */}
                {criteria.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>Required:</strong> Please add at least one acceptance criterion to define what success looks like for this project.
                    </p>
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

export default AcceptanceCriteria;
