// COMMENTED OUT FOR ORGANIZATIONS OUTSOURCING - WILL BE USED FOR DEVELOPER USER JOURNEY LATER
// This file contains the acceptance criteria functionality that will be used
// for the developer user journey but is not needed for organizations outsourcing.

/*
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
          <Card className="p-6 shadow-card border-border bg-card">
            <h1 className="text-2xl font-bold text-card-foreground">Create Milestone Project</h1>
          </Card>

          <div className="px-6">
            <ProgressStepper steps={steps} currentStep={3} />
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-card border-border bg-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Step 3 · Set acceptance criteria</h2>
                  <p className="text-sm text-gray-600">
                    Define what constitutes "done" for each milestone.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-card-foreground">Acceptance Criteria</label>
                    <div className="space-y-2">
                      {criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={criterion}
                            onChange={(e) => {
                              const newCriteria = [...criteria];
                              newCriteria[index] = e.target.value;
                              setCriteria(newCriteria);
                            }}
                            className="text-sm bg-muted border-border"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCriterion(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {isAdding ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newCriterion}
                            onChange={(e) => setNewCriterion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCriterion()}
                            className="text-sm bg-muted border-border"
                            placeholder="Enter new criterion..."
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleAddCriterion}
                            className="h-8 px-3"
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsAdding(false)}
                            className="h-8 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsAdding(true)}
                          className="h-8 px-3 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Criterion
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled
                    className="h-8 px-6 text-muted-foreground bg-muted/50 border-muted cursor-not-allowed font-bold text-sm"
                  >
                    Suggest criteria
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Coming Soon</span>
                  </Button>
                </div>

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
*/

// Placeholder export to prevent build errors
const AcceptanceCriteria = () => null;
export default AcceptanceCriteria;